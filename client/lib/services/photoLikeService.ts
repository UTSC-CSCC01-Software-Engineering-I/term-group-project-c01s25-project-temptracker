import { createClient } from "../supabase/client";

const supabase = createClient();

export async function likePhoto(photoId: number, userId: string) {
  const { error } = await supabase
    .from("photo_likes")
    .insert({ photo_id: photoId, user_id: userId });
  if (error && error.code !== "23505") throw new Error(error.message); // we want to allow reliking, so we let this error pass
}

export async function unlikePhoto(photoId: number, userId: string) {
  const { error } = await supabase
    .from("photo_likes")
    .delete()
    .eq("photo_id", photoId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}
