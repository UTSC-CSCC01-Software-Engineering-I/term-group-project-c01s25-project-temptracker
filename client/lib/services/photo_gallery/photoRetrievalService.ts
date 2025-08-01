import { use } from "react";
import { createClient } from "../../supabase/client";

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
  user_id: string;
  username: string;
  location: Location;
  title: string;
  caption: string;
  created_at: string;
  file: string;
  url: string;
  likes: number;
  likedByCurrentUser?: boolean;
};
export async function getPhotos({
  location,
  timeRange,
  userId,
}: {
  location: Location;
  timeRange: TimeRange;
  userId?: string;
}): Promise<Photo[]> {
  // first, get photos with likes count
  let query = supabase.from("photo_uploads").select(`
  *,
  photo_likes(count),
  user_profiles:user_id(username)
`);

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

  query = query.order("created_at", { ascending: false });

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data) return [];

  // get photo IDs from data
  const photoIds = data.map((p) => p.id);

  // then query photo_likes for current user and these photo IDs
  let likedPhotoIds = new Set<number>();
  if (userId && photoIds.length > 0) {
    const { data: userLikes, error: likeError } = await supabase
      .from("photo_likes")
      .select("photo_id")
      .in("photo_id", photoIds)
      .eq("user_id", userId);

    if (likeError) {
      throw new Error(likeError.message);
    }
    likedPhotoIds = new Set(userLikes?.map((like) => like.photo_id));
  }

  const BASE_URL =
    "https://vertksxuryrywouipodt.supabase.co/storage/v1/object/public/photos/";

  const mapped_data = data.map((photo) => ({
    id: photo.id,
    user_id: photo.user_id,
    username: photo.user_profiles?.username ?? "",

    location: photo.location,
    title: photo.title,
    caption: photo.caption,
    created_at: photo.created_at,
    file: photo.file,
    url: BASE_URL + photo.file,
    likes: photo.photo_likes?.[0]?.count ?? 0,
    likedByCurrentUser: likedPhotoIds.has(photo.id),
  }));

  // console.log("Mapped data:", mapped_data);
  return mapped_data;
}
