'use client';

import { useState, useRef } from 'react';
import { Stock, StockSimulationResult, StockMonthlyReturn } from '@/lib/stocks/types';
import { fetchStockHistory } from '@/lib/stocks/yahooFinance';
import { calculateAvgAnnualReturn, buildHistoricalPath, buildProjection } from '@/lib/calculations';
import StockSearchBar from './StockSearchBar';
import StockChart from './StockChart';
import StockSummary from './StockSummary';

const LOOKBACK_OPTIONS = [
  { value: 1, label: 'שנה' },
  { value: 3, label: '3 שנים' },
  { value: 5, label: '5 שנים' },
  { value: 10, label: '10 שנים' },
];

const PROJECTION_OPTIONS = [
  { value: 5, label: '5 שנים' },
  { value: 10, label: '10 שנים' },
  { value: 15, label: '15 שנים' },
  { value: 20, label: '20 שנים' },
  { value: 30, label: '30 שנים' },
];

export default function StocksPage() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState(100000);
  const [lookbackYears, setLookbackYears] = useState(5);
  const [projectionYears, setProjectionYears] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<StockSimulationResult | null>(null);

  // Cache fetched returns to allow instant projection-year changes
  const cachedReturns = useRef<{
    symbol: string;
    lookbackYears: number;
    returns: StockMonthlyReturn[];
    investmentAmount: number;
  } | null>(null);

  const invalidateCache = () => {
    cachedReturns.current = null;
    setResult(null);
  };

  const runSimulation = (returns: StockMonthlyReturn[], stock: Stock, amount: number, projYears: number) => {
    const avgReturn = calculateAvgAnnualReturn(returns);
    const historical = buildHistoricalPath(amount, 100, returns);
    const lastHist = historical[historical.length - 1];
    const projected = buildProjection(lastHist.value, avgReturn, projYears, lastHist.date);

    return {
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      avgAnnualReturn: avgReturn,
      historicalData: historical,
      projectedData: projected,
      projectedEndValue: projected.length > 0 ? projected[projected.length - 1].value : amount,
      totalGain:
        projected.length > 0 ? projected[projected.length - 1].value - amount : 0,
      investmentAmount: amount,
    };
  };

  const handleProjectionChange = (years: number) => {
    setProjectionYears(years);
    if (
      cachedReturns.current &&
      selectedStock &&
      cachedReturns.current.symbol === selectedStock.symbol
    ) {
      const sim = runSimulation(
        cachedReturns.current.returns,
        selectedStock,
        cachedReturns.current.investmentAmount,
        years,
      );
      setResult(sim);
    } else {
      setResult(null);
    }
  };

  const handleCalculate = async () => {
    if (!selectedStock) {
      setError('יש לבחור נייר ערך');
      return;
    }
    if (investmentAmount <= 0) {
      setError('יש להזין סכום חיובי');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Try TASE symbol first for Israeli stocks, then the raw symbol
      const symbolsToTry = [selectedStock.symbol];
      // For TASE stocks, Yahoo Finance uses the symbol with .TA suffix
      if (selectedStock.exchange === 'TASE') {
        symbolsToTry.unshift(`${selectedStock.symbol}.TA`);
      }

      let returns: StockMonthlyReturn[] | null = null;
      let lastError = '';

      for (const sym of symbolsToTry) {
        try {
          returns = await fetchStockHistory(sym, lookbackYears);
          if (returns.length > 0) break;
        } catch (e: unknown) {
          lastError = e instanceof Error ? e.message : String(e);
        }
      }

      if (!returns || returns.length === 0) {
        throw new Error(lastError || 'לא נמצאו נתוני מסחר');
      }

      cachedReturns.current = {
        symbol: selectedStock.symbol,
        lookbackYears,
        returns,
        investmentAmount,
      };

      const sim = runSimulation(returns, selectedStock, investmentAmount, projectionYears);
      setResult(sim);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('לא ניתן לטעון נתוני מסחר כרגע. בדוק חיבור אינטרנט ונסה שנית.');
      } else {
        setError(`שגיאה: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* Stock search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-lg font-semibold mb-3">חיפוש נייר ערך</label>
        <StockSearchBar
          selectedStock={selectedStock}
          onSelect={s => {
            setSelectedStock(s);
            invalidateCache();
          }}
        />
        <p className="text-xs text-gray-400 mt-2">
          תומך בביטויים רגולריים — לדוגמה: <code>^בנק</code> למניות בנק, <code>TEVA|NICE</code> לחיפוש מרובה
        </p>
      </div>

      {/* Investment amount */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-lg font-semibold mb-3">סכום השקעה (₪)</label>
        <input
          type="number"
          min="1000"
          step="1000"
          value={investmentAmount}
          onChange={e => {
            setInvestmentAmount(Number(e.target.value));
            invalidateCache();
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
          placeholder="100,000"
        />
      </div>

      {/* Period settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תקופה היסטורית</label>
            <div className="flex flex-wrap gap-2">
              {LOOKBACK_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setLookbackYears(opt.value);
                    invalidateCache();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    lookbackYears === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תקופת תחזית</label>
            <div className="flex flex-wrap gap-2">
              {PROJECTION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleProjectionChange(opt.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    projectionYears === opt.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        disabled={loading || !selectedStock}
        className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            טוען נתוני מסחר...
          </span>
        ) : (
          'חשב תחזית'
        )}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <StockChart result={result} />
          <StockSummary result={result} />
        </div>
      )}
    </div>
  );
}
