const supabase = require("../models/supabaseClient");

async function getClosestVerifiedTemps(
  userLat,
  userLon,
  limit,
  recentInterval
) {
  const { data, error } = await supabase.rpc("get_closest_verified_temps", {
    user_latitude: userLat,
    user_longitude: userLon,
    limit_results: limit,
    recent_interval: recentInterval,
  });

  if (error || !data) {
    console.error("Supabase RPC error:", error);
    return [];
  }

  return data;
}

async function getAverageClosestTemperature(
  userLat,
  userLon,
  limit = 2,
  recentInterval = "30 days"
) {
  const temps = await getClosestVerifiedTemps(
    userLat,
    userLon,
    limit,
    recentInterval
  );

  if (temps.length === 0) return null;

  const validTemps = temps.filter((t) => t.temperature !== null);

  if (validTemps.length === 0) return null;

  const sum = validTemps.reduce((acc, t) => acc + t.temperature, 0);
  return sum / validTemps.length;
}

module.exports = {
  getClosestVerifiedTemps,
  getAverageClosestTemperature,
};
