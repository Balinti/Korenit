'use client';

import { PortfolioResult } from '@/lib/types';

interface ResultsSummaryProps {
  result: PortfolioResult;
}

export default function ResultsSummary({ result }: ResultsSummaryProps) {
  const formatCurrency = (value: number) => {
    return `₪${Math.round(value).toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6" dir="rtl">
      <h3 className="text-lg font-semibold mb-4">סיכום תחזית</h3>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-sm text-blue-600 mb-1">סכום השקעה</div>
          <div className="text-xl font-bold text-blue-900">{formatCurrency(result.investmentAmount)}</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-sm text-green-600 mb-1">ערך צפוי</div>
          <div className="text-xl font-bold text-green-900">{formatCurrency(result.projectedEndValue)}</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-sm text-purple-600 mb-1">רווח צפוי</div>
          <div className="text-xl font-bold text-purple-900">{formatCurrency(result.totalGain)}</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <div className="text-sm text-amber-600 mb-1">תשואה ממוצעת</div>
          <div className="text-xl font-bold text-amber-900">{formatPercent(result.totalAvgReturn)}</div>
        </div>
      </div>

      {/* Fund breakdown table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-gray-600">קופה</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">הקצאה</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">תשואה שנתית ממוצעת</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">ערך צפוי</th>
            </tr>
          </thead>
          <tbody>
            {result.funds.map((fund) => {
              const endValue = fund.projectedData.length > 0
                ? fund.projectedData[fund.projectedData.length - 1].value
                : 0;
              return (
                <tr key={fund.fundId} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium">{fund.fundName}</div>
                  </td>
                  <td className="px-4 py-3 text-center">{fund.allocation}%</td>
                  <td className="px-4 py-3 text-center">
                    <span className={fund.avgAnnualReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatPercent(fund.avgAnnualReturn)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">{formatCurrency(endValue)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-50 font-semibold">
            <tr className="border-t-2 border-gray-200">
              <td className="px-4 py-3 text-right">סה״כ</td>
              <td className="px-4 py-3 text-center">100%</td>
              <td className="px-4 py-3 text-center">
                <span className={result.totalAvgReturn >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatPercent(result.totalAvgReturn)}
                </span>
              </td>
              <td className="px-4 py-3 text-center">{formatCurrency(result.projectedEndValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        * התחזית מבוססת על תשואות היסטוריות ואינה מהווה המלצת השקעה. ביצועי העבר אינם מבטיחים תשואות עתידיות.
      </p>
    </div>
  );
}
