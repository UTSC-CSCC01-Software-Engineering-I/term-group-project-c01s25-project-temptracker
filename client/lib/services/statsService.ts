// RECONSIDER: currently a full frontend service
import { createClient } from "../supabase/client";

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

export async function fetchTopByUploadCount(limit = 50) {
  const { data, error } = await supabase
    .from("stats")
    .select(
      `
      user_id,
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `
    )
    .order("upload_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  const rankedData = assignRanksWithTies(data, "upload_count");

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

export async function fetchTopByLikesCount(limit = 50) {
  const { data, error } = await supabase
    .from("stats")
    .select(
      `
      user_id,
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `
    )
    .order("likes_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  const rankedData = assignRanksWithTies(data, "likes_count");

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

export async function fetchTopByMaxStreak(limit = 50) {
  const { data, error } = await supabase
    .from("stats")
    .select(
      `
      user_id,
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `
    )
    .order("max_streak", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  const rankedData = assignRanksWithTies(data, "max_streak");

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
