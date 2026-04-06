import { writeFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';
import path from 'path';

// This script attempts to fetch the fund list from GemelNet
// If it fails, it falls back to the existing seed data
async function scrapeFunds() {
  console.log('Attempting to fetch fund list from GemelNet...');

  try {
    // Fetch recent month data to extract fund names
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth()).padStart(2, '0'); // Previous month
    const period = `${year}${month}`;

    const url = `https://gemelnet.cma.gov.il/tsuot/ui/tsuotHodXML.aspx?miTkfDivuach=${period}&adTkfDivuach=${period}&Dochot=1&sug=3`;

    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const xml = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });
    const parsed = parser.parse(xml);

    const rows = parsed?.tsuot?.row;
    if (!rows) throw new Error('No data in response');

    const rowArray = Array.isArray(rows) ? rows : [rows];

    const fundMap = new Map<string, { name: string; category: string }>();
    for (const row of rowArray) {
      const id = String(row.MISPAR_KUPA || row['@_MISPAR_KUPA'] || '');
      const name = String(row.SHEM_KUPA || row['@_SHEM_KUPA'] || '');
      if (id && name && !fundMap.has(id)) {
        fundMap.set(id, { name, category: 'תגמולים' });
      }
    }

    const funds = Array.from(fundMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      category: data.category,
    }));

    if (funds.length > 0) {
      const outPath = path.join(__dirname, '..', 'data', 'funds.json');
      writeFileSync(outPath, JSON.stringify(funds, null, 2), 'utf-8');
      console.log(`Saved ${funds.length} funds to data/funds.json`);
    } else {
      console.log('No funds found, keeping existing seed data');
    }
  } catch (error) {
    console.error('Failed to scrape funds:', error);
    console.log('Keeping existing seed data in data/funds.json');
  }
}

scrapeFunds();
