'use client';

import { GlobalSettings as GlobalSettingsType } from '@/lib/mortgage/types';

interface Props {
  settings: GlobalSettingsType;
  onChange: (settings: GlobalSettingsType) => void;
}

export default function GlobalSettings({ settings, onChange }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">הגדרות כלליות</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            יעד אינפלציה שנתי (%)
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="20"
            value={settings.annualCpiTarget}
            onChange={e =>
              onChange({ ...settings, annualCpiTarget: parseFloat(e.target.value) || 0 })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ריבית פריים נוכחית (%)
          </label>
          <input
            type="number"
            step="0.25"
            min="0"
            max="20"
            value={settings.currentPrimeRate}
            onChange={e =>
              onChange({ ...settings, currentPrimeRate: parseFloat(e.target.value) || 0 })
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            תאריך התחלה
          </label>
          <input
            type="month"
            value={settings.startDate}
            onChange={e => onChange({ ...settings, startDate: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
