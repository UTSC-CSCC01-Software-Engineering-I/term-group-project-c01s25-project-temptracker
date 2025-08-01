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
  }, [username]);

  if (username === userProfile?.username) {
    router.push("/profile");
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="animate-pulse">
          {/* Back Button Skeleton */}
          <div className="h-10 w-32 bg-gray-200 rounded mb-4"></div>

          {/* Welcome Header Skeleton */}
          <div className="h-9 w-64 bg-gray-200 rounded mb-4"></div>

          {/* Profile Header Skeleton */}
          <div className="rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-300 h-8"></div>
            <div className="bg-white p-6">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>

          {/* Stats Skeleton */}
          <div>
            <div className="h-8 w-32 bg-gray-200 rounded my-4"></div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="h-8 w-12 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Skeleton */}
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded my-4"></div>
            <div className="bg-white shadow-md rounded-lg p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="text-center p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-2"></div>
                    <div className="h-3 w-16 bg-gray-200 rounded mx-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Table Skeleton */}
          <div>
            <div className="h-8 w-64 bg-gray-200 rounded my-4"></div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="bg-gray-300 h-12"></div>
              <div className="divide-y divide-gray-200">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="px-6 py-4 grid grid-cols-4 gap-4">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
