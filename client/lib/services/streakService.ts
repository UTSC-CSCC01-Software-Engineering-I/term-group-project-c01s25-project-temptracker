import { createClient } from "../supabase/client";

const supabase = createClient();

export async function updateStreak(userId: string) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const { data: stats, error } = await supabase
    .from("stats")
    .select("curr_streak, max_streak, last_date")
    .eq("user_id", userId)
    .single();

  if (error || !stats) return { error };

  const { curr_streak, max_streak, last_date } = stats;

  if (last_date === today) {
    return { message: "Streak is already up-to-date" };
  }

  let newStreak = 1;
  if (last_date === yesterday) {
    newStreak = curr_streak + 1;
  }

  const newMaxStreak = Math.max(max_streak, newStreak);
//   console.log("Updating streak for user:", userId, newStreak,)

  const { error: updateError } = await supabase
    .from("stats")
    .update({
      curr_streak: newStreak,
      max_streak: newMaxStreak,
      last_date: today,
    })
    .eq("user_id", userId);

  return { error: updateError };
}
