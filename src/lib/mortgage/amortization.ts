import {
  MortgageTrack,
  MortgageOption,
  AmortizationRow,
  TrackSchedule,
  OptionResult,
  OptionSummary,
  SavingsPlanResult,
  SavingsPlanRow,
  GlobalSettings,
} from './types';
import { TRACK_TYPE_LABELS } from './constants';

// ---------------------------------------------------------------------------
// Financial primitives
// ---------------------------------------------------------------------------

/** Standard annuity payment (returns positive value for a loan) */
function pmt(monthlyRate: number, nper: number, pv: number): number {
  if (nper <= 0) return 0;
  if (monthlyRate === 0) return pv / nper;
  return (pv * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -nper));
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

function addMonths(yyyymm: string, n: number): string {
  const [y, m] = yyyymm.split('-').map(Number);
  const date = new Date(y, m - 1 + n, 1);
  const ny = date.getFullYear();
  const nm = date.getMonth() + 1;
  return `${ny}-${String(nm).padStart(2, '0')}`;
}

// ---------------------------------------------------------------------------
// Schedule generators
// ---------------------------------------------------------------------------

/**
 * Fixed-rate CPI-linked track.
 * Each month the outstanding principal is adjusted by CPI inflation,
 * then PMT is recalculated with the new principal and remaining months.
 */
export function generateFixedCpiSchedule(
  track: MortgageTrack,
  settings: GlobalSettings,
): AmortizationRow[] {
  const totalMonths = track.years * 12;
  const monthlyRate = track.interestRate / 100 / 12;
  const monthlyCpi = Math.pow(1 + settings.annualCpiTarget / 100, 1 / 12) - 1;
  const rows: AmortizationRow[] = [];

  let balance = track.principal;

  for (let m = 1; m <= totalMonths; m++) {
    // CPI adjustment on the balance
    const cpiAdj = balance * monthlyCpi;
    const principalBefore = balance + cpiAdj;

    const remaining = totalMonths - m + 1;
    const payment = pmt(monthlyRate, remaining, principalBefore);
    const interest = principalBefore * monthlyRate;
    const principalPmt = payment - interest;
    const principalAfter = principalBefore - principalPmt;

    rows.push({
      month: m,
      date: addMonths(settings.startDate, m),
      principalBefore,
      cpiAdjustment: cpiAdj,
      interestPayment: interest,
      principalPayment: principalPmt,
      totalPayment: payment,
      principalAfter: Math.max(0, principalAfter),
    });

    balance = Math.max(0, principalAfter);
    if (balance < 0.01) break;
  }

  return rows;
}

/**
 * Variable-rate CPI-linked track.
 * Same as fixed-CPI but the interest rate changes every `ratePeriodYears` years.
 * The user provides an array of rates for each period.
 */
export function generateVariableCpiSchedule(
  track: MortgageTrack,
  settings: GlobalSettings,
): AmortizationRow[] {
  const totalMonths = track.years * 12;
  const monthlyCpi = Math.pow(1 + settings.annualCpiTarget / 100, 1 / 12) - 1;
  const periodMonths = (track.ratePeriodYears ?? 5) * 12;
  const rates = track.periodRates ?? [track.interestRate];
  const rows: AmortizationRow[] = [];

  let balance = track.principal;

  for (let m = 1; m <= totalMonths; m++) {
    // Determine current period rate
    const periodIndex = Math.floor((m - 1) / periodMonths);
    const currentRate = periodIndex < rates.length
      ? rates[periodIndex]
      : rates[rates.length - 1]; // hold last rate
    const monthlyRate = currentRate / 100 / 12;

    // CPI adjustment
    const cpiAdj = balance * monthlyCpi;
    const principalBefore = balance + cpiAdj;

    const remaining = totalMonths - m + 1;
    const payment = pmt(monthlyRate, remaining, principalBefore);
    const interest = principalBefore * monthlyRate;
    const principalPmt = payment - interest;
    const principalAfter = principalBefore - principalPmt;

    rows.push({
      month: m,
      date: addMonths(settings.startDate, m),
      principalBefore,
      cpiAdjustment: cpiAdj,
      interestPayment: interest,
      principalPayment: principalPmt,
      totalPayment: payment,
      principalAfter: Math.max(0, principalAfter),
    });

    balance = Math.max(0, principalAfter);
    if (balance < 0.01) break;
  }

  return rows;
}

/**
 * Prime-linked track.
 * Rate = prime + spread, no CPI adjustment.
 * PMT recalculated each month (constant prime in projection).
 */
export function generatePrimeSchedule(
  track: MortgageTrack,
  settings: GlobalSettings,
): AmortizationRow[] {
  const totalMonths = track.years * 12;
  const annualRate = settings.currentPrimeRate + (track.primeSpread ?? 0);
  const monthlyRate = annualRate / 100 / 12;
  const rows: AmortizationRow[] = [];

  let balance = track.principal;

  for (let m = 1; m <= totalMonths; m++) {
    const principalBefore = balance;
    const remaining = totalMonths - m + 1;
    const payment = pmt(monthlyRate, remaining, principalBefore);
    const interest = principalBefore * monthlyRate;
    const principalPmt = payment - interest;
    const principalAfter = principalBefore - principalPmt;

    rows.push({
      month: m,
      date: addMonths(settings.startDate, m),
      principalBefore,
      cpiAdjustment: 0,
      interestPayment: interest,
      principalPayment: principalPmt,
      totalPayment: payment,
      principalAfter: Math.max(0, principalAfter),
    });

    balance = Math.max(0, principalAfter);
    if (balance < 0.01) break;
  }

  return rows;
}

// ---------------------------------------------------------------------------
// Track dispatch
// ---------------------------------------------------------------------------

function generateTrackSchedule(
  track: MortgageTrack,
  settings: GlobalSettings,
): TrackSchedule {
  let rows: AmortizationRow[];
  switch (track.type) {
    case 'fixed-cpi':
      rows = generateFixedCpiSchedule(track, settings);
      break;
    case 'variable-cpi':
      rows = generateVariableCpiSchedule(track, settings);
      break;
    case 'prime':
      rows = generatePrimeSchedule(track, settings);
      break;
  }

  return {
    trackId: track.id,
    trackType: track.type,
    trackLabel: TRACK_TYPE_LABELS[track.type],
    rows,
  };
}

// ---------------------------------------------------------------------------
// Combine schedules
// ---------------------------------------------------------------------------

export function combineSchedules(schedules: TrackSchedule[]): AmortizationRow[] {
  if (schedules.length === 0) return [];

  const maxMonths = Math.max(...schedules.map(s => s.rows.length));
  const combined: AmortizationRow[] = [];

  for (let i = 0; i < maxMonths; i++) {
    let principalBefore = 0;
    let cpiAdjustment = 0;
    let interestPayment = 0;
    let principalPayment = 0;
    let totalPayment = 0;
    let principalAfter = 0;
    let date = '';

    for (const schedule of schedules) {
      const row = schedule.rows[i];
      if (!row) continue;
      date = row.date;
      principalBefore += row.principalBefore;
      cpiAdjustment += row.cpiAdjustment;
      interestPayment += row.interestPayment;
      principalPayment += row.principalPayment;
      totalPayment += row.totalPayment;
      principalAfter += row.principalAfter;
    }

    combined.push({
      month: i + 1,
      date,
      principalBefore,
      cpiAdjustment,
      interestPayment,
      principalPayment,
      totalPayment,
      principalAfter,
    });
  }

  return combined;
}

// ---------------------------------------------------------------------------
// Option calculation
// ---------------------------------------------------------------------------

function computeSummary(combined: AmortizationRow[], totalPrincipal: number): OptionSummary {
  const payments = combined.map(r => r.totalPayment);
  const totalRepayment = payments.reduce((a, b) => a + b, 0);
  const totalInterest = combined.reduce((a, r) => a + r.interestPayment, 0);
  const totalCpi = combined.reduce((a, r) => a + r.cpiAdjustment, 0);

  return {
    totalPrincipal,
    totalInterest,
    totalRepayment,
    maxPayment: Math.max(...payments),
    avgPayment: payments.length > 0 ? totalRepayment / payments.length : 0,
    totalCpiAdjustment: totalCpi,
  };
}

export function calculateOption(
  option: MortgageOption,
  settings: GlobalSettings,
): OptionResult {
  const trackSchedules = option.tracks.map(t => generateTrackSchedule(t, settings));
  const combinedSchedule = combineSchedules(trackSchedules);
  const totalPrincipal = option.tracks.reduce((s, t) => s + t.principal, 0);

  return {
    optionId: option.id,
    optionName: option.name,
    trackSchedules,
    combinedSchedule,
    summary: computeSummary(combinedSchedule, totalPrincipal),
  };
}

// ---------------------------------------------------------------------------
// Savings plan
// ---------------------------------------------------------------------------

export function calculateSavings(
  initialAmount: number,
  monthlyAmount: number,
  annualReturn: number,
  years: number,
): SavingsPlanResult {
  const monthlyReturn = annualReturn / 100 / 12;
  const totalMonths = years * 12;
  const rows: SavingsPlanRow[] = [];

  let balance = initialAmount;

  for (let m = 1; m <= totalMonths; m++) {
    balance = (balance + monthlyAmount) * (1 + monthlyReturn);
    rows.push({
      month: m,
      contribution: monthlyAmount,
      balance,
    });
  }

  const totalContributed = initialAmount + monthlyAmount * totalMonths;

  return {
    rows,
    totalContributed,
    finalBalance: balance,
    totalReturn: balance - totalContributed,
  };
}
