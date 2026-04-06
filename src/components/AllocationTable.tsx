'use client';

import { PortfolioFund } from '@/lib/types';

interface AllocationTableProps {
  funds: PortfolioFund[];
  onChange: (funds: PortfolioFund[]) => void;
  onRemove: (fundId: string) => void;
}

export default function AllocationTable({ funds, onChange, onRemove }: AllocationTableProps) {
  const total = funds.reduce((sum, f) => sum + f.allocation, 0);
  const isValid = Math.abs(total - 100) < 0.01;

  const handleAllocationChange = (fundId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const updated = funds.map((f) =>
      f.fund.id === fundId ? { ...f, allocation: numValue } : f
    );
    onChange(updated);
  };

  const handleEqualSplit = () => {
    const equalPct = Math.floor(100 / funds.length);
    const updated = funds.map((f, i) => ({
      ...f,
      allocation: i === funds.length - 1
        ? 100 - equalPct * (funds.length - 1)
        : equalPct,
    }));
    onChange(updated);
  };

  if (funds.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={handleEqualSplit}
          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          חלוקה שווה
        </button>
        <h3 className="text-lg font-semibold">הקצאת אחוזים</h3>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full" dir="rtl">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">קופה</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-600 w-32">אחוז</th>
              <th className="px-4 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {funds.map((pf) => (
              <tr key={pf.fund.id} className="border-t border-gray-100">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900 text-sm">{pf.fund.name}</div>
                  <div className="text-xs text-gray-500">{pf.fund.category}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-gray-500">%</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={pf.allocation || ''}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => handleAllocationChange(pf.fund.id, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onRemove(pf.fund.id)}
                    className="text-red-400 hover:text-red-600 transition-colors text-lg"
                    title="הסר קופה"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={`px-4 py-3 border-t flex items-center justify-between ${
          isValid ? 'bg-green-50' : 'bg-red-50'
        }`}>
          <span className={`text-sm font-medium ${isValid ? 'text-green-700' : 'text-red-700'}`}>
            {isValid ? '✓ סה״כ 100%' : `סה״כ ${total.toFixed(1)}% (נדרש 100%)`}
          </span>
          <span className="text-sm text-gray-600">סה״כ</span>
        </div>
      </div>
    </div>
  );
}
