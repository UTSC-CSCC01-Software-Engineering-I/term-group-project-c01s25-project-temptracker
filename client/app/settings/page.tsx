"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import SettingsSection from "./SettingsSection";
import ToggleSwitch from "./ToggleSwitch";
import NotificationItem from "./NotificationItem";
import SecurityButton from "./SecurityButton";
import { useUser } from "../context";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { sendResetEmail } from "@/lib/supabase/api/forgotPassword";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useUser();
  const supabase = createClient();

  const [username, setUsername] = useState("");
  const [biography, setbiographygraphy] = useState("");

  const [publicProfile, setPublicProfile] = useState(false);
  const [badgeNotifications, setBadgeNotifications] = useState(false);
  const [communityUpdates, setCommunityUpdates] = useState(false);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setbiographygraphy(profile.bio);
      setPublicProfile(profile.is_public);
      setBadgeNotifications(profile.badge_notifications);
      setCommunityUpdates(profile.community_updates);
    }
  }, [profile]);

  const handleSave = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const res = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/users/${profile?.id}/settings`,
      {
        username,
        biography,
        is_public: publicProfile,
        badge_notifications: badgeNotifications,
        community_updates: communityUpdates,
      },
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    if (res.status === 200) {
      // Refresh the profile from the database to get updated values
      await refreshProfile();
      toast.success("Settings updated successfully!");
    } else {
      toast.error("Failed to update settings.");
    }
  };

  const handleReset = () => {
    setUsername(profile?.username || "");
    setbiographygraphy(profile?.bio || "");
    setPublicProfile(profile?.is_public || false);
    setBadgeNotifications(profile?.badge_notifications || false);
    setCommunityUpdates(profile?.community_updates || false);
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) {
      toast.error("No email found for current user");
      return;
    }

    try {
      await sendResetEmail(user.email);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      toast.error(
        (err as Error)?.message || "Failed to send password reset email"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="mb-3">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account preferences and security settings
        </p>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* Profile Settings */}
          <SettingsSection
            heading="Profile Settings"
            subheading="Update your personal information"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Display Name</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your display name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="biography">Biography</Label>
              <Textarea
                id="biography"
                placeholder="Tell others about yourself and your research interests..."
                rows={4}
                value={biography}
                maxLength={200}
                onChange={(e) => setbiographygraphy(e.target.value)}
                className="resize-none"
              />
            </div>

            <ToggleSwitch
              label="Public Profile"
              description="Allow others to view your profile and achievements"
              checked={publicProfile}
              onCheckedChange={setPublicProfile}
            />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            heading="Notifications"
            subheading="Configure your notification preferences"
          >
            <div className="space-y-4">
              <NotificationItem
                icon="🏆"
                iconBgColor="bg-yellow-100"
                iconTextColor="text-yellow-600"
                title="Badge Notifications"
                description="Get notified when you earn new badges and achievements"
                checked={badgeNotifications}
                onCheckedChange={setBadgeNotifications}
              />

              <NotificationItem
                icon="👥"
                iconBgColor="bg-green-100"
                iconTextColor="text-green-600"
                title="Community Updates"
                description="Updates about community activity and research findings"
                checked={communityUpdates}
                onCheckedChange={setCommunityUpdates}
              />
            </div>
          </SettingsSection>

          {/* Account Security */}
          <SettingsSection
            heading="Account Security"
            subheading="Manage your account security settings"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <SecurityButton
                icon="🔑"
                title="Send Password Reset"
                description="Send a password reset email to your inbox"
                onClick={handleSendPasswordReset}
              />
              <SecurityButton
                icon="🛡️"
                title="Two-Factor Authentication"
                description="Add an extra layer of security"
                onClick={() => console.log("Two-Factor Authentication clicked")}
              />
            </div>
          </SettingsSection>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" onClick={handleReset}>
              Reset Changes
            </Button>
            <Button onClick={handleSave} className="min-w-32">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
