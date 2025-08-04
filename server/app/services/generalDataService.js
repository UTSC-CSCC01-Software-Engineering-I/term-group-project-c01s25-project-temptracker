const supabase = require("../models/supabaseClient");

const LIMIT = 50;

async function getBadges() {
  try {
    const { data } = await supabase.from("badges").select("*");

    return data || [];
  } catch (e) {
    console.error("Error fetching badges:", e);
    throw e;
  }
}

async function getTopStats(stat) {
  try {
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
      .order(`${stat}`, { ascending: false })
      .limit(LIMIT);

    if (error) {
      throw error;
    }

    return data;
  } catch (e) {
    console.error("Error fetching top uploads:", e);
    throw e;
  }
}

module.exports = {
  getBadges,
  getTopStats,
};
