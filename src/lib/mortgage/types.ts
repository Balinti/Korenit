export type TrackType = 'fixed-cpi' | 'variable-cpi' | 'prime';

export interface MortgageTrack {
  id: string;
  type: TrackType;
  principal: number;
  years: number;
  interestRate: number;
  // Variable-rate specific
  ratePeriodYears?: number;
  periodRates?: number[];
  // Prime-linked specific
  primeSpread?: number;
}

export interface MortgageOption {
  id: string;
  name: string;
  tracks: MortgageTrack[];
}

export interface AmortizationRow {
  month: number;
  date: string;
  principalBefore: number;
  cpiAdjustment: number;
  interestPayment: number;
  principalPayment: number;
  totalPayment: number;
  principalAfter: number;
}

export interface TrackSchedule {
  trackId: string;
  trackType: TrackType;
  trackLabel: string;
  rows: AmortizationRow[];
}

export interface OptionSummary {
  totalPrincipal: number;
  totalInterest: number;
  totalRepayment: number;
  maxPayment: number;
  avgPayment: number;
  totalCpiAdjustment: number;
}

export interface OptionResult {
  optionId: string;
  optionName: string;
  trackSchedules: TrackSchedule[];
  combinedSchedule: AmortizationRow[];
  summary: OptionSummary;
}

export interface SavingsPlanRow {
  month: number;
  contribution: number;
  balance: number;
}

export interface SavingsPlanResult {
  rows: SavingsPlanRow[];
  totalContributed: number;
  finalBalance: number;
  totalReturn: number;
}

export interface GlobalSettings {
  annualCpiTarget: number;
  currentPrimeRate: number;
  startDate: string; // YYYY-MM
}
