import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatAccent = 'neon' | 'ember' | 'gold' | 'electric';

interface StatTileProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  accent?: StatAccent;
  index?: number;
  /** Smaller value font for long labels (e.g. "BRONZE") */
  compact?: boolean;
  className?: string;
}

const accentMap: Record<StatAccent, { text: string; glow: string; bar: string; icon: string }> = {
  neon: {
    text: 'text-neon',
    glow: 'shadow-[0_0_30px_-5px_hsla(187,100%,50%,0.5)]',
    bar: 'from-neon to-electric',
    icon: 'text-neon',
  },
  ember: {
    text: 'text-ember',
    glow: 'shadow-[0_0_30px_-5px_hsla(19,100%,55%,0.45)]',
    bar: 'from-ember to-ember-soft',
    icon: 'text-ember',
  },
  gold: {
    text: 'text-gold',
    glow: 'shadow-[0_0_30px_-5px_hsla(43,96%,56%,0.45)]',
    bar: 'from-gold to-ember',
    icon: 'text-gold',
  },
  electric: {
    text: 'text-neon-soft',
    glow: 'shadow-[0_0_30px_-5px_hsla(217,100%,50%,0.55)]',
    bar: 'from-electric to-blue-mid',
    icon: 'text-electric',
  },
};

/**
 * Blue Lock — athlete-style stat tile.
 * Use in a 4-column responsive grid for top-of-page metric rows.
 */
export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  accent = 'neon',
  index = 0,
  compact,
  className,
}: StatTileProps) {
  const a = accentMap[accent];

  return (
    <div
      className={cn(
        'group relative bl-glass bl-corners p-5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5',
        a.glow,
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bl-scan" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={cn('h-4 w-4', a.icon)} />
          <span className={cn('font-display text-[10px] font-bold tracking-[0.28em]', a.text)}>
            {label.toUpperCase()}
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-mute">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span
          className={cn(
            'font-display font-bold leading-none tabular-nums',
            compact ? 'text-[28px] tracking-tight' : 'text-[44px] md:text-[52px] tracking-tighter',
            a.text,
            accent === 'neon' && 'text-glow',
            accent === 'ember' && 'text-glow-ember',
          )}
        >
          {value}
        </span>
      </div>

      {sub && <p className="mt-2 text-[12px] text-text-dim leading-snug">{sub}</p>}

      <div className="mt-4 flex items-center gap-2">
        <div className={cn('h-[3px] flex-1 bg-gradient-to-r', a.bar)} />
        <div className={cn('h-[3px] w-6 bg-gradient-to-r opacity-60', a.bar)} />
        <div className={cn('h-[3px] w-2 bg-gradient-to-r opacity-30', a.bar)} />
      </div>
    </div>
  );
}
