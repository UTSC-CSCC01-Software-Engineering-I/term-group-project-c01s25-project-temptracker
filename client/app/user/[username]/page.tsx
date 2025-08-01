"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";
import { Button } from "@/components/shadcn/button";
import ProfileHeader from "./ProfileHeader";
import ProfileStats from "./ProfileStats";
import ProfileBadges from "./ProfileBadges";
import ProfileActivity from "./ProfileActivity";
import { useUser } from "@/app/context";
import ProfileLoadingSkeleton from "./LoadingSkeleton";

interface UserProfile {
  id: string;
  username: string;
  biography: string | null;
  location: string | null;
  is_public: boolean;
  created_at: string;
  email_confirmed_at: string | null;
  stats?: {
    upload_count: number;
    curr_streak: number;
    max_streak: number;
    total_readings: number;
    avg_temp: number | null;
  };
  badges?: Array<{
    id: string;
    name: string;
    description: string;
    earned_on: string;
  }>;
  recent_uploads?: Array<{
    id: string;
    temperature: number;
    latitude: number;
    longitude: number;
    measured_on: string;
  }>;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { profile: userProfile } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if user is viewing their own profile
    if (username === userProfile?.username) {
      router.push("/profile");
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
        const response = await axios.get(
          `${API_BASE_URL}/users/profile/${username}`
        );

        setProfile(response.data);
      } catch (error: unknown) {
        console.error("Error fetching profile:", error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            setError("User not found");
          } else if (error.response?.status === 403) {
            setError("This profile is private");
          } else {
            setError("Failed to load profile");
          }
        } else {
          setError("Failed to load profile");
        }
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfile();
    }
  }, [username, userProfile?.username, router]);

  // Show loading while redirect is happening
  if (username === userProfile?.username) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nav-blue mx-auto mb-2"></div>
          <p className="text-gray-500">Redirecting to your profile...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <ProfileLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto py-8 px-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">{error}</h1>
            <p className="text-muted-foreground mb-6">
              {error === "User not found"
                ? "The user you're looking for doesn't exist or may have changed their username."
                : error === "This profile is private"
                ? "This user has set their profile to private and cannot be viewed publicly."
                : "Something went wrong while loading this profile. Please try again later."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => router.push("/users")}>
                Browse Users
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const joinedDate = profile.email_confirmed_at
    ? format(new Date(profile.email_confirmed_at), "MMMM yyyy")
    : profile.created_at
    ? format(new Date(profile.created_at), "MMMM yyyy")
    : "Unknown";

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Users
      </Button>

      {/* Welcome Header */}
      <h1 className="text-3xl font-bold mb-4">
        {profile.username}&apos;s Profile
      </h1>

      {/* Profile Header Component */}
      <ProfileHeader profile={profile} joinedDate={joinedDate} />

      {/* Stats Component */}
      <ProfileStats stats={profile.stats} />

      {/* Badges Component */}
      <ProfileBadges badges={profile.badges} />

      {/* Activity Component */}
      <ProfileActivity recentUploads={profile.recent_uploads} />
    </div>
  );
}
