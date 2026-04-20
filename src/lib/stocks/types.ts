import { ProjectionPoint } from '@/lib/types';

export interface Stock {
  symbol: string;
  name: string;
  hebrewName?: string;
  exchange: string;
  securityNumber?: string;
  sector?: string;
}

export interface StockMonthlyReturn {
  date: string;       // YYYY-MM
  returnPct: number;  // monthly % change
  closePrice: number;
}

export interface StockSimulationResult {
  symbol: string;
  name: string;
  exchange: string;
  avgAnnualReturn: number;
  historicalData: ProjectionPoint[];
  projectedData: ProjectionPoint[];
  projectedEndValue: number;
  totalGain: number;
  investmentAmount: number;
}
