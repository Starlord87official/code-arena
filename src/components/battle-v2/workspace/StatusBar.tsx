import { GitBranch, Wifi, Cpu, Circle, Command } from "lucide-react";

interface Props {
  battleId: string;
  language?: string;
  latencyMs?: number;
}

export function StatusBar({ battleId, language = "Python 3.11", latencyMs = 28 }: Props) {
  return (
    <footer className="relative z-20 flex items-center gap-4 border-t border-line/60 bg-panel/50 px-3 h-7 backdrop-blur">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />

      <div className="relative flex items-center gap-1.5 border-r border-line/60 pr-3">
        <GitBranch className="h-3 w-3 text-text-mute" />
        <span className="font-mono text-[10px] text-text-dim">battle/{battleId}</span>
      </div>

      <div className="relative flex items-center gap-3 font-mono text-[10px] text-text-mute">
        <span className="flex items-center gap-1">
          <Circle className="h-2 w-2 fill-neon text-neon" />
          Synced
        </span>
        <span>UTF-8</span>
        <span>LF</span>
        <span className="text-neon">{language}</span>
      </div>

      <div className="ml-auto flex items-center gap-3 font-mono text-[10px] text-text-mute">
        <span className="flex items-center gap-1">
          <Cpu className="h-3 w-3" />
          <span className="text-neon">sandbox</span>
        </span>
        <span className="flex items-center gap-1">
          <Wifi className="h-3 w-3 text-neon" />
          <span>{latencyMs}ms</span>
        </span>
        <span className="flex items-center gap-1">
          <Command className="h-3 w-3" />
          <span>⌘K</span>
        </span>
      </div>
    </footer>
  );
}
