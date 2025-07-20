import axios from "axios";
import { useEffect, useState } from "react";
import {
  fetchTopByUploadCount,
  fetchTopByLikesCount,
  fetchTopByMaxStreak,
  fetchCurrentUserStatsWithRank,
} from "@/lib/services/statsService";
import { Badge } from "@/types/badges";

type User = {
  user_id: number; // used as a key when rendering the table
  rank: number;
  username: string;
  uploads: number;
  streak: number;
  likes: number;
};

type SortKey = "upload_count" | "likes_count" | "max_streak";

function transformToUser(u: any, rank: number): User {
  return {
    user_id: u.user_id,
    rank,
    username: u.username,
    uploads: u.upload_count,
    streak: u.max_streak,
    likes: u.likes_count,
  };
}

export function useCommunityStats(userId: string | undefined) {
  const [sortKey, setSortKey] = useState<SortKey>("upload_count");
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserStat, setCurrentUserStat] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);

  const maxVisible = 50;

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      try {
        let data: any[] = [];
        if (sortKey === "upload_count")
          data = await fetchTopByUploadCount(maxVisible);
        else if (sortKey === "likes_count")
          data = await fetchTopByLikesCount(maxVisible);
        else if (sortKey === "max_streak")
          data = await fetchTopByMaxStreak(maxVisible);

        const topUsers = data.map((u) => transformToUser(u, u.rank));
        setUsers(topUsers);

        const badgesResponse = await axios.get(`/api/general-data/badges`);
        setAllBadges(badgesResponse.data);

        if (!userId) {
          setCurrentUserStat(null);
          return;
        }

        const stat = await fetchCurrentUserStatsWithRank(userId, sortKey);
        setCurrentUserStat(transformToUser(stat, stat.rank));
      } catch (e) {
        console.error("Error loading leaderboard:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [userId, sortKey]);

  return {
    sortKey,
    users,
    currentUserStat,
    loading,
    setSortKey,
    allBadges,
  };
}
