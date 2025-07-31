"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/shadcn/input";
import { Button } from "@/components/shadcn/button";
import { Label } from "@/components/shadcn/label";
import { toast } from "sonner";
import { z } from "zod";

const usernameSchema = z
  .string()
  .trim()
  .min(3, { message: "Username must be at least 3 characters" })
  .max(20, { message: "Username must be at most 20 characters" });

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

      // Redirect if username already exists
      const { data, error: profileError } = await supabase
        .from("user_profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error checking profile", profileError.message);
      } else if (data?.username) {
        router.push("/");
      }
    };

    getUserId();
  }, [router, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const parsed = usernameSchema.safeParse(username);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      setLoading(false);
      return;
    }

    const cleanUsername = parsed.data;

    // Check if username already exists
    const { data: existing, error: checkError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("username", cleanUsername)
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
      .update({ username: cleanUsername })
      .eq("id", userId);

    if (updateError) {
      toast.error("Failed to set username");
      setLoading(false);
      return;
    }

    // Update in auth metadata
    const { error: metaError } = await supabase.auth.updateUser({
      data: { username: cleanUsername },
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
          <Label htmlFor="username">
            Username<span className="text-red-700 ml-1">*</span>
          </Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Set Username"}
        </Button>
      </form>
    </div>
  );
}
