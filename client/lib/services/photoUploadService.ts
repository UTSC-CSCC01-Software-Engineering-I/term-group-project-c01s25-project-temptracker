import { createClient } from "../supabase/client";
import { toast } from "sonner";

const supabase = createClient();

export async function onUpload({
  file,
  userId,
  location,
  title,
  caption,
}: {
  file: File;
  userId: string;
  location: string;
  title: string;
  caption: string;
}) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `photos/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from("photos")
    .upload(filePath, file);

  if (uploadError) {
    toast.error("Upload failed: " + uploadError.message);
    return;
  }
  console.log("File uploaded to:", filePath);
  console.log("table data", { userId, filePath, location, title, caption });
  // Insert metadata row
  const { error: insertError } = await supabase.from("photo_uploads").insert({
    user_id: userId,
    file: filePath,
    location,
    title,
    caption,
    likes: 0,
  });

  if (insertError) {
    toast.error("Failed to save photo info: " + insertError.message);
    return;
  }

  toast.success("Photo uploaded!");
}
