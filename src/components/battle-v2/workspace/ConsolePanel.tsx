import { useState } from "react";
import { FlaskConical, Terminal, History, ChevronUp, ChevronDown, Check, X, Clock } from "lucide-react";
import type { Verdict } from "../types";

export interface TestCase {
  id: string;
  input: string;
  expected: string;
  actual?: string;
  status: Verdict;
  runtimeMs?: number;
  memoryKb?: number;
}

export interface SubmissionRow {
  id: string;
  time: string;
  lang: string;
  verdict: Verdict;
  passed: number;
  total: number;
  runtimeMs?: number;
}

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  running: boolean;
  testCases: TestCase[];
  submissions: SubmissionRow[];
  consoleOutput?: string;
}

function VerdictPill({ v }: { v: Verdict }) {
  const map: Record<Verdict, string> = {
    AC: "border-neon/50 bg-neon/10 text-neon",
    WA: "border-ember/60 bg-ember/10 text-ember",
    TLE: "border-gold/60 bg-gold/10 text-gold",
    RE: "border-blood/60 bg-blood/10 text-blood",
    PENDING: "border-line/60 bg-void/40 text-text-mute",
  };
  return (
    <span className={`inline-flex items-center border px-1.5 py-0.5 font-display text-[9px] font-bold tracking-[0.18em] ${map[v]}`}>
      {v === "PENDING" ? "PEND" : v}
    </span>
  );
}

export function ConsolePanel({ collapsed, onToggle, running, testCases, submissions, consoleOutput }: Props) {
  const [tab, setTab] = useState<"tests" | "console" | "history">("tests");
  const [openCase, setOpenCase] = useState(testCases[0]?.id ?? "");

  const passed = testCases.filter((t) => t.status === "AC").length;

  return (
    <section
      className={`relative flex flex-col border-t border-line/60 bg-void/70 backdrop-blur-md transition-all ${
        collapsed ? "h-10" : "h-[44vh] min-h-[260px]"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-10" />

      <div className="relative flex items-center border-b border-line/60 bg-panel/30">
        {([
          { id: "tests", label: "Test Cases", icon: FlaskConical, count: `${passed}/${testCases.length}` },
          { id: "console", label: "Console", icon: Terminal, count: null },
          { id: "history", label: "Submissions", icon: History, count: String(submissions.length) },
        ] as const).map(({ id, label, icon: Icon, count }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                if (collapsed) onToggle();
              }}
              className={`relative flex items-center gap-1.5 border-r border-line/60 px-3.5 h-9 transition ${
                active ? "bg-panel/60" : "hover:bg-panel/30"
              }`}
            >
              <Icon className={`h-3 w-3 ${active ? "text-neon" : "text-text-mute"}`} />
              <span className={`font-display text-[10px] font-bold tracking-[0.2em] ${active ? "text-text" : "text-text-dim"}`}>
                {label.toUpperCase()}
              </span>
              {count && <span className="ml-1 font-mono text-[9px] text-neon">{count}</span>}
              {active && <span className="absolute inset-x-0 bottom-0 h-px bg-neon" />}
            </button>
          );
        })}

        {running && !collapsed && (
          <div className="ml-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-neon bl-flicker" />
            <span className="font-mono text-[10px] tracking-[0.18em] text-neon">EXECUTING</span>
          </div>
        )}

        <button
          onClick={onToggle}
          className="ml-auto flex h-9 w-9 items-center justify-center text-text-mute transition hover:text-neon"
        >
          {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {!collapsed && (
        <div className="relative flex-1 overflow-hidden">
          {tab === "tests" && (
            <div className="flex h-full">
              <ul className="w-48 shrink-0 overflow-y-auto border-r border-line/60 bg-void/40">
                {testCases.length === 0 ? (
                  <li className="p-4 font-mono text-[10px] text-text-mute">No test cases</li>
                ) : (
                  testCases.map((tc) => {
                    const active = openCase === tc.id;
                    return (
                      <li key={tc.id}>
                        <button
                          onClick={() => setOpenCase(tc.id)}
                          className={`flex w-full items-center gap-2 border-b border-line/40 px-3 py-2 text-left transition ${
                            active ? "bg-panel/60" : "hover:bg-panel/30"
                          }`}
                        >
                          {tc.status === "AC" ? (
                            <Check className="h-3 w-3 text-neon" />
                          ) : tc.status === "PENDING" ? (
                            <Clock className="h-3 w-3 text-text-mute" />
                          ) : (
                            <X className="h-3 w-3 text-ember" />
                          )}
                          <span className="font-mono text-[11px] text-text">{tc.id}</span>
                          <span className="ml-auto"><VerdictPill v={tc.status} /></span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
              <div className="flex-1 overflow-y-auto p-4">
                {(() => {
                  const tc = testCases.find((t) => t.id === openCase) ?? testCases[0];
                  if (!tc) return <p className="font-mono text-[11px] text-text-mute">Select a test case.</p>;
                  return (
                    <div className="grid gap-3 md:grid-cols-3">
                      <div>
                        <div className="font-display text-[9px] font-bold tracking-[0.24em] text-text-mute mb-1">INPUT</div>
                        <pre className="border-l-2 border-neon/50 bg-void/80 px-2.5 py-2 font-mono text-[11.5px] text-text whitespace-pre-wrap">{tc.input}</pre>
                      </div>
                      <div>
                        <div className="font-display text-[9px] font-bold tracking-[0.24em] text-text-mute mb-1">EXPECTED</div>
                        <pre className="border-l-2 border-gold/50 bg-void/80 px-2.5 py-2 font-mono text-[11.5px] text-gold">{tc.expected}</pre>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-display text-[9px] font-bold tracking-[0.24em] text-text-mute">YOUR OUTPUT</span>
                          <VerdictPill v={tc.status} />
                        </div>
                        <pre className={`border-l-2 bg-void/80 px-2.5 py-2 font-mono text-[11.5px] whitespace-pre-wrap ${
                          tc.status === "AC" ? "border-neon/50 text-neon" : "border-ember/60 text-ember"
                        }`}>
                          {tc.actual ?? "—"}
                        </pre>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {tab === "console" && (
            <div className="h-full overflow-y-auto bg-[#040811] p-4 font-mono text-[11.5px] leading-relaxed">
              {consoleOutput ? (
                <pre className="text-text whitespace-pre-wrap">{consoleOutput}</pre>
              ) : (
                <p className="text-text-mute">Run your code to see output…</p>
              )}
            </div>
          )}

          {tab === "history" && (
            <div className="h-full overflow-y-auto">
              {submissions.length === 0 ? (
                <p className="p-6 text-center font-mono text-[11px] text-text-mute">No submissions yet.</p>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-panel/80">
                    <tr className="border-b border-line/60 text-text-mute">
                      {["#", "TIME", "LANG", "VERDICT", "PASSED", "RUNTIME"].map((h) => (
                        <th key={h} className="px-3 py-2 font-display text-[9px] font-bold tracking-[0.22em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s.id} className="border-b border-line/40 hover:bg-panel/40">
                        <td className="px-3 py-2 font-mono text-[11px] text-text">{s.id}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-text-dim">{s.time}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-text-dim">{s.lang}</td>
                        <td className="px-3 py-2"><VerdictPill v={s.verdict} /></td>
                        <td className="px-3 py-2 font-mono text-[11px] text-text">{s.passed}/{s.total}</td>
                        <td className="px-3 py-2 font-mono text-[11px] text-text-dim">{s.runtimeMs ? `${s.runtimeMs}ms` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
