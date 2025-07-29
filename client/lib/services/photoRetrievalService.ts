import { createClient } from "../supabase/client";

const supabase = createClient();

export const LOCATIONS = [
  "All",
  "Lake Ontario",
  "Lake Erie",
  "Lake Michigan",
  "Lake Superior",
  "Lake Huron",
] as const;
export type Location = (typeof LOCATIONS)[number];

export const TIME_RANGES = ["Last 72 hours", "Last Month", "All Time"] as const;
export type TimeRange = (typeof TIME_RANGES)[number];

export type Photo = {
  id: number;
  user_id: string;        // user id
  location: Location;
  title: string;
  caption: string;
  likes: number;
  created_at: string;
  file: string; // storage path like "photos/xxx.jpg"
  url: string; // full public URL to the image
};

export async function getPhotos({
  location,
  timeRange,
}: {
  location: Location;
  timeRange: TimeRange;
}): Promise<Photo[]> {
    console.log("Fetching photos with filters:", { location, timeRange });
  let query = supabase.from("photo_uploads").select("*");

  if (location !== "All") {
    query = query.eq("location", location);
  }

  const now = new Date();

  if (timeRange === "Last 72 hours") {
    const cutoff = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    query = query.gte("created_at", cutoff.toISOString());
  } else if (timeRange === "Last Month") {
    const cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    query = query.gte("created_at", cutoff.toISOString());
  }
  // No time filter for "All Time"

  query = query.order("likes", { ascending: false });

  const { data, error } = await query;
  console.log("Retrieved photos:", data);
  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  const BASE_URL = "https://vertksxuryrywouipodt.supabase.co/storage/v1/object/public/photos/"; // public bucket, move to env variable later

  const photos = data.map((photo) => {
    const url = BASE_URL + photo.file;
    return { ...photo, url };
  });

  return photos;
}
