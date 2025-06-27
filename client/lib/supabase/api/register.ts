import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function registerUser({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) {
  // check username exists
  const { data: existingUsername } = await supabase
    .from("user_profiles")
    .select("id")
    .ilike("username", username) // this ignores case for now, not the best practice though
    .single();

  if (existingUsername) {
    throw new Error("Username already taken");
  }

  // check email exists
  const { data: existingEmail } = await supabase
    .from("user_profiles")
    .select("id")
    .ilike("email", email)
    .single();

  if (existingEmail) {
    throw new Error("Email already registered");
  }

  // sign up with supabase auth
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    throw error;
  }
}
