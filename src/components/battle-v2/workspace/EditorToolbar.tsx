import { useState } from "react";
import { Play, Send, RotateCcw, Wand2, ChevronDown, FileCode, Maximize2 } from "lucide-react";

export const LANGUAGES = [
  { id: "py", label: "Python 3.11", ext: "py" },
  { id: "cpp", label: "C++ 20", ext: "cpp" },
  { id: "java", label: "Java 17", ext: "java" },
  { id: "js", label: "JavaScript", ext: "js" },
  { id: "ts", label: "TypeScript", ext: "ts" },
  { id: "go", label: "Go 1.22", ext: "go" },
] as const;

export type LangId = (typeof LANGUAGES)[number]["id"];

interface Props {
  language: LangId;
  onLanguageChange: (id: LangId) => void;
  onRun: () => void;
  onSubmit: () => void;
  onReset: () => void;
  running: boolean;
  submitting: boolean;
  disabled?: boolean;
}

export function EditorToolbar({ language, onLanguageChange, onRun, onSubmit, onReset, running, submitting, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const lang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  return (
    <div className="relative z-20 flex items-center gap-2 border-b border-line/60 bg-panel/50 px-3 py-2 backdrop-blur-md">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />

      <div className="relative flex items-center gap-2 border border-neon/40 bg-void/60 px-2.5 h-7 bl-clip-chevron">
        <FileCode className="h-3 w-3 text-neon" />
        <span className="font-mono text-[11px] text-text">solution.{lang.ext}</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative flex items-center gap-1.5 border border-line/60 bg-void/60 px-2 h-7 font-mono text-[11px] text-text transition hover:border-neon/50"
        >
          {lang.label}
          <ChevronDown className={`h-3 w-3 text-text-mute transition ${open ? "rotate-180 text-neon" : ""}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-30 w-48 border border-line/70 bg-panel/95 backdrop-blur-xl">
            <ul className="max-h-64 overflow-y-auto py-1">
              {LANGUAGES.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => {
                      onLanguageChange(l.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between px-3 py-1.5 text-left font-mono text-[11px] transition hover:bg-neon/10 ${
                      l.id === language ? "text-neon" : "text-text-dim"
                    }`}
                  >
                    <span>{l.label}</span>
                    <span className="text-[9px] text-text-mute">.{l.ext}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button className="inline-flex items-center gap-1 border border-line/60 bg-void/50 px-2 h-7 font-mono text-[10px] text-text-dim transition hover:border-neon/50 hover:text-neon">
        <Wand2 className="h-3 w-3" />
        FORMAT
      </button>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-1 border border-line/60 bg-void/50 px-2 h-7 font-mono text-[10px] text-text-dim transition hover:border-ember/50 hover:text-ember"
      >
        <RotateCcw className="h-3 w-3" />
        RESET
      </button>

      <div className="ml-auto flex items-center gap-2">
        <button className="inline-flex items-center justify-center border border-line/60 bg-void/50 h-7 w-7 text-text-mute transition hover:border-neon/50 hover:text-neon">
          <Maximize2 className="h-3 w-3" />
        </button>

        <div className="h-5 w-px bg-line/60" />

        <button
          onClick={onRun}
          disabled={running || disabled}
          className="inline-flex items-center gap-1.5 border border-neon/50 bg-neon/10 px-3 h-8 font-display text-[11px] font-bold tracking-[0.18em] text-neon transition hover:bg-neon/20 disabled:opacity-60 bl-clip-chevron"
        >
          <Play className={`h-3 w-3 ${running ? "animate-pulse" : ""}`} />
          {running ? "RUNNING…" : "RUN"}
          <span className="ml-1 hidden font-mono text-[9px] tracking-[0.12em] text-neon/60 lg:inline">⌘↵</span>
        </button>

        <button
          onClick={onSubmit}
          disabled={submitting || disabled}
          className="bl-btn-primary bl-clip-notch inline-flex h-9 items-center gap-1.5 px-4 text-[11px] tracking-[0.18em] disabled:opacity-60"
        >
          <Send className={`h-3.5 w-3.5 ${submitting ? "animate-pulse" : ""}`} />
          {submitting ? "SUBMITTING" : "SUBMIT"}
          <span className="ml-1 hidden font-mono text-[9px] tracking-[0.12em] text-neon/70 lg:inline">⌘⇧↵</span>
        </button>
      </div>
    </div>
  );
}
