'use client';

import { useState } from 'react';
import { MortgageOption } from '@/lib/mortgage/types';
import OptionBuilder from './OptionBuilder';

interface Props {
  mortgage: MortgageOption | null;
  onChange: (mortgage: MortgageOption | null) => void;
}

export default function CurrentMortgage({ mortgage, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    if (!expanded && !mortgage) {
      onChange({
        id: 'current',
        name: 'משכנתא נוכחית',
        tracks: [],
      });
    }
    setExpanded(!expanded);
  };

  const handleClear = () => {
    onChange(null);
    setExpanded(false);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <button
          onClick={handleToggle}
          className="flex items-center gap-2 text-lg font-semibold text-gray-900"
        >
          <span className={`transition-transform text-sm ${expanded ? 'rotate-90' : ''}`}>
            &#9654;
          </span>
          משכנתא נוכחית
        </button>
        {mortgage && (
          <button
            onClick={handleClear}
            className="text-sm text-red-500 hover:text-red-700"
          >
            נקה
          </button>
        )}
      </div>
      {!expanded && (
        <p className="text-sm text-gray-400 mt-1">
          {mortgage && mortgage.tracks.length > 0
            ? `${mortgage.tracks.length} מסלולים, ${mortgage.tracks.reduce((s, t) => s + t.principal, 0).toLocaleString('he-IL')} ₪`
            : 'אופציונלי — להשוואת חיסכון בין ישנה לחדשה'}
        </p>
      )}
      {expanded && mortgage && (
        <div className="mt-4">
          <OptionBuilder option={mortgage} onChange={o => onChange(o)} />
        </div>
      )}
    </div>
  );
}
