import { FundReturns, MonthlyReturn } from './types';

const RESOURCE_ID = 'a30dcbea-a1d2-482c-ae29-8f781f5025fb';
const API_BASE = 'https://data.gov.il/api/3/action/datastore_search';

export async function fetchFundReturns(
  fundIds: string[],
  fromPeriod: number, // YYYYMM as number
  toPeriod: number
): Promise<FundReturns[]> {
  // Fetch all months for all requested funds from data.gov.il
  // We need to use filters for FUND_ID and REPORT_PERIOD range
  const allReturns: FundReturns[] = [];
  const fundMap = new Map<string, { name: string; returns: MonthlyReturn[] }>();

  // Fetch in pages (API limit is 32000)
  const filters = JSON.stringify({ FUND_ID: fundIds.map(Number) });
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  while (hasMore) {
    const url = `${API_BASE}?resource_id=${RESOURCE_ID}&filters=${encodeURIComponent(filters)}&fields=FUND_ID,FUND_NAME,REPORT_PERIOD,MONTHLY_YIELD,TOTAL_ASSETS&sort=REPORT_PERIOD&limit=${limit}&offset=${offset}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error('שגיאה בטעינת נתונים');

    const data = await res.json();
    if (!data.success) throw new Error('שגיאה בטעינת נתונים מ-data.gov.il');

    const records = data.result.records;
    for (const r of records) {
      const period = Number(r.REPORT_PERIOD);
      if (period < fromPeriod || period > toPeriod) continue;

      const fundId = String(r.FUND_ID);
      if (!fundMap.has(fundId)) {
        fundMap.set(fundId, { name: r.FUND_NAME, returns: [] });
      }

      const periodStr = String(period);
      const date = `${periodStr.slice(0, 4)}-${periodStr.slice(4, 6)}`;

      fundMap.get(fundId)!.returns.push({
        date,
        returnPct: Number(r.MONTHLY_YIELD) || 0,
        netAssets: Number(r.TOTAL_ASSETS) || 0,
      });
    }

    hasMore = records.length === limit;
    offset += limit;
  }

  for (const [fundId, data] of fundMap) {
    data.returns.sort((a, b) => a.date.localeCompare(b.date));
    allReturns.push({
      fundId,
      fundName: data.name,
      returns: data.returns,
    });
  }

  return allReturns;
}
