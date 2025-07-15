import { createClient } from "../client";

const supabase = createClient();

export async function fetchTopByUploadCount(limit = 50) {
  const { data, error } = await supabase
    .from("stats")
    .select(`
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `)
    .order("upload_count", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (
    data?.map((row: any) => ({
      username: row.user_profile?.username ?? "Unknown",
      curr_streak: row.curr_streak,
      max_streak: row.max_streak,
      upload_count: row.upload_count,
      likes_count: row.likes_count,
    })) || []
  );
}

export async function fetchTopByLikesCount(limit = 50) {
  const { data, error } = await supabase
    .from("stats")
    .select(`
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `)
    .order("likes_count", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (
    data?.map((row: any) => ({
      username: row.user_profile?.username ?? "Unknown",
      curr_streak: row.curr_streak,
      max_streak: row.max_streak,
      upload_count: row.upload_count,
      likes_count: row.likes_count,
    })) || []
  );
}

export async function fetchTopByMaxStreak(limit = 50) {
  const { data, error } = await supabase
    .from("stats")
    .select(`
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `)
    .order("max_streak", { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (
    data?.map((row: any) => ({
      username: row.user_profile?.username ?? "Unknown",
      curr_streak: row.curr_streak,
      max_streak: row.max_streak,
      upload_count: row.upload_count,
      likes_count: row.likes_count,
    })) || []
  );
}

export async function fetchCurrentUserStatsWithRank(
  userId: string,
  orderBy: "upload_count" | "likes_count" | "max_streak"
) {
  const { data: userRow, error } = await supabase
    .from("stats")
    .select(`
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `)
    .eq("user_id", userId)
    .single();

  if (error || !userRow) throw error ?? new Error("User not found");

  const userStatValue = userRow[orderBy];

  const { count, error: countError } = await supabase
    .from("stats")
    .select("*", { count: "exact", head: true })
    .gt(orderBy, userStatValue);

  if (countError) throw countError;

  return {
    username: userRow.user_profile?.username ?? "Unknown",
    curr_streak: userRow.curr_streak,
    max_streak: userRow.max_streak,
    upload_count: userRow.upload_count,
    likes_count: userRow.likes_count,
    rank: (count ?? 0) + 1,
  };
}
