import { createClient } from "../supabase/client";

const supabase = createClient();

export type TemperaturePoint = {
  temp_id: number;
  temp_latitude: number;
  temp_longitude: number;
  temperature: number;
  measured_on: string;
  distance_km: number;
};

// in Supabase, we defined a function that queries for the closest temperatures to defined POIs
// this query uses POSTGIS and can't be run directly using the JavaScript Supabase client
export async function getClosestVerifiedTemps(
  userLat: number,
  userLon: number,
  limit = 5, // query the 5 closest temperature points
  recentInterval = "3 days" // I think we can keep it to 3 days for now
): Promise<TemperaturePoint[]> {
  const { data, error } = await supabase.rpc("get_closest_verified_temps", {
    user_latitude: userLon,
    user_longitude: userLat,
    limit_results: limit,
    recent_interval: recentInterval,
  });

  if (error || !data) {
    console.error("Supabase RPC error:", error);
    return [];
  }

  return data as TemperaturePoint[];
}

// this function uses the one above to get the average
export async function getAverageClosestTemperature(
  userLat: number,
  userLon: number,
  limit = 5,
  recentInterval = "3 days"
): Promise<number | null> {
  const temps = await getClosestVerifiedTemps(userLat, userLon, limit, recentInterval);

  if (temps.length === 0) return null;

  const validTemps = temps.filter(t => t.temperature !== null);

  if (validTemps.length === 0) return null;

  const sum = validTemps.reduce((acc, t) => acc + t.temperature, 0);
  return sum / validTemps.length;
}
