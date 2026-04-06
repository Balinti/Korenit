'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PortfolioResult } from '@/lib/types';

interface ResultsChartProps {
  result: PortfolioResult;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export default function ResultsChart({ result }: ResultsChartProps) {
  // Build combined data for chart
  const allDates = new Set<string>();

  result.totalHistorical.forEach(p => allDates.add(p.date));
  result.totalProjected.forEach(p => allDates.add(p.date));

  const sortedDates = Array.from(allDates).sort();

  // Find the boundary date between historical and projected
  const lastHistDate = result.totalHistorical.length > 0
    ? result.totalHistorical[result.totalHistorical.length - 1].date
    : '';

  const chartData = sortedDates.map(date => {
    const point: Record<string, any> = { date };

    // Total historical
    const histPoint = result.totalHistorical.find(p => p.date === date);
    if (histPoint) point['historical'] = Math.round(histPoint.value);

    // Total projected (include last historical point to connect lines)
    const projPoint = result.totalProjected.find(p => p.date === date);
    if (projPoint) point['projected'] = Math.round(projPoint.value);
    if (date === lastHistDate && histPoint) point['projected'] = Math.round(histPoint.value);

    // Individual funds - historical
    result.funds.forEach((fund, i) => {
      const fHistPoint = fund.historicalData.find(p => p.date === date);
      if (fHistPoint) point[`fund_${i}_hist`] = Math.round(fHistPoint.value);

      const fProjPoint = fund.projectedData.find(p => p.date === date);
      if (fProjPoint) point[`fund_${i}_proj`] = Math.round(fProjPoint.value);
      if (date === lastHistDate && fHistPoint) point[`fund_${i}_proj`] = Math.round(fHistPoint.value);
    });

    return point;
  });

  // Sample data points for performance (show max ~120 points)
  const sampledData = chartData.length > 120
    ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 120) === 0 || i === chartData.length - 1)
    : chartData;

  const formatValue = (value: number) => {
    if (value >= 1000000) return `₪${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `₪${(value / 1000).toFixed(0)}K`;
    return `₪${value}`;
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    const str = String(date);
    const [year, month] = str.split('-');
    return `${month}/${year}`;
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 text-right">גרף תיק השקעות</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={sampledData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatValue}
            tick={{ fontSize: 11 }}
            width={70}
          />
          <Tooltip
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                historical: 'היסטורי - סה״כ',
                projected: 'תחזית - סה״כ',
              };
              result.funds.forEach((fund, i) => {
                labels[`fund_${i}_hist`] = `${fund.fundName} (היסטורי)`;
                labels[`fund_${i}_proj`] = `${fund.fundName} (תחזית)`;
              });
              return [`₪${Number(value).toLocaleString()}`, labels[String(name)] || String(name)];
            }}
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
          {result.funds.length > 1 && result.funds.map((fund, i) => (
            <Line
              key={`hist-${i}`}
              type="monotone"
              dataKey={`fund_${i}_hist`}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              dot={false}
              opacity={0.6}
              name={`fund_${i}_hist`}
            />
          ))}
          {result.funds.length > 1 && result.funds.map((fund, i) => (
            <Line
              key={`proj-${i}`}
              type="monotone"
              dataKey={`fund_${i}_proj`}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={false}
              opacity={0.6}
              name={`fund_${i}_proj`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-blue-800"></div>
          <span>היסטורי</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-blue-800 border-dashed border-t-2 border-blue-800" style={{borderStyle: 'dashed'}}></div>
          <span>תחזית</span>
        </div>
      </div>
    </div>
  );
}
