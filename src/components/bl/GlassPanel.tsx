import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use the stronger glass surface */
  strong?: boolean;
  /** Show neon corner brackets */
  corners?: boolean;
  /** Show left side neon stripe */
  sideStripe?: boolean | 'ember';
  /** Apply Blue Lock notch clip-path */
  notch?: boolean;
  /** Padding scale (default: p-5) */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingMap = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-6' } as const;

/**
 * Blue Lock — generic frosted glass panel.
 * Drop-in replacement for legacy `arena-card` / `glass-card` wrappers.
 */
export const GlassPanel = forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ strong, corners, sideStripe, notch, padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          strong ? 'bl-glass-strong' : 'bl-glass',
          corners && 'bl-corners',
          sideStripe && 'bl-side-stripe',
          sideStripe === 'ember' && 'bl-side-stripe-ember',
          notch && 'bl-clip-notch',
          paddingMap[padding],
          'relative',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
GlassPanel.displayName = 'GlassPanel';
