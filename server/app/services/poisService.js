const supabase = require("../models/supabaseClient");

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getClosestPOIs(userLat, userLon, limit = 5) {
  const { data, error } = await supabase
    .from("points_of_interest")
    .select("id, name, latitude, longitude, lake");

  if (error || !data) throw new Error(error.message);

  const sorted = data
    .map((poi) => ({
      ...poi,
      distance: haversineDistance(
        userLat,
        userLon,
        poi.latitude,
        poi.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return sorted;
}

module.exports = { getClosestPOIs };
