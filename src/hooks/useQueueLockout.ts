import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface QueueLockout {
  reason: string;
  locked_until: string;
  meta?: { lp_penalty?: number; count_24h?: number } | null;
}

export function useQueueLockout() {
  const { user } = useAuth();
  const [now, setNow] = useState(Date.now());

  const { data: lockout, refetch } = useQuery({
    queryKey: ["queue-lockout", user?.id],
    queryFn: async (): Promise<QueueLockout | null> => {
      const { data, error } = await (supabase.rpc as any)("get_active_queue_lockout");
      if (error) throw error;
      return (data as QueueLockout) ?? null;
    },
    enabled: !!user,
    refetchInterval: 15_000,
  });

  useEffect(() => {
    if (!lockout) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockout]);

  if (!lockout) return { lockout: null, secondsRemaining: 0, refetch };

  const remainingMs = new Date(lockout.locked_until).getTime() - now;
  const secondsRemaining = Math.max(0, Math.floor(remainingMs / 1000));

  if (secondsRemaining === 0 && lockout) {
    // auto-refresh when expired
    setTimeout(() => refetch(), 100);
  }

  return { lockout: secondsRemaining > 0 ? lockout : null, secondsRemaining, refetch };
}

export function formatLockoutTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
