import { createClient } from "@/lib/supabase/client";
import { awardBadges } from "@/lib/services/badgeAwardService";

const supabase = createClient();

export async function loginUser(identifier: string, password: string) {
  const trimmed = identifier.trim();
  const normalized = trimmed.toLowerCase();

  const isEmail = /\S+@\S+\.\S+/.test(normalized);

  let emailToUse = normalized;

  if (!isEmail) {
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("email")
      .ilike("username", normalized)
      .single();

    if (profileError || !profile?.email) {
      throw new Error("Username not found");
    }

    emailToUse = profile.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: emailToUse,
    password,
  });

  if (error) {
    throw error;
  }

  await awardBadges((await supabase.auth.getUser()).data.user?.id || "");

  return true;
}
