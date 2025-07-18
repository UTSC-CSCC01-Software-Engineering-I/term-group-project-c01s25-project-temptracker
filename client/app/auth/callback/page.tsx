"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No session found", sessionError);
        return;
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles") // updated here
        .select("username")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      if (!userProfile?.username) {
        router.push("/set-username");
      } else {
        router.push("/");
      }
    };

    checkUser();
  }, [router, supabase]);

  return <p className="text-center mt-8">Signing in...</p>;
}
