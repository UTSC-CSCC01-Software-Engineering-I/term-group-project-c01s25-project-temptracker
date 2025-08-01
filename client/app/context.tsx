"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

type Profile = {
  id: string;
  username: string;
  role: string | null; // for now
  biography: string;
  is_public: boolean;
  badge_notifications: boolean;
  community_updates: boolean;
};

const UserContext = createContext<{
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
} | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUserAndProfile() {
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    setUser(user);

    // get the profile from PostgreSQL
    if (user) {
      const { data: profileData, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(error ? null : profileData ?? null);
    } else {
      setProfile(null);
    }

    setLoading(false);
  }

  // we will also provide a logout function
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      setUser(null);
      setProfile(null);
      console.log("User logged out successfully");
    }
  };

  // fetch user and profile on mount, then set up listener
  useEffect(() => {
    fetchUserAndProfile();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchUserAndProfile();
    });

    return () => listener?.subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        refreshProfile: fetchUserAndProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("Context unavailable");
  return context;
}
