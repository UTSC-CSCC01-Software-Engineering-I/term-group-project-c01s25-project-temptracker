"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();

  useEffect(() => {
    async function fetchUsers() {
      // Get the current session and token
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json();
      console.log(data);
    }

    fetchUsers();
  }, []);

  return (
    <div>
      <h1>GLOW | Temperature Tracker</h1>
    </div>
  );
}
