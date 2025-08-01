import { createClient } from "../../supabase/client";

const supabase = createClient();

// this function calls an RPC function to increase/decrease the likes count
// the Supabase JS SDK can't increment directly in a single query, so we use this
async function rpcIncrement(userId: string, delta: number) {
  if (!userId) {
    throw new Error("Invalid userId passed to RPC");
  }

  const { error } = await supabase.rpc("increment_likes_count", {
    p_user_id: userId,
    p_delta: delta,
  });

  if (error) {
    console.error("RPC error:", error.message);
    throw new Error("Failed to update likes count: " + error.message);
  }
}

export async function likePhoto(photoId: number, userId: string) {
  const { error } = await supabase
    .from("photo_likes")
    .insert({ photo_id: photoId, user_id: userId });
  if (error && error.code !== "23505") throw new Error(error.message); // allow duplicate likes error

  if (!error) {
    await rpcIncrement(userId, 1);
  }
}

export async function unlikePhoto(photoId: number, userId: string) {
  const { error } = await supabase
    .from("photo_likes")
    .delete()
    .eq("photo_id", photoId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);

  await rpcIncrement(userId, -1);
}
