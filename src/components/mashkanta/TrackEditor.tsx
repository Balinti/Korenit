'use client';

import { MortgageTrack, TrackType } from '@/lib/mortgage/types';
import { TRACK_TYPE_OPTIONS } from '@/lib/mortgage/constants';

interface Props {
  track: MortgageTrack;
  index: number;
  onChange: (track: MortgageTrack) => void;
  onRemove: () => void;
}

export default function TrackEditor({ track, index, onChange, onRemove }: Props) {
  const updateField = <K extends keyof MortgageTrack>(key: K, value: MortgageTrack[K]) => {
    onChange({ ...track, [key]: value });
  };

  const handleTypeChange = (type: TrackType) => {
    const updated: MortgageTrack = {
      ...track,
      type,
      interestRate: type === 'prime' ? 0 : track.interestRate,
      primeSpread: type === 'prime' ? (track.primeSpread ?? -0.5) : undefined,
      ratePeriodYears: type === 'variable-cpi' ? (track.ratePeriodYears ?? 5) : undefined,
      periodRates: type === 'variable-cpi'
        ? (track.periodRates ?? [track.interestRate || 3.5])
        : undefined,
    };
    onChange(updated);
  };

  const handlePeriodRateChange = (idx: number, value: number) => {
    const rates = [...(track.periodRates ?? [])];
    rates[idx] = value;
    onChange({ ...track, periodRates: rates });
  };

  const addPeriodRate = () => {
    const rates = [...(track.periodRates ?? [])];
    rates.push(rates[rates.length - 1] ?? 3.5);
    onChange({ ...track, periodRates: rates });
  };

  const removePeriodRate = (idx: number) => {
    const rates = [...(track.periodRates ?? [])];
    if (rates.length <= 1) return;
    rates.splice(idx, 1);
    onChange({ ...track, periodRates: rates });
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-gray-700">מסלול {index + 1}</h4>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          הסר
        </button>
      </div>

      {/* Track type toggle */}
      <div className="flex gap-1 mb-4">
        {TRACK_TYPE_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => handleTypeChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              track.type === opt.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Common fields */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">סכום (₪)</label>
          <input
            type="number"
            min="0"
            step="10000"
            value={track.principal}
            onChange={e => updateField('principal', parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">שנים</label>
          <input
            type="number"
            min="1"
            max="30"
            value={track.years}
            onChange={e => updateField('years', parseInt(e.target.value) || 1)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        {track.type !== 'prime' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">ריבית שנתית (%)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="20"
              value={track.interestRate}
              onChange={e => updateField('interestRate', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        {track.type === 'prime' && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">מרווח מהפריים (%)</label>
            <input
              type="number"
              step="0.1"
              min="-5"
              max="5"
              value={track.primeSpread ?? 0}
              onChange={e => updateField('primeSpread', parseFloat(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
      </div>

      {/* Variable-rate specific */}
      {track.type === 'variable-cpi' && (
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-xs text-gray-500">שינוי ריבית כל</label>
            <input
              type="number"
              min="1"
              max="15"
              value={track.ratePeriodYears ?? 5}
              onChange={e => updateField('ratePeriodYears', parseInt(e.target.value) || 5)}
              className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-xs text-gray-500">שנים</span>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-500">ריבית לפי תקופה (%):</label>
            {(track.periodRates ?? []).map((rate, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-16">תקופה {i + 1}</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={rate}
                  onChange={e => handlePeriodRateChange(i, parseFloat(e.target.value) || 0)}
                  className="w-24 border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {(track.periodRates?.length ?? 0) > 1 && (
                  <button
                    onClick={() => removePeriodRate(i)}
                    className="text-red-400 hover:text-red-600 text-xs"
                  >
                    x
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addPeriodRate}
              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              + הוסף תקופה
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
