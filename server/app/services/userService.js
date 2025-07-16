const supabase = require("../models/supabaseClient");

async function getAllUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(error.message);
  return data;
}

async function getUserSubmissions(userId) {
  try {
    const { data } = await supabase
      .from("temperatures")
      .select("*")
      .eq("user_id", userId);

    return data || [];
  } catch (e) {
    console.error("Error fetching user submissions:", e);
    throw e;
  }
}

async function getUserBadges(userId) {
  try {
    const { data } = await supabase
      .from("user_badges")
      .select(`earned_on, badges (*)`)
      .eq("user_id", userId);

    const formattedData = data?.map(({ earned_on, badges }) => ({
      earned_on,
      badge: badges,
    }));

    return formattedData || [];
  } catch (e) {
    console.error("Error fetching user badges:", e);
    throw e;
  }
}

module.exports = {
  getAllUsers,
  getUserSubmissions,
  getUserBadges,
};
