import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { DayData } from "@/lib/activityData";
import { fmtISO } from "@/lib/activityData";

interface HeatmapStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  totalSolved: number;
  peakDay: { date: string; count: number } | null;
  hardestSolved: string | null;
}

interface UseHeatmapDataReturn {
  data: DayData[];
  stats: HeatmapStats;
  isLoading: boolean;
  error: string | null;
}

export function useHeatmapData(): UseHeatmapDataReturn {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<
    { completed_at: string; challenge_id: string; xp_earned: number; difficulty?: string }[]
  >([]);
  const [profile, setProfile] = useState<{ xp: number; streak: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Calculate date range: last 52 weeks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDow = today.getDay();
        const thisSunday = new Date(today);
        thisSunday.setDate(today.getDate() - currentDow);
        const startDate = new Date(thisSunday);
        startDate.setDate(startDate.getDate() - 51 * 7);
        const startISO = fmtISO(startDate);

        // Fetch completions with challenge difficulty
        const { data: compData, error: compErr } = await supabase
          .from("challenge_completions")
          .select("completed_at, challenge_id, xp_earned, challenges(difficulty)")
          .eq("user_id", user.id)
          .gte("completed_at", startISO);

        if (compErr) throw compErr;

        const mapped = (compData || []).map((c: any) => ({
          completed_at: c.completed_at,
          challenge_id: c.challenge_id,
          xp_earned: c.xp_earned || 0,
          difficulty: c.challenges?.difficulty || "medium",
        }));
        setCompletions(mapped);

        // Fetch profile stats
        const { data: profData, error: profErr } = await supabase
          .from("profiles")
          .select("xp, streak")
          .eq("id", user.id)
          .maybeSingle();

        if (profErr) throw profErr;
        setProfile(profData || { xp: 0, streak: 0 });
      } catch (err: any) {
        console.error("Heatmap data fetch error:", err);
        setError(err.message || "Failed to load activity data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const { data, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDow = today.getDay();
    const thisSunday = new Date(today);
    thisSunday.setDate(today.getDate() - currentDow);
    const startDate = new Date(thisSunday);
    startDate.setDate(startDate.getDate() - 51 * 7);

    // Group completions by date
    const byDate = new Map<string, { total: number; hardCount: number; xp: number }>();
    for (const c of completions) {
      const dateStr = c.completed_at.split("T")[0];
      const existing = byDate.get(dateStr) || { total: 0, hardCount: 0, xp: 0 };
      existing.total += 1;
      if (c.difficulty === "hard" || c.difficulty === "extreme") {
        existing.hardCount += 1;
      }
      existing.xp += c.xp_earned;
      byDate.set(dateStr, existing);
    }

    // Build DayData array
    const days: DayData[] = [];
    for (let week = 0; week < 52; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + week * 7 + day);
        date.setHours(0, 0, 0, 0);
        const dateStr = fmtISO(date);
        const isFuture = date > today;

        if (isFuture || !byDate.has(dateStr)) {
          days.push({
            date,
            dateStr,
            submissions: 0,
            accepted: 0,
            wrong: 0,
            solved: 0,
            hardSolved: 0,
            timeSpent: 0,
            weekIndex: week,
            dayIndex: day,
          });
          continue;
        }

        const info = byDate.get(dateStr)!;
        // Each completion is a solved problem (accepted submission)
        const solved = info.total;
        // Estimate submissions as slightly more than solved (realistic ratio)
        const submissions = solved;
        const accepted = solved;

        days.push({
          date,
          dateStr,
          submissions,
          accepted,
          wrong: 0,
          solved,
          hardSolved: info.hardCount,
          timeSpent: solved * 25, // estimate ~25 min per problem
          weekIndex: week,
          dayIndex: day,
        });
      }
    }

    // Compute stats
    let peakDay: { date: string; count: number } | null = null;
    let longestStreak = 0;
    let currentStreak = 0;
    let totalSolved = 0;
    let tempStreak = 0;

    // Find hardest solved
    let hardestSolved: string | null = null;
    const diffRank: Record<string, number> = { easy: 1, medium: 2, hard: 3, extreme: 4 };
    let maxDiffRank = 0;
    for (const c of completions) {
      const rank = diffRank[c.difficulty || "medium"] || 2;
      if (rank > maxDiffRank) {
        maxDiffRank = rank;
        hardestSolved = c.difficulty || null;
      }
    }

    for (const d of days) {
      totalSolved += d.solved;
      if (d.solved > 0) {
        if (!peakDay || d.solved > peakDay.count) {
          peakDay = { date: d.dateStr, count: d.solved };
        }
      }
    }

    // Calculate streaks from the data (ordered chronologically)
    const nonFutureDays = days.filter((d) => d.date <= today);
    for (const d of nonFutureDays) {
      if (d.submissions > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Current streak: count backwards from today/yesterday
    currentStreak = 0;
    for (let i = nonFutureDays.length - 1; i >= 0; i--) {
      const d = nonFutureDays[i];
      if (d.submissions > 0) {
        currentStreak++;
      } else {
        // Allow today to be empty (streak from yesterday)
        if (i === nonFutureDays.length - 1 && d.dateStr === fmtISO(today)) {
          continue;
        }
        break;
      }
    }

    return {
      data: days,
      stats: {
        totalXP: profile?.xp || 0,
        currentStreak: profile?.streak ?? currentStreak,
        longestStreak,
        totalSolved,
        peakDay,
        hardestSolved,
      },
    };
  }, [completions, profile]);

  return { data, stats, isLoading, error };
}
