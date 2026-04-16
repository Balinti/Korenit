'use client';

import { useState } from 'react';
import { SavingsPlanResult } from '@/lib/mortgage/types';

interface SavingsPlanInput {
  initialAmount: number;
  monthlyAmount: number;
  annualReturn: number;
  years: number;
}

interface Props {
  input: SavingsPlanInput;
  onChange: (input: SavingsPlanInput) => void;
  result: SavingsPlanResult | null;
}

export default function SavingsPlan({ input, onChange, result }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-lg font-semibold text-gray-900"
      >
        <span className={`transition-transform text-sm ${expanded ? 'rotate-90' : ''}`}>
          &#9654;
        </span>
        תוכנית חיסכון
      </button>
      {!expanded && (
        <p className="text-sm text-gray-400 mt-1">
          חישוב חיסכון מצטבר עם תשואה חודשית
        </p>
      )}
      {expanded && (
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">סכום התחלתי (₪)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={input.initialAmount}
                onChange={e =>
                  onChange({ ...input, initialAmount: parseFloat(e.target.value) || 0 })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">הפקדה חודשית (₪)</label>
              <input
                type="number"
                min="0"
                step="100"
                value={input.monthlyAmount}
                onChange={e =>
                  onChange({ ...input, monthlyAmount: parseFloat(e.target.value) || 0 })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">תשואה שנתית (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                value={input.annualReturn}
                onChange={e =>
                  onChange({ ...input, annualReturn: parseFloat(e.target.value) || 0 })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">שנים</label>
              <input
                type="number"
                min="1"
                max="40"
                value={input.years}
                onChange={e =>
                  onChange({ ...input, years: parseInt(e.target.value) || 1 })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {result && (
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
              <div className="text-center">
                <div className="text-xs text-gray-500">סה&quot;כ הפקדות</div>
                <div className="text-lg font-bold text-gray-900">
                  {Math.round(result.totalContributed).toLocaleString('he-IL')} ₪
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">יתרה סופית</div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round(result.finalBalance).toLocaleString('he-IL')} ₪
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">רווח</div>
                <div className="text-lg font-bold text-blue-600">
                  {Math.round(result.totalReturn).toLocaleString('he-IL')} ₪
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
