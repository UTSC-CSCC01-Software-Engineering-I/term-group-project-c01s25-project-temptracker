import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function sendResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  return true;
}