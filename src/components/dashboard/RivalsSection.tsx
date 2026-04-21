import { Link } from 'react-router-dom';
import { Swords, Sparkles, Target } from 'lucide-react';
import { User } from '@/lib/mockData';

interface RivalsSectionProps {
  currentUser: User;
  rivals: User[];
}

export function RivalsSection({ currentUser }: RivalsSectionProps) {
  const hasRivals = false; // Private beta: no rival data yet

  if (!hasRivals) {
    return (
      <div className="relative bl-glass overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-line/50 bg-void/40">
          <div className="flex items-center gap-2">
            <Swords className="h-4 w-4 text-ember" />
            <span className="font-display text-[11px] font-bold tracking-[0.28em] text-ember">
              RIVALS NEARBY
            </span>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 border border-neon/40 bg-neon/10 text-neon font-display text-[9px] font-bold tracking-[0.2em]">
            PRIVATE BETA
          </span>
        </div>

        {/* Body */}
        <div className="relative p-6 text-center">
          <div className="absolute inset-0 bl-dots opacity-40" />

          <div className="relative flex flex-col items-center">
            {/* Pioneer badge */}
            <div className="relative">
              <div className="absolute inset-0 bg-gold/40 blur-2xl" />
              <div className="relative flex h-16 w-16 items-center justify-center bg-gradient-to-br from-gold/30 to-ember/20 border-2 border-gold/60 bl-clip-notch bl-pulse-ember">
                <Sparkles className="h-7 w-7 text-gold" />
              </div>
            </div>

            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight text-text">
              You're a <span className="text-gold text-glow-ember">Pioneer</span>
            </h3>
            <p className="mt-2 max-w-sm text-[13px] text-text-dim leading-relaxed">
              As more warriors join the arena, rivals will appear here based on your XP and division.
            </p>

            {/* Current user card */}
            <div className="mt-5 w-full max-w-sm border border-neon/30 bg-void/60 p-3 flex items-center gap-3">
              <div className="relative">
                <span className="absolute inset-0 bg-neon/40 blur-md" />
                <span className="relative flex h-10 w-10 items-center justify-center bg-gradient-to-br from-neon to-electric font-display text-[15px] font-bold text-void uppercase">
                  {currentUser.username[0]}
                </span>
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="font-display text-[14px] font-bold text-text truncate">
                  {currentUser.username}
                </div>
                <div className="font-mono text-[11px] text-neon">
                  {currentUser.xp.toLocaleString()} XP
                </div>
              </div>
              <span className="inline-flex items-center px-2 py-1 border border-ember/40 bg-ember/5 text-ember font-display text-[9px] font-bold tracking-[0.2em] shrink-0">
                YOU
              </span>
            </div>

            {/* CTA */}
            <Link to="/challenges">
              <button className="bl-btn-primary bl-pulse mt-5 px-5 py-3 text-[12px]">
                <Target className="h-4 w-4" />
                SOLVE CHALLENGES TO CLIMB
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
