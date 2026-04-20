/**
 * Generates data/stocks.json with TASE (Israeli) + major global stocks.
 * Run: node scripts/fetch-tase-stocks.mjs
 */
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '../data/stocks.json');

// ---------------------------------------------------------------------------
// TASE — major Israeli stocks (manually curated with Hebrew names + security IDs)
// ---------------------------------------------------------------------------
const TASE_STOCKS = [
  // Banks
  { symbol: 'LUMI', name: 'Bank Leumi', hebrewName: 'בנק לאומי', exchange: 'TASE', securityNumber: '604611', sector: 'Financials' },
  { symbol: 'POLI', name: 'Bank Hapoalim', hebrewName: 'בנק הפועלים', exchange: 'TASE', securityNumber: '695700', sector: 'Financials' },
  { symbol: 'DSCT', name: 'Bank Discount', hebrewName: 'בנק דיסקונט', exchange: 'TASE', securityNumber: '159190', sector: 'Financials' },
  { symbol: 'MZTF', name: 'Mizrahi Tefahot Bank', hebrewName: 'מזרחי טפחות', exchange: 'TASE', securityNumber: '695725', sector: 'Financials' },
  { symbol: 'IGLD', name: 'First International Bank', hebrewName: 'הבינלאומי הראשון', exchange: 'TASE', securityNumber: '492830', sector: 'Financials' },
  { symbol: 'MISH', name: 'Bank Massad', hebrewName: 'בנק מסד', exchange: 'TASE', securityNumber: '159117', sector: 'Financials' },
  // Pharma / Healthcare
  { symbol: 'TEVA', name: 'Teva Pharmaceutical Industries', hebrewName: 'טבע תעשיות פרמצבטיות', exchange: 'TASE', securityNumber: '1120920', sector: 'Healthcare' },
  // Tech
  { symbol: 'NICE', name: 'NICE Systems', hebrewName: 'נייס מערכות', exchange: 'TASE', securityNumber: '1081110', sector: 'Technology' },
  { symbol: 'CHKP', name: 'Check Point Software', hebrewName: 'צ\'ק פוינט', exchange: 'TASE', securityNumber: '1086830', sector: 'Technology' },
  { symbol: 'ESLT', name: 'Elbit Systems', hebrewName: 'אלביט מערכות', exchange: 'TASE', securityNumber: '1131456', sector: 'Industrials' },
  { symbol: 'MNDAI', name: 'Monday.com', hebrewName: 'מאנדיי', exchange: 'TASE', securityNumber: '1191818', sector: 'Technology' },
  { symbol: 'RADI', name: 'Radware', hebrewName: 'רדוור', exchange: 'TASE', securityNumber: '1111209', sector: 'Technology' },
  { symbol: 'CYBRX', name: 'CyberArk', hebrewName: 'סייברארק', exchange: 'TASE', securityNumber: '1163432', sector: 'Technology' },
  { symbol: 'WIX', name: 'Wix.com', hebrewName: 'וויקס', exchange: 'TASE', securityNumber: '1127830', sector: 'Technology' },
  { symbol: 'GLBL', name: 'Global-E Online', hebrewName: 'גלובל-אי אונליין', exchange: 'TASE', securityNumber: '1205578', sector: 'Technology' },
  { symbol: 'FVRR', name: 'Fiverr International', hebrewName: 'פייבר', exchange: 'TASE', securityNumber: '1175832', sector: 'Technology' },
  { symbol: 'SPLAIX', name: 'Sapiens International', hebrewName: 'סאפיינס', exchange: 'TASE', securityNumber: '1111621', sector: 'Technology' },
  { symbol: 'KRNX', name: 'Kornit Digital', hebrewName: 'קורנית דיגיטל', exchange: 'TASE', securityNumber: '1153912', sector: 'Technology' },
  { symbol: 'CEVA', name: 'CEVA Inc.', hebrewName: 'סבה', exchange: 'TASE', securityNumber: '1112801', sector: 'Technology' },
  { symbol: 'AMDOX', name: 'Amdocs', hebrewName: 'אמדוקס', exchange: 'TASE', securityNumber: '1094879', sector: 'Technology' },
  // Telecom
  { symbol: 'BEZQ', name: 'Bezeq', hebrewName: 'בזק', exchange: 'TASE', securityNumber: '1082073', sector: 'Communication Services' },
  { symbol: 'PTNR', name: 'Partner Communications', hebrewName: 'פרטנר', exchange: 'TASE', securityNumber: '1092770', sector: 'Communication Services' },
  { symbol: 'CELX', name: 'Cellcom Israel', hebrewName: 'סלקום', exchange: 'TASE', securityNumber: '1093255', sector: 'Communication Services' },
  { symbol: 'HOT', name: 'HOT Mobile', hebrewName: 'הוט', exchange: 'TASE', securityNumber: '1101958', sector: 'Communication Services' },
  // Energy / Materials
  { symbol: 'ICL', name: 'ICL Group', hebrewName: 'ICL קבוצה', exchange: 'TASE', securityNumber: '1094011', sector: 'Materials' },
  { symbol: 'DLKN', name: 'Delek Group', hebrewName: 'דלק קבוצה', exchange: 'TASE', securityNumber: '476010', sector: 'Energy' },
  { symbol: 'DLEKG', name: 'Delek Drilling', hebrewName: 'דלק קידוחים', exchange: 'TASE', securityNumber: '1135242', sector: 'Energy' },
  { symbol: 'NVNI', name: 'Naphtha Israel Petroleum', hebrewName: 'נפטא', exchange: 'TASE', securityNumber: '359174', sector: 'Energy' },
  { symbol: 'ISRL', name: 'Ratio Oil Exploration', hebrewName: 'רציו', exchange: 'TASE', securityNumber: '1098374', sector: 'Energy' },
  { symbol: 'ENRG', name: 'Energean Oil & Gas', hebrewName: 'אנרג\'יאן', exchange: 'TASE', securityNumber: '1137925', sector: 'Energy' },
  // Real Estate / Construction
  { symbol: 'AZRG', name: 'Azrieli Group', hebrewName: 'קבוצת עזריאלי', exchange: 'TASE', securityNumber: '1100812', sector: 'Real Estate' },
  { symbol: 'AMOT', name: 'Amot Investments', hebrewName: 'עמות', exchange: 'TASE', securityNumber: '1095249', sector: 'Real Estate' },
  { symbol: 'MLSR', name: 'Melisron', hebrewName: 'מליסרון', exchange: 'TASE', securityNumber: '1097442', sector: 'Real Estate' },
  { symbol: 'BSRX', name: 'BSR Real Estate', hebrewName: 'BSR נדל"ן', exchange: 'TASE', securityNumber: '1080671', sector: 'Real Estate' },
  { symbol: 'AFRE', name: 'Africa Israel Residences', hebrewName: 'אפריקה ישראל מגורים', exchange: 'TASE', securityNumber: '1160222', sector: 'Real Estate' },
  { symbol: 'SHAK', name: 'Shikun & Binui', hebrewName: 'שיכון ובינוי', exchange: 'TASE', securityNumber: '523900', sector: 'Real Estate' },
  { symbol: 'SPEN', name: 'Shapir Engineering', hebrewName: 'שפיר הנדסה', exchange: 'TASE', securityNumber: '1150746', sector: 'Industrials' },
  // Insurance / Investment
  { symbol: 'PHOE', name: 'Phoenix Holdings', hebrewName: 'הפניקס', exchange: 'TASE', securityNumber: '1112579', sector: 'Financials' },
  { symbol: 'MGDL', name: 'Migdal Insurance', hebrewName: 'מגדל ביטוח', exchange: 'TASE', securityNumber: '1083907', sector: 'Financials' },
  { symbol: 'CLIS', name: 'Clal Insurance', hebrewName: 'כלל ביטוח', exchange: 'TASE', securityNumber: '1110375', sector: 'Financials' },
  { symbol: 'HARL', name: 'Harel Insurance', hebrewName: 'הראל ביטוח', exchange: 'TASE', securityNumber: '1083899', sector: 'Financials' },
  { symbol: 'ANGI', name: 'Analysts Group', hebrewName: 'אנליסט', exchange: 'TASE', securityNumber: '1097913', sector: 'Financials' },
  // Consumer / Retail
  { symbol: 'SANO', name: 'Sano Consumer Goods', hebrewName: 'סנו', exchange: 'TASE', securityNumber: '577171', sector: 'Consumer Staples' },
  { symbol: 'OSEM', name: 'Osem Investments', hebrewName: 'אסם', exchange: 'TASE', securityNumber: '364630', sector: 'Consumer Staples' },
  { symbol: 'AHAL', name: 'Ahat Group', hebrewName: 'רמי לוי', exchange: 'TASE', securityNumber: '1101370', sector: 'Consumer Staples' },
  { symbol: 'SHVA', name: 'Shufersal', hebrewName: 'שופרסל', exchange: 'TASE', securityNumber: '239230', sector: 'Consumer Staples' },
  { symbol: 'VTEX', name: 'Victory Supermarkets', hebrewName: 'ויקטורי', exchange: 'TASE', securityNumber: '1134195', sector: 'Consumer Staples' },
  // Media / Entertainment
  { symbol: 'SRNX', name: 'Sdarot Media', hebrewName: 'שדרות מדיה', exchange: 'TASE', securityNumber: '1103327', sector: 'Communication Services' },
  // Defence
  { symbol: 'RAFA', name: 'Rafael Advanced Defense Systems', hebrewName: 'רפאל', exchange: 'TASE', securityNumber: '1082859', sector: 'Industrials' },
  { symbol: 'TMTV', name: 'TAT Technologies', hebrewName: 'TAT טכנולוגיות', exchange: 'TASE', securityNumber: '1083121', sector: 'Industrials' },
];

// ---------------------------------------------------------------------------
// Major global stocks (NYSE / NASDAQ)
// ---------------------------------------------------------------------------
const GLOBAL_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'GOOG', name: 'Alphabet Inc. Class C', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', sector: 'Healthcare' },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', exchange: 'NYSE', sector: 'Healthcare' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', exchange: 'NYSE', sector: 'Healthcare' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', exchange: 'NYSE', sector: 'Energy' },
  { symbol: 'CVX', name: 'Chevron Corporation', exchange: 'NYSE', sector: 'Energy' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', exchange: 'NYSE', sector: 'Consumer Staples' },
  { symbol: 'KO', name: 'Coca-Cola Company', exchange: 'NYSE', sector: 'Consumer Staples' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', exchange: 'NASDAQ', sector: 'Consumer Staples' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', exchange: 'NYSE', sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', exchange: 'NYSE', sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer Inc.', exchange: 'NYSE', sector: 'Healthcare' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific Inc.', exchange: 'NYSE', sector: 'Healthcare' },
  { symbol: 'AMGN', name: 'Amgen Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
  { symbol: 'GILD', name: 'Gilead Sciences Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
  { symbol: 'REGN', name: 'Regeneron Pharmaceuticals Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
  { symbol: 'VRTX', name: 'Vertex Pharmaceuticals Inc.', exchange: 'NASDAQ', sector: 'Healthcare' },
  { symbol: 'BAC', name: 'Bank of America Corporation', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'MS', name: 'Morgan Stanley', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'C', name: 'Citigroup Inc.', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'AXP', name: 'American Express Company', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'BLK', name: 'BlackRock Inc.', exchange: 'NYSE', sector: 'Financials' },
  { symbol: 'PYPL', name: 'PayPal Holdings Inc.', exchange: 'NASDAQ', sector: 'Financials' },
  { symbol: 'COIN', name: 'Coinbase Global Inc.', exchange: 'NASDAQ', sector: 'Financials' },
  { symbol: 'HD', name: 'Home Depot Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary' },
  { symbol: 'MCD', name: "McDonald's Corporation", exchange: 'NYSE', sector: 'Consumer Discretionary' },
  { symbol: 'NKE', name: 'Nike Inc.', exchange: 'NYSE', sector: 'Consumer Discretionary' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
  { symbol: 'ABNB', name: 'Airbnb Inc.', exchange: 'NASDAQ', sector: 'Consumer Discretionary' },
  { symbol: 'COST', name: 'Costco Wholesale Corporation', exchange: 'NASDAQ', sector: 'Consumer Staples' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', sector: 'Consumer Staples' },
  { symbol: 'TGT', name: 'Target Corporation', exchange: 'NYSE', sector: 'Consumer Discretionary' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', sector: 'Communication Services' },
  { symbol: 'DIS', name: 'Walt Disney Company', exchange: 'NYSE', sector: 'Communication Services' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', exchange: 'NASDAQ', sector: 'Communication Services' },
  { symbol: 'T', name: 'AT&T Inc.', exchange: 'NYSE', sector: 'Communication Services' },
  { symbol: 'VZ', name: 'Verizon Communications Inc.', exchange: 'NYSE', sector: 'Communication Services' },
  { symbol: 'INTC', name: 'Intel Corporation', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'AMD', name: 'Advanced Micro Devices Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'TXN', name: 'Texas Instruments Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'ORCL', name: 'Oracle Corporation', exchange: 'NYSE', sector: 'Technology' },
  { symbol: 'CRM', name: 'Salesforce Inc.', exchange: 'NYSE', sector: 'Technology' },
  { symbol: 'ADBE', name: 'Adobe Inc.', exchange: 'NASDAQ', sector: 'Technology' },
  { symbol: 'IBM', name: 'IBM Corporation', exchange: 'NYSE', sector: 'Technology' },
  { symbol: 'NOW', name: 'ServiceNow Inc.', exchange: 'NYSE', sector: 'Technology' },
  { symbol: 'SNOW', name: 'Snowflake Inc.', exchange: 'NYSE', sector: 'Technology' },
  { symbol: 'UBER', name: 'Uber Technologies Inc.', exchange: 'NYSE', sector: 'Technology' },
  { symbol: 'BA', name: 'Boeing Company', exchange: 'NYSE', sector: 'Industrials' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', exchange: 'NYSE', sector: 'Industrials' },
  { symbol: 'GE', name: 'GE Aerospace', exchange: 'NYSE', sector: 'Industrials' },
  { symbol: 'LMT', name: 'Lockheed Martin Corporation', exchange: 'NYSE', sector: 'Industrials' },
  { symbol: 'RTX', name: 'RTX Corporation', exchange: 'NYSE', sector: 'Industrials' },
  { symbol: 'UPS', name: 'United Parcel Service Inc.', exchange: 'NYSE', sector: 'Industrials' },
  { symbol: 'FDX', name: 'FedEx Corporation', exchange: 'NYSE', sector: 'Industrials' },
  { symbol: 'NEE', name: 'NextEra Energy Inc.', exchange: 'NYSE', sector: 'Utilities' },
  { symbol: 'AMT', name: 'American Tower Corporation', exchange: 'NYSE', sector: 'Real Estate' },
  { symbol: 'PLD', name: 'Prologis Inc.', exchange: 'NYSE', sector: 'Real Estate' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', exchange: 'NYSE', sector: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq-100 ETF)', exchange: 'NASDAQ', sector: 'ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', exchange: 'NYSE', sector: 'ETF' },
  { symbol: 'GLD', name: 'SPDR Gold Shares ETF', exchange: 'NYSE', sector: 'ETF' },
  { symbol: 'BTC-USD', name: 'Bitcoin USD', exchange: 'Crypto', sector: 'Crypto' },
  { symbol: 'ETH-USD', name: 'Ethereum USD', exchange: 'Crypto', sector: 'Crypto' },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
const allStocks = [...TASE_STOCKS, ...GLOBAL_STOCKS];
writeFileSync(OUTPUT, JSON.stringify(allStocks, null, 2), 'utf-8');
console.log(`Wrote ${allStocks.length} stocks to data/stocks.json`);
console.log(`  TASE: ${TASE_STOCKS.length}`);
console.log(`  Global: ${GLOBAL_STOCKS.length}`);
