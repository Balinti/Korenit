import { FundReturns, ProjectionPoint, SimulationResult, PortfolioResult, PortfolioFund } from './types';

// Convert monthly returns to average annual return
export function calculateAvgAnnualReturn(returns: { returnPct: number }[]): number {
  if (returns.length === 0) return 0;

  // Compound monthly returns
  let compounded = 1;
  for (const r of returns) {
    compounded *= (1 + r.returnPct / 100);
  }

  // Annualize: (total compounded)^(12/months) - 1
  const months = returns.length;
  const annualReturn = Math.pow(compounded, 12 / months) - 1;

  return annualReturn * 100; // return as percentage
}

// Reconstruct historical portfolio value
export function buildHistoricalPath(
  investmentAmount: number,
  allocation: number, // 0-100
  returns: { date: string; returnPct: number }[]
): ProjectionPoint[] {
  const allocFraction = allocation / 100;
  const fundAmount = investmentAmount * allocFraction;

  let value = fundAmount;
  const points: ProjectionPoint[] = [{
    date: returns.length > 0 ? returns[0].date : '',
    value: fundAmount,
    isProjected: false,
  }];

  for (const r of returns) {
    value *= (1 + r.returnPct / 100);
    points.push({
      date: r.date,
      value,
      isProjected: false,
    });
  }

  // Remove the duplicate first point
  return points.slice(1).length > 0 ? points.slice(1) : points;
}

// Project forward with compound growth
export function buildProjection(
  startValue: number,
  avgAnnualReturn: number, // as percentage
  projectionYears: number,
  startDate: string // YYYY-MM
): ProjectionPoint[] {
  const monthlyRate = Math.pow(1 + avgAnnualReturn / 100, 1 / 12) - 1;
  const totalMonths = projectionYears * 12;
  const points: ProjectionPoint[] = [];

  let value = startValue;
  const [startYear, startMonth] = startDate.split('-').map(Number);

  for (let i = 1; i <= totalMonths; i++) {
    value *= (1 + monthlyRate);
    const totalMonth = startMonth + i - 1;
    const year = startYear + Math.floor(totalMonth / 12);
    const month = (totalMonth % 12) + 1;

    points.push({
      date: `${year}-${String(month).padStart(2, '0')}`,
      value,
      isProjected: true,
    });
  }

  return points;
}

// Run full simulation for portfolio
export function simulatePortfolio(
  investmentAmount: number,
  portfolioFunds: { fundId: string; allocation: number }[],
  fundReturns: FundReturns[],
  projectionYears: number
): PortfolioResult {
  const fundResults: SimulationResult[] = [];

  for (const pf of portfolioFunds) {
    const fr = fundReturns.find(f => f.fundId === pf.fundId);
    if (!fr) continue;

    const avgReturn = calculateAvgAnnualReturn(fr.returns);
    const historical = buildHistoricalPath(investmentAmount, pf.allocation, fr.returns);

    const lastHistorical = historical[historical.length - 1];
    const projected = buildProjection(
      lastHistorical.value,
      avgReturn,
      projectionYears,
      lastHistorical.date
    );

    fundResults.push({
      fundId: pf.fundId,
      fundName: fr.fundName,
      allocation: pf.allocation,
      avgAnnualReturn: avgReturn,
      historicalData: historical,
      projectedData: projected,
    });
  }

  // Build total portfolio lines by aggregating fund values per date
  const totalHistorical = aggregateByDate(fundResults.map(f => f.historicalData));
  const totalProjected = aggregateByDate(fundResults.map(f => f.projectedData));

  // Weighted average return
  const totalAvgReturn = fundResults.reduce(
    (sum, f) => sum + f.avgAnnualReturn * (f.allocation / 100), 0
  );

  const projectedEndValue = totalProjected.length > 0
    ? totalProjected[totalProjected.length - 1].value
    : investmentAmount;

  return {
    funds: fundResults,
    totalHistorical,
    totalProjected,
    totalAvgReturn,
    projectedEndValue,
    totalGain: projectedEndValue - investmentAmount,
    investmentAmount,
  };
}

function aggregateByDate(allSeries: ProjectionPoint[][]): ProjectionPoint[] {
  const dateMap = new Map<string, number>();
  let isProjected = false;

  for (const series of allSeries) {
    for (const point of series) {
      dateMap.set(point.date, (dateMap.get(point.date) || 0) + point.value);
      if (point.isProjected) isProjected = true;
    }
  }

  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      value,
      isProjected: allSeries.length > 0 && allSeries[0].length > 0
        ? allSeries[0].find(p => p.date === date)?.isProjected ?? false
        : false,
    }));
}
