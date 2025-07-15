import axios from "axios";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUserSubmissions(userId: string | undefined) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!userId) return;

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No access token found");
      }

      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const response = await axios.get(
          `${API_BASE_URL}/users/${userId}/submissions`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        setSubmissions(response.data);
      } catch (err) {
        console.error("Error fetching user submissions:", err);
        setError("Failed to load submissions.");
      }
      setLoading(false);
    };

    fetchSubmissions();
  }, [userId]);

  return { submissions, loading, error };
}
