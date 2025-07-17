const supabase = require("../models/supabaseClient");
const badgeAwardService = require("./badgeAwardService");

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

async function awardUserBadges(userId) {
  try {
    const { data: allBadges } = await supabase.from("badges").select("*");
    const { data: userBadges } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", userId);
    const awardedBadges = [];

    for (const badge of allBadges) {
      const alreadyAwarded = userBadges.some((ub) => ub.badge_id === badge.id);
      if (!alreadyAwarded) {
        if (
          badge.requirement_metric === "submission" ||
          badge.requirement_metric === "streak" ||
          badge.requirement_metric === "engagement"
        ) {
          await badgeAwardService.awardStatsRelatedBadges(
            badge,
            userId,
            awardedBadges
          );
        } else if (
          badge.requirement_metric === "locations" ||
          badge.requirement_metric === "user_submission_specific"
        ) {
          await badgeAwardService.awardSubmissionSpecificBadges(
            badge,
            userId,
            awardedBadges
          );
        }
      } else if (badge.requirement_metric === "special") {
        await badgeAwardService.awardSpecialBadges(
          badge,
          userId,
          awardedBadges
        );
      }
    }

    console.log("Awarded badges:", awardedBadges);

    return awardedBadges;
  } catch (e) {
    console.error("Error awarding user badges:", e);
    throw e;
  }
}

module.exports = {
  getAllUsers,
  getUserSubmissions,
  getUserBadges,
  awardUserBadges,
};
