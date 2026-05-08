import { Stock, StockMonthlyReturn } from './types';

// Yahoo Finance blocks direct browser CORS requests — we try multiple strategies.
// Strategy 1: direct (works in some environments / future policy changes)
// Strategy 2: corsproxy.io free proxy
// Strategy 3: allorigins.win free proxy
const YF_CHART = (symbol: string, range: string) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1mo&range=${range}`;

const YF_SEARCH = (q: string) =>
  `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0&enableFuzzyQuery=false`;

/** Wrap a URL through a CORS proxy and fetch JSON */
async function fetchViaProxy(
  targetUrl: string,
  timeoutMs = 12000,
): Promise<Response> {
  const proxies = [
    targetUrl,                                                // direct
    `https://corsproxy.io/?${targetUrl}`,                   // proxy 1
    `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`, // proxy 2
  ];

  let lastErr: unknown;
  for (const url of proxies) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.ok) return res;
      lastErr = new Error(`HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

/** Live search — used only when the stock isn't found in the bundled JSON */
export async function searchYahoo(query: string): Promise<Stock[]> {
  try {
    const res = await fetchViaProxy(YF_SEARCH(query), 8000);
    const data = await res.json();
    const quotes: Record<string, string>[] = data?.quotes ?? [];
    return quotes
      .filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map(q => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        exchange: q.exchDisp || q.exchange || '',
        sector: q.sector || '',
      }));
  } catch {
    return []; // search failure is non-fatal — just show no live results
  }
}

/**
 * Fetch monthly historical prices and convert to monthly % returns.
 * Tries direct Yahoo Finance first, then falls back through CORS proxies.
 */
export async function fetchStockHistory(
  symbol: string,
  lookbackYears: number,
): Promise<StockMonthlyReturn[]> {
  const range = `${lookbackYears}y`;
  const res = await fetchViaProxy(YF_CHART(symbol, range));
  const data = await res.json();

  const chart = data?.chart?.result?.[0];
  if (!chart) throw new Error(`אין נתונים זמינים עבור ${symbol}`);

  const timestamps: number[] = chart.timestamp ?? [];
  const closes: (number | null)[] = chart.indicators?.quote?.[0]?.close ?? [];

  if (timestamps.length < 2) throw new Error(`נתונים לא מספיקים עבור ${symbol}`);

  const returns: StockMonthlyReturn[] = [];
  for (let i = 1; i < timestamps.length; i++) {
    const prev = closes[i - 1];
    const curr = closes[i];
    if (prev == null || curr == null || prev === 0) continue;

    const date = new Date(timestamps[i] * 1000);
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const returnPct = ((curr - prev) / prev) * 100;

    returns.push({ date: dateStr, returnPct, closePrice: curr });
  }

  return returns;
}
