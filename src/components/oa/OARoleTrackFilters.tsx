import { cn } from '@/lib/utils';

const roleTracks = [
  { value: 'all', label: 'All Tracks' },
  { value: 'sde-intern', label: 'SDE Intern' },
  { value: 'sde-1', label: 'SDE-1' },
  { value: 'backend', label: 'Backend' },
  { value: 'frontend', label: 'Frontend' },
];

interface OARoleTrackFiltersProps {
  activeTrack: string;
  onTrackChange: (track: string) => void;
}

export function OARoleTrackFilters({ activeTrack, onTrackChange }: OARoleTrackFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {roleTracks.map(track => (
        <button
          key={track.value}
          onClick={() => onTrackChange(track.value)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-heading tracking-wide transition-all duration-200",
            "border",
            activeTrack === track.value
              ? "bg-primary/15 text-primary border-primary/30 shadow-[0_0_15px_hsla(199,100%,50%,0.2)]"
              : "bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
          )}
        >
          {track.label}
        </button>
      ))}
    </div>
  );
}
