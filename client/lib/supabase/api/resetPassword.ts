import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function resetPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}
