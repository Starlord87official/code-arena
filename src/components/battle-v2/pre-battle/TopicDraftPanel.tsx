import { useEffect, useMemo, useState } from "react";
import { Ban, Sparkles, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TOPICS = [
  "Arrays",
  "Strings",
  "DP",
  "Graphs",
  "Trees",
  "Greedy",
  "Math",
  "BitMagic",
];

type Phase = "ban" | "pick" | "done";

interface UserChoice {
  ban?: string;
  pick?: string;
}

interface Props {
  matchId: string;
}

export function TopicDraftPanel({ matchId }: Props) {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("ban");
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [choices, setChoices] = useState<Record<string, UserChoice>>({});

  // Load initial state + subscribe
  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("battle_matches")
        .select("topic_choices")
        .eq("id", matchId)
        .maybeSingle();
      if (!active) return;
      const tc = (data?.topic_choices ?? {}) as Record<string, UserChoice>;
      setChoices(tc);
    };
    load();
    const ch = supabase
      .channel(`topic-draft-${matchId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "battle_matches", filter: `id=eq.${matchId}` },
        (payload) => {
          const tc = ((payload.new as { topic_choices?: Record<string, UserChoice> }).topic_choices ?? {}) as Record<string, UserChoice>;
          setChoices(tc);
        },
      )
      .subscribe();
    return () => {
      active = false;
      supabase.removeChannel(ch);
    };
  }, [matchId]);

  const myChoice: UserChoice = (user?.id && choices[user.id]) || {};

  // Drive phase from my own progress
  useEffect(() => {
    if (myChoice.pick) setPhase("done");
    else if (myChoice.ban) setPhase("pick");
    else setPhase("ban");
    setSecondsLeft(15);
  }, [myChoice.ban, myChoice.pick]);

  // Countdown timer per phase
  useEffect(() => {
    if (phase === "done") return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Auto-pick on timeout
  useEffect(() => {
    if (phase === "done" || secondsLeft > 0) return;
    const taken = new Set<string>([
      ...(myChoice.ban ? [myChoice.ban] : []),
      ...(myChoice.pick ? [myChoice.pick] : []),
    ]);
    const remaining = TOPICS.filter((t) => !taken.has(t));
    if (!remaining.length) return;
    const random = remaining[Math.floor(Math.random() * remaining.length)];
    submit(phase, random, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, phase]);

  const submit = async (kind: Phase, topic: string, auto = false) => {
    if (kind === "done" || submitting) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.rpc("mm_submit_topic_choice", {
        p_match_id: matchId,
        p_kind: kind,
        p_topic: topic,
      });
      if (error) throw error;
      if (auto) toast.message(`Auto-${kind === "ban" ? "banned" : "picked"} ${topic}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to submit";
      if (!/already submitted/i.test(msg)) toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const myBans = useMemo(() => Object.values(choices).map((c) => c.ban).filter(Boolean) as string[], [choices]);

  if (phase === "done") {
    return (
      <div className="border border-line bg-panel/60 bl-glass px-5 py-4">
        <div className="flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.2em] text-neon">
          <Sparkles className="h-4 w-4" />
          DRAFT LOCKED — WAITING FOR OPPONENT
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
          {myChoice.ban && (
            <span className="border border-blood/40 bg-blood/10 px-2 py-0.5 font-mono text-blood line-through">
              BAN · {myChoice.ban}
            </span>
          )}
          {myChoice.pick && (
            <span className="border border-neon/40 bg-neon/10 px-2 py-0.5 font-mono text-neon">
              PICK · {myChoice.pick}
            </span>
          )}
        </div>
      </div>
    );
  }

  const phaseLabel = phase === "ban" ? "BAN A TOPIC" : "PICK A TOPIC";
  const phaseColor = phase === "ban" ? "text-blood" : "text-neon";
  const PhaseIcon = phase === "ban" ? Ban : Sparkles;

  return (
    <div className="relative overflow-hidden border border-line bg-panel/60 bl-glass bl-corners">
      <div className="pointer-events-none absolute inset-0 bl-grid opacity-15" />
      <header className="relative flex items-center justify-between border-b border-line/60 px-5 py-3 bl-side-stripe">
        <div className={cn("flex items-center gap-2 font-display text-[12px] font-bold tracking-[0.22em]", phaseColor)}>
          <PhaseIcon className="h-4 w-4" />
          {phaseLabel}
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.14em] text-text-mute">
          <Timer className="h-3 w-3" />
          {String(secondsLeft).padStart(2, "0")}s
        </div>
      </header>

      <div className="relative grid grid-cols-2 gap-2 p-4 md:grid-cols-4">
        {TOPICS.map((t) => {
          const isOwnBan = myChoice.ban === t;
          const isOwnPick = myChoice.pick === t;
          const isGloballyBanned = myBans.includes(t);
          const disabled = submitting || isOwnBan || isOwnPick || (phase === "pick" && isGloballyBanned);
          return (
            <button
              key={t}
              type="button"
              disabled={disabled}
              onClick={() => submit(phase, t)}
              className={cn(
                "border px-3 py-2.5 font-display text-[11px] font-bold tracking-[0.18em] uppercase transition-all bl-clip-chevron",
                "hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40",
                phase === "ban"
                  ? "border-blood/40 bg-blood/5 text-blood hover:bg-blood/15"
                  : "border-neon/40 bg-neon/5 text-neon hover:bg-neon/15",
                isGloballyBanned && "line-through opacity-50",
              )}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}
