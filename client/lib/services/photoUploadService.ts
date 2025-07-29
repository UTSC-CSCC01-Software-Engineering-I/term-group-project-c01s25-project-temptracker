import { createClient } from "../supabase/client";
import { toast } from "sonner";

const supabase = createClient();
export async function onUpload({
  file,
  userId,
  role,
  location,
  title,
  caption,
}: {
  file: File;
  userId: string;
  role: string | null;
  location: string;
  title: string;
  caption: string;
}) {
  // enforce 1 upload/week for non-admins
  if (role !== "admin") {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count, error: countError } = await supabase
      .from("photo_uploads")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneWeekAgo.toISOString());

    if (countError) {
      toast.error("Failed to check upload limit.");
      return;
    }

    if ((count ?? 0) > 0) {
      toast.error("Sorry, personal accounts can only upload one photo per week.");
      return;
    }
  }

  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filePath, file);

  if (uploadError) {
    toast.error("Upload failed: " + uploadError.message);
    return;
  }

  const { error: insertError } = await supabase.from("photo_uploads").insert({
    user_id: userId,
    file: filePath,
    location,
    title,
    caption,
  });

  if (insertError) {
    toast.error("Failed to save photo info: " + insertError.message);
    return;
  }

  toast.success("Photo uploaded!");
}
