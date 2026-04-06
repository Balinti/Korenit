import { FundReturns, MonthlyReturn } from './types';

// data.gov.il splits GemelNet data across 3 resources by year range
const RESOURCES = [
  { id: '91c849ed-ddc4-472b-bd09-0f5486cea35c', minYear: 1999, maxYear: 2022 },
  { id: '2016d770-f094-4a2e-983e-797c26479720', minYear: 2023, maxYear: 2023 },
  { id: 'a30dcbea-a1d2-482c-ae29-8f781f5025fb', minYear: 2024, maxYear: 2099 },
];

const API_BASE = 'https://data.gov.il/api/3/action/datastore_search';

export async function fetchFundReturns(
  fundIds: string[],
  fromPeriod: number, // YYYYMM as number
  toPeriod: number
): Promise<FundReturns[]> {
  const fundMap = new Map<string, { name: string; returns: MonthlyReturn[] }>();
  const fromYear = Math.floor(fromPeriod / 100);
  const toYear = Math.floor(toPeriod / 100);

  // Determine which resources we need based on date range
  const neededResources = RESOURCES.filter(
    (r) => r.maxYear >= fromYear && r.minYear <= toYear
  );

  // Fetch from all needed resources in parallel
  const fetches = neededResources.map((resource) =>
    fetchFromResource(resource.id, fundIds, fromPeriod, toPeriod)
  );
  const results = await Promise.all(fetches);

  // Merge results
  for (const records of results) {
    for (const r of records) {
      const fundId = String(r.FUND_ID);
      if (!fundMap.has(fundId)) {
        fundMap.set(fundId, { name: r.FUND_NAME, returns: [] });
      }

      const periodStr = String(r.REPORT_PERIOD);
      const date = `${periodStr.slice(0, 4)}-${periodStr.slice(4, 6)}`;

      fundMap.get(fundId)!.returns.push({
        date,
        returnPct: Number(r.MONTHLY_YIELD) || 0,
        netAssets: Number(r.TOTAL_ASSETS) || 0,
      });
    }
  }

  const allReturns: FundReturns[] = [];
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

interface DataGovRecord {
  FUND_ID: number;
  FUND_NAME: string;
  REPORT_PERIOD: number;
  MONTHLY_YIELD: number;
  TOTAL_ASSETS: number;
}

async function fetchFromResource(
  resourceId: string,
  fundIds: string[],
  fromPeriod: number,
  toPeriod: number
): Promise<DataGovRecord[]> {
  const filters = JSON.stringify({ FUND_ID: fundIds.map(Number) });
  const allRecords: DataGovRecord[] = [];
  let offset = 0;
  const limit = 5000;

  while (true) {
    const url = `${API_BASE}?resource_id=${resourceId}&filters=${encodeURIComponent(filters)}&fields=FUND_ID,FUND_NAME,REPORT_PERIOD,MONTHLY_YIELD,TOTAL_ASSETS&sort=REPORT_PERIOD&limit=${limit}&offset=${offset}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error('שגיאה בטעינת נתונים');

    const data = await res.json();
    if (!data.success) throw new Error('שגיאה בטעינת נתונים מ-data.gov.il');

    const records: DataGovRecord[] = data.result.records;
    for (const r of records) {
      const period = Number(r.REPORT_PERIOD);
      if (period >= fromPeriod && period <= toPeriod) {
        allRecords.push(r);
      }
    }

    if (records.length < limit) break;
    offset += limit;
  }

  return allRecords;
}
