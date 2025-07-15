import axios from "axios";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchCurrentUserStatsWithRank } from "@/lib/services/statsService";

export function useUserStats(userId: string | undefined) {
  const [streak, setStreak] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) return;

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No access token found");
      }

      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

        const stats = await fetchCurrentUserStatsWithRank(
          userId,
          "upload_count"
        );

        setRank(stats.rank);
        setStreak(stats.curr_streak);
        console.log("User stats:", stats);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    loadStats();
  }, [userId]);

  return { streak, rank };
}
