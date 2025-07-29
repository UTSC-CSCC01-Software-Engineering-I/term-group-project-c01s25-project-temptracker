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

export default function SettingsPage() {
  const { profile } = useUser();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  const [publicProfile, setPublicProfile] = useState(false);
  const [badgeNotifications, setBadgeNotifications] = useState(false);
  const [communityUpdates, setCommunityUpdates] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.username);
      setBio(profile.bio);
      setPublicProfile(profile.is_public);
      setBadgeNotifications(profile.badge_notifications);
      setCommunityUpdates(profile.community_updates);
    }
  }, [profile]);

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving settings...");
  };

  const handleReset = () => {
    setDisplayName(profile?.username || "");
    setBio(profile?.bio || "");
    setPublicProfile(profile?.is_public || false);
    setBadgeNotifications(profile?.badge_notifications || false);
    setCommunityUpdates(profile?.community_updates || false);
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
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself and your research interests..."
                rows={4}
                value={bio}
                maxLength={200}
                onChange={(e) => setBio(e.target.value)}
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
                title="Change Password"
                description="Update your account password"
                onClick={() => console.log("Change password clicked")}
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
              Reset to Defaults
            </Button>
            <Button
              variant="outline"
              onClick={() => console.log("Cancel clicked")}
            >
              Cancel
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
