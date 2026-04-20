'use client';

import { StockSimulationResult } from '@/lib/stocks/types';

interface Props {
  result: StockSimulationResult;
}

export default function StockSummary({ result }: Props) {
  const fmt = (v: number) => `₪${Math.round(v).toLocaleString()}`;
  const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6" dir="rtl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">סיכום תחזית</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold text-gray-700">{result.symbol}</span>
          <span className="text-xs bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-gray-500">
            {result.exchange}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">סכום השקעה</div>
          <div className="text-xl font-bold text-blue-900">{fmt(result.investmentAmount)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">ערך צפוי</div>
          <div className="text-xl font-bold text-green-900">{fmt(result.projectedEndValue)}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">רווח צפוי</div>
          <div className="text-xl font-bold text-purple-900">{fmt(result.totalGain)}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className={`text-sm mb-1 ${result.avgAnnualReturn >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
            תשואה שנתית ממוצעת
          </div>
          <div className={`text-xl font-bold ${result.avgAnnualReturn >= 0 ? 'text-amber-900' : 'text-red-700'}`}>
            {fmtPct(result.avgAnnualReturn)}
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        * התחזית מבוססת על תשואות היסטוריות ואינה מהווה המלצת השקעה. ביצועי העבר אינם מבטיחים תשואות עתידיות.
      </p>
    </div>
  );
}
