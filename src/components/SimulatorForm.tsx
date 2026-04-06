'use client';

import { useState } from 'react';
import { Fund, PortfolioFund, PortfolioResult } from '@/lib/types';
import { simulatePortfolio } from '@/lib/calculations';
import { fetchFundReturns } from '@/lib/datagovil';
import FundPicker from './FundPicker';
import AllocationTable from './AllocationTable';
import ResultsChart from './ResultsChart';
import ResultsSummary from './ResultsSummary';

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

export default function SimulatorForm() {
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [portfolioFunds, setPortfolioFunds] = useState<PortfolioFund[]>([]);
  const [lookbackYears, setLookbackYears] = useState(5);
  const [projectionYears, setProjectionYears] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<PortfolioResult | null>(null);

  const handleAddFund = (fund: Fund) => {
    setPortfolioFunds(prev => [...prev, { fund, allocation: 0 }]);
    setResult(null);
  };

  const handleRemoveFund = (fundId: string) => {
    setPortfolioFunds(prev => prev.filter(f => f.fund.id !== fundId));
    setResult(null);
  };

  const handleAllocationsChange = (funds: PortfolioFund[]) => {
    setPortfolioFunds(funds);
    setResult(null);
  };

  const totalAllocation = portfolioFunds.reduce((sum, f) => sum + f.allocation, 0);
  const isAllocationValid = Math.abs(totalAllocation - 100) < 0.01;

  const handleCalculate = async () => {
    if (portfolioFunds.length === 0) {
      setError('יש לבחור לפחות קופה אחת');
      return;
    }
    if (!isAllocationValid) {
      setError('סכום ההקצאות חייב להיות 100%');
      return;
    }
    if (investmentAmount <= 0) {
      setError('יש להזין סכום השקעה חיובי');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Calculate date range
      const now = new Date();
      const toYear = now.getFullYear();
      const toMonth = String(now.getMonth() + 1).padStart(2, '0');
      const fromDate = new Date(now);
      fromDate.setFullYear(fromDate.getFullYear() - lookbackYears);
      const fromYear = fromDate.getFullYear();
      const fromMonth = String(fromDate.getMonth() + 1).padStart(2, '0');

      const fromPeriod = Number(`${fromYear}${fromMonth}`);
      const toPeriod = Number(`${toYear}${toMonth}`);
      const fundIds = portfolioFunds.map(f => f.fund.id);

      // Fetch returns directly from data.gov.il (public API with CORS)
      const fundReturns = await fetchFundReturns(fundIds, fromPeriod, toPeriod);

      // Inject fund names from our local fund list
      for (const fr of fundReturns) {
        const pf = portfolioFunds.find(f => f.fund.id === fr.fundId);
        if (pf) fr.fundName = pf.fund.name;
      }

      // Run simulation client-side
      const simulationResult = simulatePortfolio(
        investmentAmount,
        portfolioFunds.map(f => ({ fundId: f.fund.id, allocation: f.allocation })),
        fundReturns,
        projectionYears
      );

      setResult(simulationResult);
    } catch (err: any) {
      setError(err.message || 'שגיאה לא צפויה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6" dir="rtl">
      {/* Investment Amount */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-lg font-semibold mb-3">סכום השקעה (₪)</label>
        <input
          type="number"
          min="1000"
          step="1000"
          value={investmentAmount}
          onChange={(e) => {
            setInvestmentAmount(Number(e.target.value));
            setResult(null);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-lg"
          placeholder="100,000"
        />
      </div>

      {/* Fund Selection */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-lg font-semibold mb-3">בחירת קופות</label>
        <FundPicker
          onSelect={handleAddFund}
          selectedFunds={portfolioFunds.map(f => f.fund.id)}
        />
        <div className="mt-4">
          <AllocationTable
            funds={portfolioFunds}
            onChange={handleAllocationsChange}
            onRemove={handleRemoveFund}
          />
        </div>
      </div>

      {/* Period Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">תקופה היסטורית</label>
            <div className="flex flex-wrap gap-2">
              {LOOKBACK_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setLookbackYears(opt.value); setResult(null); }}
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
                  onClick={() => { setProjectionYears(opt.value); setResult(null); }}
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

      {/* Calculate Button */}
      <button
        onClick={handleCalculate}
        disabled={loading || portfolioFunds.length === 0 || !isAllocationValid}
        className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            מחשב...
          </span>
        ) : 'חשב תחזית'}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          <ResultsChart result={result} />
          <ResultsSummary result={result} />
        </div>
      )}
    </div>
  );
}
