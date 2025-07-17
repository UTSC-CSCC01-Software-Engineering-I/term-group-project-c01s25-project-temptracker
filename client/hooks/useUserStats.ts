import axios from "axios";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchCurrentUserStatsWithRank } from "@/lib/services/statsService";

export function useUserStats(userId: string | undefined) {
  const [streak, setStreak] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [badges, setBadges] = useState([]);

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

        const badgesResponse = await axios.get(
          `${API_BASE_URL}/users/${userId}/badges`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        const awardedBadges = await axios.post(
          `${API_BASE_URL}/users/${userId}/badges/award`,
          {},
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        console.log("awardedBadges:", awardedBadges);

        setRank(stats.rank);
        setStreak(stats.curr_streak);
        setBadges(badgesResponse.data || []);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    loadStats();
  }, [userId]);

  return { streak, rank, badges };
}
