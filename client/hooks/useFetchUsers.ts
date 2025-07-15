import { useEffect, useState } from "react";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";

export function useFetchUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const fetchData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("No access token found");
        }

        const response = await axios.get(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        setUsers(response.data);
      } catch (err) {
        console.error("Fetch users error:", err);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { users, loading, error };
}
