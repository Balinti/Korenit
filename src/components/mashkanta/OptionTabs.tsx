'use client';

import { MortgageOption } from '@/lib/mortgage/types';
import { DEFAULTS } from '@/lib/mortgage/constants';

interface Props {
  options: MortgageOption[];
  activeIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export default function OptionTabs({ options, activeIndex, onSelect, onAdd, onRemove }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-gray-200 mb-4">
      {options.map((opt, i) => (
        <div key={opt.id} className="flex items-center">
          <button
            onClick={() => onSelect(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              i === activeIndex
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {opt.name}
          </button>
          {options.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation();
                onRemove(i);
              }}
              className="text-gray-400 hover:text-red-500 text-xs mr-1"
              title="הסר אופציה"
            >
              x
            </button>
          )}
        </div>
      ))}
      {options.length < DEFAULTS.maxOptions && (
        <button
          onClick={onAdd}
          className="px-3 py-2 text-sm text-gray-400 hover:text-blue-600 font-medium"
        >
          +
        </button>
      )}
    </div>
  );
}
