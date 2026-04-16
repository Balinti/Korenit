'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { OptionResult } from '@/lib/mortgage/types';

interface Props {
  results: OptionResult[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

type ChartView = 'payment' | 'balance';

function fmt(n: number): string {
  return Math.round(n).toLocaleString('he-IL');
}

export default function AmortizationChart({ results }: Props) {
  const [view, setView] = useState<ChartView>('payment');

  if (results.length === 0) return null;

  if (view === 'payment' && results.length === 1) {
    // Stacked area: interest vs principal for single option
    const data = results[0].combinedSchedule
      .filter((_, i) => i % 3 === 0) // sample every 3 months for performance
      .map(row => ({
        date: row.date,
        interest: Math.round(row.interestPayment),
        principal: Math.round(row.principalPayment),
      }));

    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">גרף</h3>
          <ViewToggle view={view} onChange={setView} />
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              interval={Math.max(1, Math.floor(data.length / 8))}
            />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
            <Tooltip
              formatter={(v: unknown) => `${fmt(Number(v))} ₪`}
              labelFormatter={l => String(l)}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="interest"
              name="ריבית"
              stackId="1"
              fill="#F59E0B"
              stroke="#F59E0B"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="principal"
              name="קרן"
              stackId="1"
              fill="#3B82F6"
              stroke="#3B82F6"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Balance comparison (or payment for multiple options)
  const maxLen = Math.max(...results.map(r => r.combinedSchedule.length));
  const data: Record<string, unknown>[] = [];

  for (let i = 0; i < maxLen; i += 3) {
    const point: Record<string, unknown> = {};
    let date = '';
    for (const r of results) {
      const row = r.combinedSchedule[i];
      if (!row) continue;
      date = row.date;
      if (view === 'balance') {
        point[r.optionName] = Math.round(row.principalAfter);
      } else {
        point[r.optionName] = Math.round(row.totalPayment);
      }
    }
    point.date = date;
    data.push(point);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">גרף</h3>
        <ViewToggle view={view} onChange={setView} />
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            interval={Math.max(1, Math.floor(data.length / 8))}
          />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={v => fmt(v)} />
          <Tooltip formatter={(v: unknown) => `${fmt(Number(v))} ₪`} />
          <Legend />
          {results.map((r, i) => (
            <Line
              key={r.optionId}
              type="monotone"
              dataKey={r.optionName}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: ChartView; onChange: (v: ChartView) => void }) {
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onChange('payment')}
        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
          view === 'payment'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        תשלום
      </button>
      <button
        onClick={() => onChange('balance')}
        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
          view === 'balance'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        יתרה
      </button>
    </div>
  );
}
