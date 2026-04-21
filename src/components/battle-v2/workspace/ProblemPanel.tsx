import { useState } from "react";
import { BookOpen, Lightbulb, StickyNote, Zap, PanelLeftClose, PanelLeftOpen, TrendingUp, Target } from "lucide-react";

export interface ProblemDetail {
  id: string;
  title: string;
  difficulty: string;
  acceptance?: number;
  score?: number;
  stake?: number;
  topics: string[];
  constraints: { k: string; v: string }[];
  statement: string[];
  examples: { input: string; output: string; explanation?: string }[];
  hints?: string[];
}

export interface ProblemSummary {
  id: string;
  title: string;
  difficulty: string;
  solved?: boolean;
}

interface Props {
  problem: ProblemDetail | null;
  collapsed: boolean;
  onToggle: () => void;
  problems?: ProblemSummary[];
  selectedIndex?: number;
  onSelectProblem?: (index: number) => void;
}

export function ProblemPanel({ problem, collapsed, onToggle, problems, selectedIndex = 0, onSelectProblem }: Props) {
  const [tab, setTab] = useState<"problem" | "hints" | "notes">("problem");
  const [revealedHints, setRevealedHints] = useState(0);

  if (collapsed) {
    return (
      <aside className="flex h-full w-10 flex-col items-center gap-3 border-r border-line/60 bg-void/60 py-3 shrink-0">
        <button
          onClick={onToggle}
          className="flex h-9 w-9 items-center justify-center border border-line/60 bg-panel/60 text-text-dim transition hover:border-neon/60 hover:text-neon bl-clip-chevron"
          aria-label="Expand problem panel"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
        <div
          className="font-display text-[10px] font-bold tracking-[0.3em] text-text-dim"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          PROBLEM
        </div>
      </aside>
    );
  }

  if (!problem) {
    return (
      <aside className="relative flex h-full w-full flex-col border-r border-line/60 bg-void/50 lg:w-[400px] shrink-0 items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="font-display text-[11px] font-bold tracking-[0.2em] text-text-dim">NO PROBLEM LOADED</p>
          <p className="font-mono text-[10px] text-text-mute">Waiting for the arbiter to assign a problem.</p>
        </div>
      </aside>
    );
  }

  const diffTone =
    problem.difficulty.toLowerCase() === "hard"
      ? "border-blood/50 bg-blood/10 text-blood"
      : problem.difficulty.toLowerCase() === "medium"
        ? "border-gold/50 bg-gold/10 text-gold"
        : "border-neon/50 bg-neon/10 text-neon";

  return (
    <aside className="relative flex h-full w-full flex-col border-r border-line/60 bg-void/50 lg:w-[400px] xl:w-[440px] shrink-0">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-10" />

      <div className="relative flex items-center gap-2 border-b border-line/60 bg-panel/40 px-4 py-3">
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center border border-line/60 bg-void/50 text-text-dim transition hover:border-neon/60 hover:text-neon"
        >
          <PanelLeftClose className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] tracking-[0.16em] text-text-mute">{problem.id.slice(0, 8)}</span>
          <span className={`inline-flex items-center gap-1 border px-2 py-0.5 font-display text-[9px] font-bold tracking-[0.22em] bl-clip-chevron ${diffTone}`}>
            <Zap className="h-2.5 w-2.5" />
            {problem.difficulty.toUpperCase()}
          </span>
        </div>
        {problem.score !== undefined && (
          <div className="ml-auto flex items-center gap-1.5">
            <Target className="h-3 w-3 text-gold" />
            <span className="font-mono text-[11px] font-bold text-gold tabular-nums">{problem.score}</span>
            <span className="font-mono text-[10px] text-text-mute">pts</span>
          </div>
        )}
      </div>

      <div className="relative border-b border-line/60 px-4 pt-4 pb-3">
        <h2 className="font-display text-xl font-bold leading-tight tracking-tight text-text">{problem.title}</h2>
        {(problem.acceptance !== undefined || problem.stake !== undefined) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {problem.acceptance !== undefined && (
              <div className="flex items-center gap-1 text-text-dim">
                <TrendingUp className="h-3 w-3" />
                <span className="font-mono text-[10px] tabular-nums">{problem.acceptance}% AC</span>
              </div>
            )}
            {problem.stake !== undefined && (
              <>
                <span className="text-text-mute">·</span>
                <span className="font-mono text-[10px] text-gold">+{problem.stake} LP stake</span>
              </>
            )}
          </div>
        )}
        {problem.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {problem.topics.map((t) => (
              <span key={t} className="border border-line/70 bg-void/40 px-1.5 py-0.5 font-mono text-[9px] tracking-[0.1em] text-text-dim">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="relative flex border-b border-line/60 bg-void/30">
        {([
          { id: "problem", label: "Problem", icon: BookOpen },
          { id: "hints", label: "Hints", icon: Lightbulb },
          { id: "notes", label: "Notes", icon: StickyNote },
        ] as const).map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`relative flex-1 border-r border-line/60 px-3 py-2 text-left transition last:border-r-0 ${
                active ? "bg-panel/50" : "hover:bg-panel/30"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className={`h-3 w-3 ${active ? "text-neon" : "text-text-mute"}`} />
                <span className={`font-display text-[10px] font-bold tracking-[0.2em] ${active ? "text-text" : "text-text-dim"}`}>
                  {label.toUpperCase()}
                </span>
              </div>
              {active && <span className="absolute inset-x-0 bottom-0 h-px bg-neon" />}
            </button>
          );
        })}
      </div>

      <div className="relative flex-1 overflow-y-auto px-4 py-4">
        {tab === "problem" && (
          <div className="space-y-5">
            <section className="space-y-3">
              {problem.statement.map((p, i) => (
                <p key={i} className="text-[13px] leading-relaxed text-text-dim">{p}</p>
              ))}
            </section>

            {problem.constraints.length > 0 && (
              <section>
                <h3 className="mb-2 font-display text-[10px] font-bold tracking-[0.24em] text-text-mute">CONSTRAINTS</h3>
                <div className="grid grid-cols-3 gap-1.5">
                  {problem.constraints.map((c) => (
                    <div key={c.k} className="border border-line/60 bg-void/40 px-2 py-2 bl-clip-chevron">
                      <div className="font-mono text-[8px] tracking-[0.18em] text-text-mute">{c.k}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-neon">{c.v}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {problem.examples.length > 0 && (
              <section className="space-y-3">
                <h3 className="font-display text-[10px] font-bold tracking-[0.24em] text-text-mute">EXAMPLES</h3>
                {problem.examples.map((ex, i) => (
                  <div key={i} className="border border-line/60 bg-void/50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 items-center justify-center border border-neon/40 bg-neon/10 font-mono text-[10px] font-bold text-neon">
                        {i + 1}
                      </span>
                      <span className="font-display text-[10px] font-bold tracking-[0.22em] text-text">EXAMPLE</span>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="font-mono text-[9px] tracking-[0.18em] text-text-mute">INPUT</div>
                        <pre className="mt-1 border-l-2 border-neon/50 bg-void/80 px-2 py-1.5 font-mono text-[11px] text-text whitespace-pre-wrap">
                          {ex.input}
                        </pre>
                      </div>
                      <div>
                        <div className="font-mono text-[9px] tracking-[0.18em] text-text-mute">OUTPUT</div>
                        <pre className="mt-1 border-l-2 border-gold/60 bg-void/80 px-2 py-1.5 font-mono text-[11px] text-gold">
                          {ex.output}
                        </pre>
                      </div>
                      {ex.explanation && (
                        <p className="text-[11.5px] leading-relaxed text-text-dim">
                          <span className="font-mono text-[9px] tracking-[0.18em] text-text-mute">NOTE:</span> {ex.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        )}

        {tab === "hints" && (
          <div className="space-y-3">
            {!problem.hints || problem.hints.length === 0 ? (
              <p className="font-mono text-[11px] text-text-mute">No hints available for this problem.</p>
            ) : (
              <>
                <p className="text-[12px] leading-relaxed text-text-dim">
                  Each hint costs <span className="text-ember font-bold">−5 LP</span>. Reveal wisely.
                </p>
                {problem.hints.map((h, i) => {
                  const revealed = i < revealedHints;
                  return (
                    <div key={i} className={`relative border p-3 transition ${revealed ? "border-gold/40 bg-gold/5" : "border-line/60 bg-void/40"}`}>
                      <div className="mb-2 flex items-center gap-2">
                        <Lightbulb className={`h-3.5 w-3.5 ${revealed ? "text-gold" : "text-text-mute"}`} />
                        <span className="font-display text-[10px] font-bold tracking-[0.22em] text-text">HINT {i + 1}</span>
                      </div>
                      {revealed ? (
                        <p className="text-[12px] leading-relaxed text-text">{h}</p>
                      ) : (
                        <button onClick={() => setRevealedHints((n) => Math.max(n, i + 1))} className="font-mono text-[11px] text-ember hover:text-gold">
                          {"→ Reveal hint · −5 LP"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {tab === "notes" && (
          <div className="flex h-full flex-col gap-2">
            <p className="font-mono text-[10px] tracking-[0.14em] text-text-mute">
              Scratchpad — visible only to you. Cleared when the battle ends.
            </p>
            <textarea
              className="flex-1 resize-none border border-line/60 bg-void/70 p-3 font-mono text-[12px] leading-relaxed text-text outline-none focus:border-neon/60"
              placeholder="// jot down approaches, edge cases…"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
