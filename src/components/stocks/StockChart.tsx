'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { StockSimulationResult } from '@/lib/stocks/types';

interface Props {
  result: StockSimulationResult;
}

export default function StockChart({ result }: Props) {
  const allDates = new Set<string>();
  result.historicalData.forEach(p => allDates.add(p.date));
  result.projectedData.forEach(p => allDates.add(p.date));
  const sortedDates = Array.from(allDates).sort();

  const lastHistDate =
    result.historicalData.length > 0
      ? result.historicalData[result.historicalData.length - 1].date
      : '';

  const chartData = sortedDates.map(date => {
    const point: Record<string, unknown> = { date };
    const histPoint = result.historicalData.find(p => p.date === date);
    if (histPoint) point['historical'] = Math.round(histPoint.value);
    const projPoint = result.projectedData.find(p => p.date === date);
    if (projPoint) point['projected'] = Math.round(projPoint.value);
    if (date === lastHistDate && histPoint) point['projected'] = Math.round(histPoint.value);
    return point;
  });

  // Sample to max ~150 points
  const sampled =
    chartData.length > 150
      ? chartData.filter(
          (_, i) => i % Math.ceil(chartData.length / 150) === 0 || i === chartData.length - 1,
        )
      : chartData;

  const formatValue = (v: number) => {
    if (v >= 1_000_000) return `₪${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `₪${(v / 1_000).toFixed(0)}K`;
    return `₪${v}`;
  };

  const formatDate = (d: unknown) => {
    if (!d) return '';
    const [year, month] = String(d).split('-');
    return `${month}/${year}`;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-right mb-4">
        גרף {result.name} ({result.symbol})
      </h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={sampled} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis tickFormatter={formatValue} tick={{ fontSize: 11 }} width={70} />
          <Tooltip
            formatter={(value: unknown, name: unknown) => [
              `₪${Number(value).toLocaleString()}`,
              name === 'historical' ? 'היסטורי' : 'תחזית',
            ]}
            labelFormatter={formatDate}
          />
          {lastHistDate && (
            <ReferenceLine
              x={lastHistDate}
              stroke="#94a3b8"
              strokeDasharray="5 5"
              label={{ value: 'היום', position: 'top', fontSize: 12 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="historical"
            stroke="#1E40AF"
            strokeWidth={2.5}
            dot={false}
            name="historical"
          />
          <Line
            type="monotone"
            dataKey="projected"
            stroke="#1E40AF"
            strokeWidth={2.5}
            strokeDasharray="8 4"
            dot={false}
            name="projected"
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-4 justify-center text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-blue-800" />
          <span>היסטורי</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 border-t-2 border-dashed border-blue-800" />
          <span>תחזית</span>
        </div>
      </div>
    </div>
  );
}
