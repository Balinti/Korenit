'use client';

import { useState, useRef, useEffect } from 'react';
import { Fund } from '@/lib/types';

interface FundPickerProps {
  onSelect: (fund: Fund) => void;
  selectedFunds: string[]; // IDs of already selected funds
}

export default function FundPicker({ onSelect, selectedFunds }: FundPickerProps) {
  const [query, setQuery] = useState('');
  const [funds, setFunds] = useState<Fund[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown on outside click
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 1) {
        setFunds([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/funds?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setFunds(data.filter((f: Fund) => !selectedFunds.includes(f.id)));
      } catch {
        setFunds([]);
      }
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, selectedFunds]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => query.length > 0 && setIsOpen(true)}
        placeholder="חפש קופה לפי שם או מספר..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-right"
        dir="rtl"
      />
      {isOpen && (query.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-3 text-center text-gray-500">טוען...</div>
          ) : funds.length === 0 ? (
            <div className="p-3 text-center text-gray-500">לא נמצאו תוצאות</div>
          ) : (
            funds.map((fund) => (
              <button
                key={fund.id}
                onClick={() => {
                  onSelect(fund);
                  setQuery('');
                  setIsOpen(false);
                }}
                className="w-full px-4 py-3 text-right hover:bg-blue-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <div className="font-medium text-gray-900">{fund.name}</div>
                <div className="text-sm text-gray-500">
                  {fund.category} | מס׳ {fund.id}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
