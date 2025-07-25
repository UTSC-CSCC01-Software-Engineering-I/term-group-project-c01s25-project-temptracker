import { createClient } from "../supabase/client";

const supabase = createClient();

type POI = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  lake: string;
};

// this function calculates the Haversine distance between two points with given (lat, long)
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // constant for Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getClosestPOIs(
  userLat: number,
  userLon: number,
  limit = 5
): Promise<POI[]> {
  const { data, error } = await supabase
    .from("points_of_interest")
    .select("id, name, latitude, longitude, lake");

  if (error || !data) {
    console.error("Supabase error:", error);
    return [];
  }

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
    console.log("Sorted POIs:", sorted);
  return sorted;
}
