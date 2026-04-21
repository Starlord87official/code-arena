import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Battle Integrity Hook
 * --------------------------------------------------------------------
 * Tracks suspicious behavior during an active ranked battle and posts
 * throttled events to the server via `record_integrity_event`. The
 * server is authoritative on flags + integrity score; this hook only
 * surfaces user-facing warnings as the score drops.
 */

export type IntegrityKind =
  | "tab_switch"
  | "paste"
  | "fullscreen_exit"
  | "devtools_open";

interface Options {
  matchId: string | undefined;
  enabled: boolean;
  /** Current integrity score from realtime participant row, used for threshold toasts. */
  integrityScore?: number | null;
}

const DEBOUNCE_MS = 500;

export function useBattleIntegrity({ matchId, enabled, integrityScore }: Options) {
  const lastSentRef = useRef<Record<string, number>>({});
  const hiddenSinceRef = useRef<number | null>(null);
  const pasteRunRef = useRef<{ chars: number; total: number }>({ chars: 0, total: 0 });
  const warnedRef = useRef<{ at80: boolean; at50: boolean; at20: boolean }>({
    at80: false,
    at50: false,
    at20: false,
  });

  const post = useCallback(
    async (kind: IntegrityKind, payload: Record<string, unknown>) => {
      if (!matchId) return;
      const now = Date.now();
      const last = lastSentRef.current[kind] ?? 0;
      if (now - last < DEBOUNCE_MS) return;
      lastSentRef.current[kind] = now;
      try {
        await (supabase.rpc as any)("record_integrity_event", {
          p_match_id: matchId,
          p_kind: kind,
          p_payload: payload,
        });
      } catch (e) {
        // Silent — server-side is best-effort.
        console.warn("integrity event failed:", e);
      }
    },
    [matchId],
  );

  // Threshold toasts driven by realtime integrity_score
  useEffect(() => {
    if (!enabled || integrityScore == null) return;
    if (integrityScore <= 20 && !warnedRef.current.at20) {
      warnedRef.current.at20 = true;
      toast.error("Integrity critical — match may be invalidated.");
    } else if (integrityScore <= 50 && !warnedRef.current.at50) {
      warnedRef.current.at50 = true;
      toast.warning("Integrity dropping — admins are reviewing.");
    } else if (integrityScore <= 80 && !warnedRef.current.at80) {
      warnedRef.current.at80 = true;
      toast.message("Stay on this tab — switching is being tracked.");
    }
  }, [integrityScore, enabled]);

  // Visibility, fullscreen, and devtools detection
  useEffect(() => {
    if (!enabled || !matchId) return;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenSinceRef.current = Date.now();
      } else if (hiddenSinceRef.current) {
        const focusLostMs = Date.now() - hiddenSinceRef.current;
        hiddenSinceRef.current = null;
        post("tab_switch", { focus_lost_ms: focusLostMs });
      }
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        post("fullscreen_exit", { at: Date.now() });
      }
    };

    // Best-effort devtools heuristic: large window outerHeight / innerHeight delta
    let devtoolsFlagged = false;
    const checkDevtools = () => {
      if (devtoolsFlagged) return;
      const threshold = 160;
      const widthDelta = window.outerWidth - window.innerWidth;
      const heightDelta = window.outerHeight - window.innerHeight;
      if (widthDelta > threshold || heightDelta > threshold) {
        devtoolsFlagged = true;
        post("devtools_open", { width_delta: widthDelta, height_delta: heightDelta });
      }
    };
    const devtoolsTimer = setInterval(checkDevtools, 4000);

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      clearInterval(devtoolsTimer);
    };
  }, [enabled, matchId, post]);

  /** Caller (CodeEditor) hands us a paste event; we capture chars + post. */
  const reportPaste = useCallback(
    (chars: number, totalAfter: number) => {
      pasteRunRef.current.chars += chars;
      pasteRunRef.current.total = totalAfter;
      post("paste", { chars, total_after: totalAfter });
    },
    [post],
  );

  /** Used by submit flow to compute paste_ratio at submission time. */
  const getPasteRatio = useCallback((finalCodeLen: number): number => {
    const pasted = pasteRunRef.current.chars;
    if (finalCodeLen <= 0) return 0;
    return Math.min(1, Math.round((pasted / finalCodeLen) * 1000) / 1000);
  }, []);

  /** Reset paste tally when user moves to a different problem. */
  const resetPasteTally = useCallback(() => {
    pasteRunRef.current = { chars: 0, total: 0 };
  }, []);

  return { reportPaste, getPasteRatio, resetPasteTally };
}
