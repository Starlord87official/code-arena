import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HEARTBEAT_MS = 15_000;
const HIDDEN_GRACE_MS = 60_000;

export function useBattleHeartbeat(matchId: string | undefined, enabled: boolean = true) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenSinceRef = useRef<number | null>(null);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!matchId || !enabled) return;

    const beat = async () => {
      try {
        await supabase.rpc("heartbeat_match", { p_match_id: matchId });
      } catch {
        /* swallow — sweep will catch us */
      }
    };

    const start = () => {
      if (intervalRef.current) return;
      beat();
      intervalRef.current = setInterval(beat, HEARTBEAT_MS);
    };

    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenSinceRef.current = Date.now();
      } else {
        const hiddenFor = hiddenSinceRef.current ? Date.now() - hiddenSinceRef.current : 0;
        hiddenSinceRef.current = null;
        if (hiddenFor > HIDDEN_GRACE_MS && warnedRef.current) {
          toast.info("Reconnected to battle.");
          warnedRef.current = false;
        }
        start();
        beat();
      }
    };

    const tickHidden = setInterval(() => {
      if (hiddenSinceRef.current && Date.now() - hiddenSinceRef.current > HIDDEN_GRACE_MS && !warnedRef.current) {
        warnedRef.current = true;
        toast.error("Connection lost — return within 60s to avoid forfeit.");
        stop();
      }
    }, 5000);

    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(tickHidden);
      stop();
    };
  }, [matchId, enabled]);
}
