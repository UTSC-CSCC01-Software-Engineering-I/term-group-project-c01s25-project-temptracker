// RECONSIDER: currently a full frontend service
import { createClient } from "../supabase/client";
import axios from "axios";

const supabase = createClient();

// fixes tied ranking issue, O(50) complexity is negligible
function assignRanksWithTies(
  data: any[],
  orderBy: "upload_count" | "likes_count" | "max_streak"
) {
  let rank = 0;
  let lastValue: number | null = null;
  let countSame = 0;

  return data.map((item, index) => {
    const currentValue = item[orderBy];

    if (currentValue !== lastValue) {
      rank = rank + countSame + 1;
      countSame = 0;
      lastValue = currentValue;
    } else {
      countSame++;
    }

    return { ...item, rank };
  });
}

export async function fetchTopByUploadCount() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/general-data/top-user-stats/upload_count`
  );

  if (!res.data) return [];

  const rankedData = assignRanksWithTies(res.data, "upload_count");

  return rankedData.map((row: any) => ({
    user_id: row.user_id,
    username: row.user_profile?.username ?? "Unknown",
    curr_streak: row.curr_streak,
    max_streak: row.max_streak,
    upload_count: row.upload_count,
    likes_count: row.likes_count,
    rank: row.rank,
  }));
}

export async function fetchTopByLikesCount() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/general-data/top-user-stats/likes_count`
  );

  if (!res.data) return [];

  const rankedData = assignRanksWithTies(res.data, "likes_count");

  return rankedData.map((row: any) => ({
    user_id: row.user_id,
    username: row.user_profile?.username ?? "Unknown",
    curr_streak: row.curr_streak,
    max_streak: row.max_streak,
    upload_count: row.upload_count,
    likes_count: row.likes_count,
    rank: row.rank,
  }));
}

export async function fetchTopByMaxStreak() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_API_URL}/general-data/top-user-stats/max_streak`
  );

  if (!res.data) return [];

  const rankedData = assignRanksWithTies(res.data, "max_streak");

  return rankedData.map((row: any) => ({
    user_id: row.user_id,
    username: row.user_profile?.username ?? "Unknown",
    curr_streak: row.curr_streak,
    max_streak: row.max_streak,
    upload_count: row.upload_count,
    likes_count: row.likes_count,
    rank: row.rank,
  }));
}

export async function fetchCurrentUserStatsWithRank(
  userId: string,
  orderBy: "upload_count" | "likes_count" | "max_streak"
) {
  const { data: userRow, error } = await supabase
    .from("stats")
    .select(
      `
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `
    )
    .eq("user_id", userId)
    .single();

  if (error || !userRow) throw error ?? new Error("User not found");

  const { data: allData, error: allError } = await supabase
    .from("stats")
    .select(`user_id, ${orderBy}`)
    .order(orderBy, { ascending: false });

  if (allError || !allData)
    throw allError ?? new Error("Failed to fetch rankings");

  const ranked = assignRanksWithTies(allData, orderBy);

  const userRank = ranked.find((r) => r.user_id === userId)?.rank ?? -1;

  return {
    // @ts-ignore
    username: userRow.user_profile?.username ?? "Unknown",
    curr_streak: userRow.curr_streak,
    max_streak: userRow.max_streak,
    upload_count: userRow.upload_count,
    likes_count: userRow.likes_count,
    rank: userRank,
  };
}
