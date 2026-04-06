import { XMLParser } from 'fast-xml-parser';
import { FundReturns, MonthlyReturn } from './types';

const GEMELNET_URL = 'https://gemelnet.cma.gov.il/tsuot/ui/tsuotHodXML.aspx';

export async function fetchFundReturns(
  fundIds: string[],
  fromDate: string, // YYYYMM
  toDate: string    // YYYYMM
): Promise<FundReturns[]> {
  const url = `${GEMELNET_URL}?miTkfDivuach=${fromDate}&adTkfDivuach=${toDate}&kupot=${fundIds.join(',')}&Dochot=1&sug=3`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`GemelNet request failed: ${response.status}`);
  }

  const xml = await response.text();
  return parseGemelNetXML(xml);
}

export function parseGemelNetXML(xml: string): FundReturns[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  });

  const parsed = parser.parse(xml);

  // GemelNet XML structure:
  // <ROWSET>
  //   <Row>
  //     <ID_KUPA>1162</ID_KUPA>
  //     <TKF_DIVUACH>202401</TKF_DIVUACH>
  //     <TSUA_NOMINALI_BFOAL>0.32</TSUA_NOMINALI_BFOAL>
  //     <YIT_NCHASIM_BFOAL>17933.28</YIT_NCHASIM_BFOAL>
  //   </Row>
  // </ROWSET>
  const rows = parsed?.ROWSET?.Row;
  if (!rows) return [];

  const rowArray = Array.isArray(rows) ? rows : [rows];

  // Group by fund
  const fundMap = new Map<string, { returns: MonthlyReturn[] }>();

  for (const row of rowArray) {
    const fundId = String(row.ID_KUPA || '');
    const period = String(row.TKF_DIVUACH || '');
    const returnPct = parseFloat(row.TSUA_NOMINALI_BFOAL || '0');
    const netAssets = parseFloat(row.YIT_NCHASIM_BFOAL || '0');

    if (!fundId || !period) continue;

    if (!fundMap.has(fundId)) {
      fundMap.set(fundId, { returns: [] });
    }

    // Convert YYYYMM to YYYY-MM
    const periodStr = String(period);
    const date = periodStr.length >= 6
      ? `${periodStr.slice(0, 4)}-${periodStr.slice(4, 6)}`
      : periodStr;

    fundMap.get(fundId)!.returns.push({
      date,
      returnPct,
      netAssets,
    });
  }

  // Sort returns by date for each fund
  const results: FundReturns[] = [];
  for (const [fundId, data] of fundMap) {
    data.returns.sort((a, b) => a.date.localeCompare(b.date));
    results.push({
      fundId,
      fundName: fundId, // GemelNet XML doesn't include fund name; we resolve it client-side
      returns: data.returns,
    });
  }

  return results;
}
