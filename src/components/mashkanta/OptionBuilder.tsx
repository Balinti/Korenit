'use client';

import { MortgageOption, MortgageTrack } from '@/lib/mortgage/types';
import { DEFAULTS } from '@/lib/mortgage/constants';
import TrackEditor from './TrackEditor';

interface Props {
  option: MortgageOption;
  onChange: (option: MortgageOption) => void;
}

let trackIdCounter = 0;
function newTrackId(): string {
  return `track-${Date.now()}-${++trackIdCounter}`;
}

function createDefaultTrack(): MortgageTrack {
  return {
    id: newTrackId(),
    type: 'fixed-cpi',
    principal: 300000,
    years: 20,
    interestRate: 3.5,
  };
}

export default function OptionBuilder({ option, onChange }: Props) {
  const totalPrincipal = option.tracks.reduce((s, t) => s + t.principal, 0);

  const handleTrackChange = (index: number, track: MortgageTrack) => {
    const tracks = [...option.tracks];
    tracks[index] = track;
    onChange({ ...option, tracks });
  };

  const handleRemoveTrack = (index: number) => {
    const tracks = option.tracks.filter((_, i) => i !== index);
    onChange({ ...option, tracks });
  };

  const handleAddTrack = () => {
    if (option.tracks.length >= DEFAULTS.maxTracksPerOption) return;
    onChange({ ...option, tracks: [...option.tracks, createDefaultTrack()] });
  };

  return (
    <div className="space-y-3">
      {option.tracks.map((track, i) => (
        <TrackEditor
          key={track.id}
          track={track}
          index={i}
          onChange={t => handleTrackChange(i, t)}
          onRemove={() => handleRemoveTrack(i)}
        />
      ))}

      <div className="flex items-center justify-between">
        <button
          onClick={handleAddTrack}
          disabled={option.tracks.length >= DEFAULTS.maxTracksPerOption}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          + הוסף מסלול
        </button>
        {option.tracks.length > 0 && (
          <span className="text-sm text-gray-500">
            סה&quot;כ: {totalPrincipal.toLocaleString('he-IL')} ₪
          </span>
        )}
      </div>
    </div>
  );
}
