'use client';

import { useState } from 'react';
import { OptionResult } from '@/lib/mortgage/types';

interface Props {
  results: OptionResult[];
  activeOptionIndex: number;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('he-IL');
}

const INITIAL_ROWS = 24;

export default function AmortizationTable({ results, activeOptionIndex }: Props) {
  const [showAll, setShowAll] = useState(false);
  const [selectedOption, setSelectedOption] = useState(activeOptionIndex);

  if (results.length === 0) return null;

  const result = results[Math.min(selectedOption, results.length - 1)];
  const schedule = result.combinedSchedule;
  const displayRows = showAll ? schedule : schedule.slice(0, INITIAL_ROWS);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">לוח סילוקין</h3>
        {results.length > 1 && (
          <select
            value={selectedOption}
            onChange={e => {
              setSelectedOption(parseInt(e.target.value));
              setShowAll(false);
            }}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {results.map((r, i) => (
              <option key={r.optionId} value={i}>
                {r.optionName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white">
            <tr className="border-b border-gray-200">
              <th className="text-right py-2 px-2 text-gray-500 font-medium">#</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">תאריך</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">קרן לפני</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">הצמדה</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">ריבית</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">החזר קרן</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">סה&quot;כ</th>
              <th className="text-right py-2 px-2 text-gray-500 font-medium">יתרה</th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map(row => (
              <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-1.5 px-2 text-gray-400">{row.month}</td>
                <td className="py-1.5 px-2 text-gray-600">{row.date}</td>
                <td className="py-1.5 px-2 text-gray-900">{fmt(row.principalBefore)}</td>
                <td className="py-1.5 px-2 text-amber-600">
                  {row.cpiAdjustment > 0 ? fmt(row.cpiAdjustment) : '—'}
                </td>
                <td className="py-1.5 px-2 text-red-600">{fmt(row.interestPayment)}</td>
                <td className="py-1.5 px-2 text-blue-600">{fmt(row.principalPayment)}</td>
                <td className="py-1.5 px-2 text-gray-900 font-medium">{fmt(row.totalPayment)}</td>
                <td className="py-1.5 px-2 text-gray-900">{fmt(row.principalAfter)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!showAll && schedule.length > INITIAL_ROWS && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          הצג את כל {schedule.length} החודשים
        </button>
      )}
    </div>
  );
}
