'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Stock } from '@/lib/stocks/types';
import { searchStocks } from '@/lib/stocks/search';
import { searchYahoo } from '@/lib/stocks/yahooFinance';
import stocksData from '../../../data/stocks.json';

const ALL_STOCKS = stocksData as Stock[];

interface Props {
  onSelect: (stock: Stock) => void;
  selectedStock: Stock | null;
}

export default function StockSearchBar({ onSelect, selectedStock }: Props) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [liveResults, setLiveResults] = useState<Stock[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const liveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Local regex search
  const localResults = useMemo(() => searchStocks(query, ALL_STOCKS), [query]);

  // Live Yahoo Finance fallback — triggers 400ms after typing if local has no results
  useEffect(() => {
    if (liveTimerRef.current) clearTimeout(liveTimerRef.current);
    if (!query.trim() || localResults.length > 0) {
      setLiveResults([]);
      return;
    }
    liveTimerRef.current = setTimeout(async () => {
      setLiveLoading(true);
      try {
        const results = await searchYahoo(query);
        setLiveResults(results);
      } catch {
        setLiveResults([]);
      } finally {
        setLiveLoading(false);
      }
    }, 400);
  }, [query, localResults.length]);

  // Click outside closes dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const allResults = localResults.length > 0 ? localResults : liveResults;
  const showLiveBadge = localResults.length === 0 && liveResults.length > 0;

  const handleSelect = (stock: Stock) => {
    onSelect(stock);
    setQuery('');
    setIsOpen(false);
    setLiveResults([]);
  };

  const handleClear = () => {
    onSelect(null as unknown as Stock);
    setQuery('');
    setIsOpen(false);
  };

  if (selectedStock) {
    return (
      <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <div>
          <span className="font-semibold text-gray-900">{selectedStock.name}</span>
          {selectedStock.hebrewName && (
            <span className="text-gray-500 text-sm mr-2">— {selectedStock.hebrewName}</span>
          )}
          <span className="mr-2 text-xs bg-white border border-gray-200 rounded px-2 py-0.5 text-gray-500">
            {selectedStock.symbol} · {selectedStock.exchange}
          </span>
        </div>
        <button onClick={handleClear} className="text-sm text-red-500 hover:text-red-700 font-medium">
          החלף
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => { if (query.length > 0) setIsOpen(true); }}
        placeholder="חפש לפי שם, סימול, או מספר נייר (תומך בביטויים רגולריים)"
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        dir="rtl"
      />
      {liveLoading && (
        <span className="absolute left-3 top-3 text-xs text-gray-400">מחפש...</span>
      )}
      {isOpen && query.trim() && (
        <div className="absolute top-full right-0 left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-72 overflow-y-auto">
          {showLiveBadge && (
            <div className="px-3 py-1.5 text-xs text-blue-600 border-b border-gray-100 bg-blue-50">
              חיפוש חי — Yahoo Finance
            </div>
          )}
          {allResults.length === 0 && !liveLoading && (
            <div className="px-4 py-3 text-sm text-gray-400">לא נמצאו תוצאות</div>
          )}
          {allResults.map(stock => (
            <button
              key={stock.symbol}
              onClick={() => handleSelect(stock)}
              className="w-full text-right px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between gap-2 border-b border-gray-50 last:border-0"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">{stock.name}</div>
                {stock.hebrewName && (
                  <div className="text-xs text-gray-500 truncate">{stock.hebrewName}</div>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-xs font-mono font-semibold text-gray-700">{stock.symbol}</div>
                <div className="text-xs text-gray-400">{stock.exchange}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
