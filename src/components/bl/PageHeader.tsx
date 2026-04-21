import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** Three-digit sector code, e.g. "001" */
  sector: string;
  /** Sector tag, e.g. "DASHBOARD" — auto-uppercased */
  tag?: string;
  /** Big display title (string or JSX) */
  title: React.ReactNode;
  /** Optional subtitle below */
  subtitle?: string;
  /** Optional ambient orbs behind */
  ambient?: boolean;
  /** Right-side slot for badges/actions */
  right?: React.ReactNode;
  className?: string;
}

/**
 * Blue Lock — universal page header.
 * `[ SECTOR // 0XX_TAG ]` mono tag + display title + optional subtitle and ambient orbs.
 */
export function PageHeader({
  sector,
  tag,
  title,
  subtitle,
  ambient = true,
  right,
  className,
}: PageHeaderProps) {
  const computedTag = (tag ?? title).toUpperCase().replace(/\s+/g, '_');

  return (
    <section className={cn('relative mb-8 overflow-hidden', className)}>
      {ambient && (
        <>
          <div className="pointer-events-none absolute -top-24 -left-10 h-72 w-72 rounded-full bg-electric/20 blur-3xl bl-float-slow" />
          <div className="pointer-events-none absolute -top-16 right-0 h-64 w-64 rounded-full bg-neon/10 blur-3xl bl-float-slower" />
        </>
      )}

      <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-display text-[10px] font-bold tracking-[0.3em] text-text-mute">
              SECTOR
            </span>
            <span className="font-mono text-[10px] text-neon/70">
              // {sector}_{computedTag}
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-neon/40 via-neon/10 to-transparent" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-[1.05] text-text text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="max-w-2xl text-sm text-text-dim leading-relaxed">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex items-center gap-3 flex-shrink-0">{right}</div>}
      </div>
    </section>
  );
}
