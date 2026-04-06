export interface Fund {
  id: string;
  name: string;
  category: string;
}

export interface MonthlyReturn {
  date: string; // YYYY-MM
  returnPct: number; // monthly return %
  netAssets: number; // net assets in millions NIS
}

export interface FundReturns {
  fundId: string;
  fundName: string;
  returns: MonthlyReturn[];
}

export interface PortfolioFund {
  fund: Fund;
  allocation: number; // 0-100
}

export interface ProjectionPoint {
  date: string;
  value: number;
  isProjected: boolean;
}

export interface SimulationResult {
  fundId: string;
  fundName: string;
  allocation: number;
  avgAnnualReturn: number;
  historicalData: ProjectionPoint[];
  projectedData: ProjectionPoint[];
}

export interface PortfolioResult {
  funds: SimulationResult[];
  totalHistorical: ProjectionPoint[];
  totalProjected: ProjectionPoint[];
  totalAvgReturn: number;
  projectedEndValue: number;
  totalGain: number;
  investmentAmount: number;
}
