import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  /** Mono caps tag, e.g. "EGOIST PROTOCOL ACTIVE" */
  tag: string;
  /** Optional right-side action */
  right?: React.ReactNode;
  className?: string;
}

/**
 * Blue Lock — mono-caps tag + neon hairline divider.
 * Use to separate page sections.
 */
export function SectionHeader({ tag, right, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center gap-3 mb-4', className)}>
      <span className="font-mono text-[11px] text-neon/70 tracking-wider whitespace-nowrap">
        [ {tag.toUpperCase()} ]
      </span>
      <span className="h-px flex-1 bg-gradient-to-r from-neon/40 via-neon/10 to-transparent" />
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  );
}
