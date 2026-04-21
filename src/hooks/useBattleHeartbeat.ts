import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const HEARTBEAT_MS = 15_000;
const HIDDEN_GRACE_MS = 60_000;

export function useBattleHeartbeat(
  matchId: string | undefined,
  enabled: boolean = true,
  onInvalid?: () => void,
) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hiddenSinceRef = useRef<number | null>(null);
  const warnedRef = useRef(false);
  const invalidFiredRef = useRef(false);
  const onInvalidRef = useRef(onInvalid);

  useEffect(() => {
    onInvalidRef.current = onInvalid;
  }, [onInvalid]);

  useEffect(() => {
    if (!matchId || !enabled) return;
    invalidFiredRef.current = false;

    const handleInvalid = () => {
      if (invalidFiredRef.current) return;
      invalidFiredRef.current = true;
      stop();
      onInvalidRef.current?.();
    };

    const beat = async () => {
      try {
        const { data, error } = await supabase.rpc("heartbeat_match", { p_match_id: matchId });
        // RPC returns void/null on success; an explicit { success:false } means stop
        if (error) {
          const msg = String(error.message || "").toLowerCase();
          if (msg.includes("not_participant") || msg.includes("not a participant") || msg.includes("invalid") || msg.includes("expired")) {
            handleInvalid();
          }
          return;
        }
        if (data && typeof data === "object" && (data as any).success === false) {
          handleInvalid();
        }
      } catch {
        /* network blip — sweep will catch us */
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
