'use client';

import { useState } from 'react';
import {
  MortgageOption,
  OptionResult,
  SavingsPlanResult,
  GlobalSettings as GlobalSettingsType,
} from '@/lib/mortgage/types';
import { DEFAULTS } from '@/lib/mortgage/constants';
import { calculateOption, calculateSavings } from '@/lib/mortgage/amortization';
import GlobalSettings from './GlobalSettings';
import CurrentMortgage from './CurrentMortgage';
import OptionTabs from './OptionTabs';
import OptionBuilder from './OptionBuilder';
import SavingsPlan from './SavingsPlan';
import ComparisonSummary from './ComparisonSummary';
import AmortizationChart from './AmortizationChart';
import AmortizationTable from './AmortizationTable';

let optionIdCounter = 0;
function newOptionId(): string {
  return `opt-${Date.now()}-${++optionIdCounter}`;
}

function getStartDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function MortgageCalculator() {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettingsType>({
    annualCpiTarget: DEFAULTS.annualCpiTarget,
    currentPrimeRate: DEFAULTS.currentPrimeRate,
    startDate: getStartDate(),
  });

  const [currentMortgage, setCurrentMortgage] = useState<MortgageOption | null>(null);
  const [options, setOptions] = useState<MortgageOption[]>([
    { id: newOptionId(), name: 'אופציה 1', tracks: [] },
  ]);
  const [activeOptionIndex, setActiveOptionIndex] = useState(0);

  const [savingsInput, setSavingsInput] = useState({
    initialAmount: 10000,
    monthlyAmount: 1200,
    annualReturn: 4,
    years: 4,
  });

  const [results, setResults] = useState<OptionResult[] | null>(null);
  const [currentResult, setCurrentResult] = useState<OptionResult | null>(null);
  const [savingsResult, setSavingsResult] = useState<SavingsPlanResult | null>(null);
  const [error, setError] = useState('');

  const handleAddOption = () => {
    if (options.length >= DEFAULTS.maxOptions) return;
    const num = options.length + 1;
    setOptions([...options, { id: newOptionId(), name: `אופציה ${num}`, tracks: [] }]);
    setActiveOptionIndex(options.length);
    setResults(null);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 1) return;
    const next = options.filter((_, i) => i !== index);
    setOptions(next);
    setActiveOptionIndex(Math.min(activeOptionIndex, next.length - 1));
    setResults(null);
  };

  const handleOptionChange = (index: number, option: MortgageOption) => {
    const next = [...options];
    next[index] = option;
    setOptions(next);
    setResults(null);
  };

  const handleCalculate = () => {
    setError('');

    // Validate at least one option has tracks
    const hasAnyTracks = options.some(o => o.tracks.length > 0);
    if (!hasAnyTracks) {
      setError('יש להוסיף לפחות מסלול אחד באחת מהאופציות');
      return;
    }

    // Validate all tracks have positive principal
    for (const opt of options) {
      for (const track of opt.tracks) {
        if (track.principal <= 0) {
          setError(`${opt.name}: סכום המסלול חייב להיות חיובי`);
          return;
        }
        if (track.years <= 0 || track.years > DEFAULTS.maxYears) {
          setError(`${opt.name}: תקופת ההלוואה חייבת להיות בין 1 ל-${DEFAULTS.maxYears} שנים`);
          return;
        }
      }
    }

    // Calculate options
    const optionResults = options
      .filter(o => o.tracks.length > 0)
      .map(o => calculateOption(o, globalSettings));
    setResults(optionResults);

    // Calculate current mortgage if provided
    if (currentMortgage && currentMortgage.tracks.length > 0) {
      setCurrentResult(calculateOption(currentMortgage, globalSettings));
    } else {
      setCurrentResult(null);
    }

    // Calculate savings plan
    if (savingsInput.monthlyAmount > 0 || savingsInput.initialAmount > 0) {
      setSavingsResult(
        calculateSavings(
          savingsInput.initialAmount,
          savingsInput.monthlyAmount,
          savingsInput.annualReturn,
          savingsInput.years,
        ),
      );
    } else {
      setSavingsResult(null);
    }
  };

  const activeOption = options[activeOptionIndex];

  return (
    <div className="space-y-6">
      <GlobalSettings settings={globalSettings} onChange={setGlobalSettings} />

      <CurrentMortgage mortgage={currentMortgage} onChange={setCurrentMortgage} />

      {/* New mortgage options */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">אופציות משכנתא חדשה</h2>
        <OptionTabs
          options={options}
          activeIndex={activeOptionIndex}
          onSelect={setActiveOptionIndex}
          onAdd={handleAddOption}
          onRemove={handleRemoveOption}
        />
        {activeOption && (
          <OptionBuilder
            option={activeOption}
            onChange={o => handleOptionChange(activeOptionIndex, o)}
          />
        )}
      </div>

      <SavingsPlan input={savingsInput} onChange={setSavingsInput} result={savingsResult} />

      {/* Calculate button */}
      <button
        onClick={handleCalculate}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-lg"
      >
        חשב
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-6">
          <ComparisonSummary results={results} currentResult={currentResult} />
          <AmortizationChart results={results} />
          <AmortizationTable results={results} activeOptionIndex={activeOptionIndex} />
        </div>
      )}
    </div>
  );
}
