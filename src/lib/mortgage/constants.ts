import { TrackType } from './types';

export const DEFAULTS = {
  annualCpiTarget: 2.75,
  currentPrimeRate: 4.5,
  maxOptions: 4,
  maxTracksPerOption: 8,
  maxYears: 30,
} as const;

export const TRACK_TYPE_LABELS: Record<TrackType, string> = {
  'fixed-cpi': 'קבועה צמודת מדד',
  'variable-cpi': 'משתנה צמודה',
  'prime': 'צמודה לפריים',
};

export const TRACK_TYPE_OPTIONS: { value: TrackType; label: string }[] = [
  { value: 'fixed-cpi', label: 'קבועה צמודת מדד' },
  { value: 'variable-cpi', label: 'משתנה צמודה' },
  { value: 'prime', label: 'צמודה לפריים' },
];
