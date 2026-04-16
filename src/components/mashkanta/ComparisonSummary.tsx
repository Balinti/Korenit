'use client';

import { OptionResult } from '@/lib/mortgage/types';

interface Props {
  results: OptionResult[];
  currentResult: OptionResult | null;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('he-IL');
}

const METRICS: { key: keyof OptionResult['summary']; label: string; best: 'min' | 'max' }[] = [
  { key: 'totalPrincipal', label: 'סה"כ קרן', best: 'min' },
  { key: 'totalInterest', label: 'סה"כ ריבית', best: 'min' },
  { key: 'totalRepayment', label: 'סה"כ החזר', best: 'min' },
  { key: 'maxPayment', label: 'תשלום מקסימלי', best: 'min' },
  { key: 'avgPayment', label: 'תשלום ממוצע', best: 'min' },
  { key: 'totalCpiAdjustment', label: 'עלות הצמדה', best: 'min' },
];

export default function ComparisonSummary({ results, currentResult }: Props) {
  if (results.length === 0) return null;

  // Single option — card grid
  if (results.length === 1 && !currentResult) {
    const s = results[0].summary;
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">סיכום</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {METRICS.map(m => (
            <div key={m.key} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className="text-lg font-bold text-gray-900">{fmt(s[m.key])} ₪</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Multiple options — comparison table
  const allResults = currentResult ? [currentResult, ...results] : results;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">השוואה</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-right py-2 px-3 text-gray-500 font-medium">מדד</th>
              {allResults.map(r => (
                <th key={r.optionId} className="text-center py-2 px-3 text-gray-700 font-semibold">
                  {r.optionName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {METRICS.map(m => {
              const values = allResults.map(r => r.summary[m.key]);
              const bestVal = m.best === 'min' ? Math.min(...values) : Math.max(...values);
              return (
                <tr key={m.key} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-600">{m.label}</td>
                  {allResults.map((r, i) => {
                    const val = r.summary[m.key];
                    const isBest = allResults.length > 1 && val === bestVal;
                    return (
                      <td
                        key={r.optionId}
                        className={`text-center py-2 px-3 font-medium ${
                          isBest ? 'text-green-600' : 'text-gray-900'
                        }`}
                      >
                        {fmt(val)} ₪
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {currentResult && results.length > 0 && (
              <tr className="border-t-2 border-gray-300">
                <td className="py-2 px-3 text-gray-600 font-semibold">חיסכון לעומת נוכחית</td>
                <td className="text-center py-2 px-3 text-gray-400">—</td>
                {results.map(r => {
                  const saving = currentResult.summary.totalRepayment - r.summary.totalRepayment;
                  return (
                    <td
                      key={r.optionId}
                      className={`text-center py-2 px-3 font-bold ${
                        saving > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {saving > 0 ? '+' : ''}{fmt(saving)} ₪
                    </td>
                  );
                })}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
