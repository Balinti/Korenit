import { Stock, StockMonthlyReturn } from './types';

const YF_BASE = 'https://query1.finance.yahoo.com';

/** Live search — used only when the stock isn't found in the bundled JSON */
export async function searchYahoo(query: string): Promise<Stock[]> {
  const url = `${YF_BASE}/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0&enableFuzzyQuery=false`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Yahoo search failed: ${res.status}`);
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
}

/**
 * Fetch monthly historical prices and convert to monthly % returns.
 * Yahoo Finance chart API — no auth required, CORS allowed from browser.
 */
export async function fetchStockHistory(
  symbol: string,
  lookbackYears: number,
): Promise<StockMonthlyReturn[]> {
  const range = `${lookbackYears}y`;
  const url = `${YF_BASE}/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1mo&range=${range}`;

  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Yahoo Finance returned ${res.status} for ${symbol}`);

  const data = await res.json();
  const chart = data?.chart?.result?.[0];
  if (!chart) throw new Error(`No data returned for ${symbol}`);

  const timestamps: number[] = chart.timestamp ?? [];
  const closes: (number | null)[] = chart.indicators?.quote?.[0]?.close ?? [];

  if (timestamps.length < 2) throw new Error(`Not enough data for ${symbol}`);

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
