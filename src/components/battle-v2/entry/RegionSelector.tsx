import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Region {
  code: string;
  label: string;
  ping: number;
}

interface Props {
  regions: Region[];
  selected: string;
  onSelect: (code: string) => void;
}

const DEFAULT_REGIONS: Region[] = [
  { code: "AP-S", label: "Asia · Mumbai", ping: 28 },
  { code: "EU-W", label: "Europe · Frankfurt", ping: 142 },
  { code: "US-E", label: "Americas · Virginia", ping: 218 },
  { code: "AP-T", label: "Asia · Tokyo", ping: 96 },
];

export function RegionSelector({ regions = DEFAULT_REGIONS, selected, onSelect }: Props) {
  const list = regions.length > 0 ? regions : DEFAULT_REGIONS;
  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
      <header className="relative flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
        <span className="inline-flex items-center gap-1.5 font-display text-[11px] font-bold tracking-[0.22em] text-text-mute">
          <Globe className="h-3 w-3 text-neon" />
          REGION
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] text-text-dim">// SERVER_NODE</span>
      </header>

      <ul className="relative p-3 space-y-2">
        {list.map((r) => {
          const active = selected === r.code;
          const pingTone = r.ping < 60 ? "text-neon" : r.ping < 150 ? "text-gold" : "text-ember";
          return (
            <li key={r.code}>
              <button
                onClick={() => onSelect(r.code)}
                className={cn(
                  "flex w-full items-center justify-between border bg-void/40 px-3 py-2.5 transition",
                  active ? "border-neon/60 bg-neon/5" : "border-line/50 hover:border-line-bright",
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-display text-[10px] font-bold tracking-[0.2em] text-text-mute">
                    {r.code}
                  </span>
                  <span className="font-display text-[12px] font-bold text-text truncate">
                    {r.label}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums">
                  <span className={cn("h-1.5 w-1.5 rounded-full", pingTone.replace("text-", "bg-"))} />
                  <span className={pingTone}>{r.ping}ms</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
