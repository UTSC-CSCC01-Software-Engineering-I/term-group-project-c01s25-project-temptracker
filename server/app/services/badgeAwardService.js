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

    // Return the full badge information instead of just the user_badge record
    awardedBadges.push({
      ...badge,
      earned_on: data.earned_on,
    });
  }
}

async function awardSubmissionSpecificBadges(badge, userId, awardedBadges) {
  const { data: userSubmissions } = await supabase
    .from("temperatures")
    .select("*")
    .eq("user_id", userId);

  // recall that only one badge is award per call of this function
  let badgeToAward = null;

  switch (badge.id) {
    case 15: // "Verified Contributor"
      if (userSubmissions.some((submission) => submission.is_verified)) {
        badgeToAward = badge;
      }
      break;
    case 13: // "Night Owl"
      if (
        userSubmissions.some(
          (temp) =>
            new Date(temp.measured_on).getHours() >= 22 &&
            new Date(temp.measured_on).getHours() <= 23
        )
      ) {
        badgeToAward = badge;
      }
      break;
    case 16: // "Early Bird"
      if (
        userSubmissions.some(
          (temp) =>
            new Date(temp.measured_on).getHours() >= 5 &&
            new Date(temp.measured_on).getHours() <= 9
        )
      ) {
        badgeToAward = badge;
      }
      break;
    case 10: // "Detail Oriented"
      if (userSubmissions.filter((temp) => temp.notes).length >= 25) {
        badgeToAward = badge;
      }
      break;
    case 6: // "Local Explorer":
      const uniqueLocations = new Set(
        userSubmissions.map((temp) => [temp.latitude, temp.longitude].join(","))
      );
      if (uniqueLocations.size >= badge.requirement_amount) {
        badgeToAward = badge;
      }
      break;
    case 9: // "Distance Traveler"
      break;
    case 7: // "Lake Hopper"
    case 8: // "Great Lakes Master"
      const greatLakesVisited = getGreatLakesVisited(userSubmissions);
      if (greatLakesVisited >= badge.requirement_amount) {
        badgeToAward = badge;
      }
      break;
    default:
      // unobtainable or unknown submission specific badge, do nothing
      return;
  }

  if (badgeToAward) {
    const { data: newBadge } = await supabase
      .from("user_badges")
      .insert({
        user_id: userId,
        badge_id: badgeToAward.id,
        earned_on: new Date(),
      })
      .select()
      .single();

    // Return the full badge information instead of just the user_badge record
    awardedBadges.push({
      ...badgeToAward,
      earned_on: newBadge.earned_on,
    });
  }
}

function getGreatLakesVisited(userSubmissions) {
  // rough rectangular bounds for each Great Lake
  const greatLakes = {
    LakeSuperior: {
      lonRange: [46.464686, 48.733387],
      latRange: [-92.053853, -84.637782],
    },
    LakeMichigan: {
      lonRange: [41.665786, 46.059437],
      latRange: [-87.935542, -84.889314],
    },
    LakeHuron: {
      lonRange: [43.051386, 45.865572],
      latRange: [-84.701462, -81.600918],
    },
    LakeErie: {
      lonRange: [41.502673, 42.79888],
      latRange: [-83.44376, -79.007697],
    },
    LakeOntario: {
      lonRange: [43.2788, 44.046544],
      latRange: [-79.771219, -76.098678],
    },
  };

  const visitedLakes = new Set();

  userSubmissions.forEach((submission) => {
    const { latitude, longitude } = submission;

    for (const [lake, bounds] of Object.entries(greatLakes)) {
      if (
        latitude >= bounds.latRange[0] &&
        latitude <= bounds.latRange[1] &&
        longitude >= bounds.lonRange[0] &&
        longitude <= bounds.lonRange[1]
      ) {
        visitedLakes.add(lake);
      }
    }
  });

  console.log("Visited Great Lakes:", visitedLakes);

  return visitedLakes.size;
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

          // Return the full badge information instead of just the user_badge record
          awardedBadges.push({
            ...badge,
            earned_on: newBadge.earned_on,
          });
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

        // Return the full badge information instead of just the user_badge record
        awardedBadges.push({
          ...badge,
          earned_on: newBadge.earned_on,
        });
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
