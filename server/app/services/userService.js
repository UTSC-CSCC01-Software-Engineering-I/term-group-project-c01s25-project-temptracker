const supabase = require("../models/supabaseClient");
const badgeAwardService = require("./badgeAwardService");

async function getAllUsers() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw new Error(error.message);
  return data;
}

async function deleteUser(userId) {
  const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

  if (deleteError) throw new Error(deleteError.message);
}

async function getAllEmailUsers() {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("email")
    .eq("community_updates", true);
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
    throw new Error("Database error");
  }
}

async function getUserStats(userId) {
  try {
    const { data } = await supabase
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

    return data;
  } catch (e) {
    console.error("Error fetching user stats:", e);
    throw new Error("Database error");
  }
}

async function updateUserStreak(userId) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const { data: stats } = await supabase
      .from("stats")
      .select("curr_streak, max_streak, last_date")
      .eq("user_id", userId)
      .single();

    const { curr_streak, max_streak, last_date } = stats;

    if (last_date === today) {
      return;
    }

    let newStreak = 1;
    if (last_date === yesterday) {
      newStreak = curr_streak + 1;
    }

    const newMaxStreak = Math.max(max_streak, newStreak);

    await supabase
      .from("stats")
      .update({
        curr_streak: newStreak,
        max_streak: newMaxStreak,
        last_date: today,
      })
      .eq("user_id", userId);
  } catch (e) {
    console.error("Error updating user streak:", e);
    throw new Error("Database error");
  }
}

async function updateUserSubmission(userId) {
  try {
    const { data: stats } = await supabase
      .from("temperatures")
      .select("*")
      .eq("user_id", userId);

    const updatedUploadCount = stats.length;

    await supabase
      .from("stats")
      .update({
        upload_count: updatedUploadCount,
      })
      .eq("user_id", userId);
  } catch (e) {
    console.error("Error updating user submission:", e);
    throw new Error("Database error");
  }
}

async function updateUserSettings(userId, settings) {
  try {
    const { data } = await supabase
      .from("user_profiles")
      .update(settings)
      .eq("id", userId)
      .select(`username`)
      .single();

    return data;
  } catch (e) {
    console.error("Error updating user settings:", e);
    throw new Error("Database error");
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
    throw new Error("Database error");
  }
}

async function awardUserBadges(userId) {
  try {
    const { data: allBadges, error: badgesError } = await supabase
      .from("badges")
      .select("*");
    if (badgesError) throw new Error("Badge award error");

    const { data: userBadges, error: userBadgesError } = await supabase
      .from("user_badges")
      .select("*")
      .eq("user_id", userId);
    if (userBadgesError) throw new Error("Badge award error");

    const awardedBadges = [];

    for (const badge of allBadges || []) {
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
        } else if (badge.requirement_metric === "special") {
          await badgeAwardService.awardSpecialBadges(
            badge,
            userId,
            awardedBadges
          );
        }
      }
    }

    return awardedBadges;
  } catch (e) {
    console.error("Error awarding user badges:", e);
    throw new Error("Badge award error");
  }
}

async function getPublicUsers() {
  try {
    // get all public user profiles
    const { data: profiles, error: profileError } = await supabase
      .from("user_profiles")
      .select(
        `
        id,
        username,
        biography,
        is_public
      `
      )
      .eq("is_public", true);

    if (profileError) throw new Error(profileError.message);

    // Get auth users data to include email_confirmed_at
    const { data: authUsers, error: authError } =
      await supabase.auth.admin.listUsers();
    if (authError) throw new Error(authError.message);

    // Merge the data
    const publicUsersWithAuthData = profiles.map((profile) => {
      const authUser = authUsers.users.find((user) => user.id === profile.id);
      return {
        ...profile,
        email_confirmed_at: authUser?.email_confirmed_at || null,
        created_at: authUser?.created_at || profile.created_at,
      };
    });

    return publicUsersWithAuthData || [];
  } catch (e) {
    console.error("Error fetching public users:", e);
    throw new Error("Database error");
  }
}

async function getUserPublicProfile(username) {
  try {
    // First, get the user profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select(
        `
        id,
        username,
        biography,
        is_public
      `
      )
      .eq("username", username)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        throw new Error("User not found");
      }
      throw new Error(profileError.message);
    }

    // Check if profile is public
    if (!profile.is_public) {
      throw new Error("Profile is private");
    }

    // Get user stats
    const { data: stats } = await supabase
      .from("stats")
      .select(
        `
        upload_count,
        curr_streak,
        max_streak
      `
      )
      .eq("user_id", profile.id)
      .single();

    // Get recent uploads (last 5)
    const { data: recentUploads } = await supabase
      .from("temperatures")
      .select(
        `
        id,
        user_id,
        temperature,
        latitude,
        longitude,
        measured_on
      `
      )
      .eq("user_id", profile.id)
      .order("measured_on", { ascending: false })
      .limit(5);

    // Get user badges
    const { data: userBadges } = await supabase
      .from("user_badges")
      .select(
        `
        user_id,
        earned_on,
        badges (
          id,
          name,
          description
        )
      `
      )
      .eq("user_id", profile.id);

    // Format badges
    const badges =
      userBadges?.map((ub) => ({
        id: ub.badges.id,
        name: ub.badges.name,
        description: ub.badges.description,
        icon: ub.badges.icon,
        earned_on: ub.earned_on,
      })) || [];

    // Calculate total readings and average temperature
    let totalReadings = 0;
    let avgTemp = null;

    if (recentUploads && recentUploads.length > 0) {
      const { count } = await supabase
        .from("temperatures")
        .select("temperature", { count: "exact" })
        .eq("user_id", profile.id);

      totalReadings = count || 0;

      // Calculate average temperature
      const { data: tempData } = await supabase
        .from("temperatures")
        .select("temperature")
        .eq("user_id", profile.id);

      if (tempData && tempData.length > 0) {
        const totalTemp = tempData.reduce(
          (sum, reading) => sum + reading.temperature,
          0
        );
        avgTemp = totalTemp / tempData.length;
      }
    }

    // Get auth user data for email_confirmed_at
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers.users.find((user) => user.id === profile.id);

    return {
      ...profile,
      email_confirmed_at: authUser?.email_confirmed_at || null,
      stats: stats
        ? {
            ...stats,
            total_readings: totalReadings,
            avg_temp: avgTemp,
          }
        : null,
      badges,
      recent_uploads: recentUploads || [],
    };
  } catch (error) {
    console.error("Error fetching user public profile:", error);
    throw error;
  }
}

async function uploadProfilePicture(userId, file) {
  try {
    if (!file) {
      await supabase
        .from("user_profiles")
        .update({ profile_picture_url: null })
        .eq("id", userId);
      return null;
    }

    const fileName = `${userId}/${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error("Failed to upload profile picture");
    }

    const {
      data: { publicUrl },
    } = await supabase.storage.from("profile-pictures").getPublicUrl(data.path);

    await supabase
      .from("user_profiles")
      .update({ profile_picture_url: publicUrl })
      .eq("id", userId);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  deleteUser,
  getAllEmailUsers,
  getUserSubmissions,
  getUserStats,
  updateUserStreak,
  updateUserSubmission,
  updateUserSettings,
  getUserBadges,
  awardUserBadges,
  getPublicUsers,
  getUserPublicProfile,
  uploadProfilePicture,
};
