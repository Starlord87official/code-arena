import { Search, Swords, Users, Wifi } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { OnlineWarrior } from "@/hooks/useBattleData";

interface Props {
  warriors: OnlineWarrior[];
  isLoading: boolean;
  query: string;
  onQuery: (q: string) => void;
  onChallenge?: (id: string) => void;
}

export function OnlineWarriorsList({ warriors, isLoading, query, onQuery, onChallenge }: Props) {
  const filtered = warriors.filter((w) => w.username.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
      <header className="relative flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-neon" />
          <span className="font-display text-[13px] font-bold tracking-[0.2em] text-text text-glow">
            ONLINE WARRIORS
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-mute" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search…"
            className="w-48 border border-line/60 bg-void/60 pl-8 pr-2 py-1.5 font-mono text-[11px] text-text outline-none focus:border-neon/60"
          />
        </div>
      </header>

      <div className="relative p-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-line/40 bg-void/40">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <Wifi className="h-10 w-10 text-text-mute/50 mx-auto mb-3" />
            <p className="font-display text-[12px] font-bold tracking-[0.2em] text-text-dim">
              NO WARRIORS ONLINE
            </p>
            <p className="font-mono text-[10px] text-text-mute mt-1">
              The arena is quiet. Be the first to lock in.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((w) => (
              <li
                key={w.id}
                className="group flex items-center gap-3 border border-line/50 bg-void/40 p-3 transition hover:border-neon/40 hover:bg-neon/5"
              >
                <div className="flex h-10 w-10 items-center justify-center border border-neon/40 bg-neon/10 font-display text-[14px] font-black text-neon bl-clip-notch">
                  {w.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-display text-[13px] font-bold text-text">{w.username}</span>
                    <span className="font-display text-[9px] font-bold tracking-[0.2em] text-neon uppercase">
                      {w.division}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.1em] text-text-dim">
                    {w.xp.toLocaleString()} XP · streak {w.streak}
                  </div>
                </div>
                {onChallenge && (
                  <button
                    onClick={() => onChallenge(w.id)}
                    className="opacity-0 transition group-hover:opacity-100 inline-flex items-center gap-1 border border-neon/50 bg-neon/10 px-2.5 py-1.5 font-display text-[10px] font-bold tracking-[0.2em] text-neon hover:bg-neon/20 bl-clip-chevron"
                  >
                    <Swords className="h-3 w-3" />
                    CHALLENGE
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
