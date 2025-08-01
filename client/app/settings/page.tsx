"use client";

import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Textarea } from "@/components/shadcn/textarea";
import SettingsSection from "./SettingsSection";
import ToggleSwitch from "./ToggleSwitch";
import NotificationItem from "./NotificationItem";
import SecurityButton from "./SecurityButton";
import DeleteAccountModal from "./DeleteAccountModal";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { Trophy, Users, Key, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const {
    formData,
    errors,
    showDeleteModal,
    setShowDeleteModal,
    handleUsernameChange,
    handleBiographyChange,
    handleSave,
    handleReset,
    handleSendPasswordReset,
    handleDeleteAccount,
    setPublicProfile,
    setBadgeNotifications,
    setCommunityUpdates,
    user,
  } = useSettingsForm();

  const {
    username,
    biography,
    publicProfile,
    badgeNotifications,
    communityUpdates,
  } = formData;

  const { usernameError, biographyError } = errors;

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
                onChange={handleUsernameChange}
                className={usernameError ? "border-red-500" : ""}
              />
              {usernameError && (
                <p className="text-sm text-red-500">{usernameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="biography">Biography</Label>
              <Textarea
                id="biography"
                placeholder="Tell others about yourself and your research interests..."
                rows={4}
                value={biography}
                maxLength={200}
                onChange={handleBiographyChange}
                className={`resize-none ${
                  biographyError ? "border-red-500" : ""
                }`}
              />
              <div className="flex justify-between items-center">
                <div>
                  {biographyError && (
                    <p className="text-sm text-red-500">{biographyError}</p>
                  )}
                </div>
                <p className="text-sm text-gray-500">{biography.length}/200</p>
              </div>
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
                icon={<Trophy className="w-5 h-5" />}
                iconBgColor="bg-yellow-100"
                iconTextColor="text-yellow-600"
                title="Badge Notifications"
                description="Get notified when you earn new badges and achievements"
                checked={badgeNotifications}
                onCheckedChange={setBadgeNotifications}
              />

              <NotificationItem
                icon={<Users className="w-5 h-5" />}
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
                icon={<Key className="w-4 h-4" />}
                title="Send Password Reset"
                description="Send a password reset email to your inbox"
                onClick={handleSendPasswordReset}
              />
              <SecurityButton
                icon={<Trash2 className="w-4 h-4" />}
                title="Delete Account"
                description="Permanently delete your account and all data"
                onClick={handleDeleteAccount}
                variant="destructive"
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

      {/* Delete Account Confirmation Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        userEmail={user?.email}
      />
    </div>
  );
}
