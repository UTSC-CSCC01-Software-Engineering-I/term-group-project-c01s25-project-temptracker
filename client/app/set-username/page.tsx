"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { toast } from "sonner";

export default function SetUsernamePage() {
  const router = useRouter();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        toast.error("Session not found");
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
    };

    getUserId();
  }, [router, supabase]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
        toast.error("Username cannot be empty");
        return;
    }

    setLoading(true);

    // Check if username already exists
    const { data: existing, error: checkError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("username", username)
        .maybeSingle();

    if (checkError) {
        toast.error("Failed to check username");
        setLoading(false);
        return;
    }

    if (existing) {
        toast.error("Username is already taken");
        setLoading(false);
        return;
    }

    // Update in user_profiles
    const { error: updateError } = await supabase
        .from("user_profiles")
        .update({ username })
        .eq("id", userId);

    if (updateError) {
        toast.error("Failed to set username");
        setLoading(false);
        return;
    }

    // Update in auth metadata
    const { error: metaError } = await supabase.auth.updateUser({
        data: { username },
    });

    if (metaError) {
        toast.warning("Username set, but failed to update auth metadata");
    } else {
        toast.success("Username set!");
    }

    setLoading(false);
    router.push("/");
};

  return (
    <div className="max-w-md mx-auto mt-12 p-4">
      <h1 className="text-xl font-semibold mb-4 text-center">Choose a Username</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourcoolname"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Set Username"}
        </Button>
      </form>
    </div>
  );
}
