const supabase = require("../models/supabaseClient");

async function awardStatsRelatedBadges(badge, userId, awardedBadges) {
  const { data: userStats } = await supabase
    .from("stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (
    (badge.requirement_metric === "submission" &&
      userStats.upload_count >= badge.requirement_amount) ||
    (badge.requirement_metric === "streak" &&
      userStats.curr_streak >= badge.requirement_amount) ||
    (badge.requirement_metric === "engagement" &&
      userStats.likes_count >= badge.requirement_amount)
  ) {
    const { data } = await supabase
      .from("user_badges")
      .insert({
        user_id: userId,
        badge_id: badge.id,
        earned_on: new Date(),
      })
      .select()
      .single();
    awardedBadges.push(data);
  }
}

async function awardSubmissionSpecificBadges(badge, userId, awardedBadges) {
  const { data: userSubmissions } = await supabase
    .from("temperatures")
    .select("*")
    .eq("user_id", userId);

  switch (badge.name) {
    case "Verified Contributor":
      break;
    case "Night Owl":
      break;
    case "Early Bird":
      break;
    case "Detail Oriented":
      break;
    case "Local Explorer":
      break;
    case "Distance Traveler":
      break;
    case "Lake Hopper":
    case "Great Lakes Master":
      break;
    default:
      // unobtainable or unknown submission specific badge, do nothing
      return;
  }
}

async function awardSpecialBadges(badge, userId, awardedBadges) {
  // Special badges can have unique logic, e.g., based on specific events or achievements

  switch (badge.name) {
    case "Veteran":
      const { data } = await supabase.auth.admin.getUserById(userId);
      if (data && data.user_metadata?.created_at) {
        const createdAt = new Date(data.user_metadata.created_at);
        const currentDate = new Date();
        const diffTime = Math.abs(currentDate - createdAt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= badge.requirement_amount) {
          const { data: newBadge } = await supabase
            .from("user_badges")
            .insert({
              user_id: userId,
              badge_id: badge.id,
              earned_on: new Date(),
            })
            .select()
            .single();
          awardedBadges.push(newBadge);
        }
      }
      break;
    case "Top 10":
      // award if user is in the top 10 data set containing users with the top 10 in upload_count
      const { data: topUsers } = await supabase
        .from("stats")
        .select("*")
        .order("upload_count", { ascending: false })
        .limit(10);
      if (topUsers.some((user) => user.user_id === userId)) {
        const { data: newBadge } = await supabase
          .from("user_badges")
          .insert({
            user_id: userId,
            badge_id: badge.id,
            earned_on: new Date(),
          })
          .select()
          .single();
        awardedBadges.push(newBadge);
      }
      break;
    default:
      // unobtainable or unknown special badge, do nothing
      return;
  }
}

module.exports = {
  awardStatsRelatedBadges,
  awardSubmissionSpecificBadges,
  awardSpecialBadges,
};
