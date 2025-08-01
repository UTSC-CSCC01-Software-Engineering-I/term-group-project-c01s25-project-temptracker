import { useState, useEffect } from "react";
import { useUser } from "../app/context";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { sendResetEmail } from "@/lib/supabase/api/forgotPassword";

export function useSettingsForm() {
  const { user, profile, refreshProfile } = useUser();
  const supabase = createClient();

  // Form state
  const [username, setUsername] = useState("");
  const [biography, setBiography] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [biographyError, setBiographyError] = useState("");
  const [publicProfile, setPublicProfile] = useState(true);
  const [badgeNotifications, setBadgeNotifications] = useState(true);
  const [communityUpdates, setCommunityUpdates] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setBiography(profile.biography);
      setPublicProfile(profile.is_public);
      setBadgeNotifications(profile.badge_notifications);
      setCommunityUpdates(profile.community_updates);
    }
  }, [profile]);

  // Validation function
  const validateForm = () => {
    let isValid = true;

    if (username.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters long");
      isValid = false;
    } else if (username.trim().length > 25) {
      setUsernameError("Username must be 25 characters or less");
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
      isValid = false;
    } else {
      setUsernameError("");
    }

    if (biography.length > 200) {
      setBiographyError("Biography must be 200 characters or less");
      isValid = false;
    } else {
      setBiographyError("");
    }

    return isValid;
  };

  // Event handlers
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    if (value.trim().length < 3) {
      setUsernameError("Username must be at least 3 characters long");
    } else if (value.trim().length > 25) {
      setUsernameError("Username must be 25 characters or less");
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError(
        "Username can only contain letters, numbers, and underscores"
      );
    } else {
      setUsernameError("");
    }
  };

  const handleBiographyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBiography(value);

    if (value.length > 200) {
      setBiographyError("Biography must be 200 characters or less");
    } else {
      setBiographyError("");
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

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
      await refreshProfile();
      toast.success("Settings updated successfully!");
    } else {
      toast.error("Failed to update settings.");
    }
  };

  const handleReset = () => {
    setUsername(profile?.username || "");
    setBiography(profile?.biography || "");
    setPublicProfile(profile?.is_public || false);
    setBadgeNotifications(profile?.badge_notifications || false);
    setCommunityUpdates(profile?.community_updates || false);
    setUsernameError("");
    setBiographyError("");
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

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
  };

  return {
    // Form state
    formData: {
      username,
      biography,
      publicProfile,
      badgeNotifications,
      communityUpdates,
    },
    // Error state
    errors: {
      usernameError,
      biographyError,
    },
    // Modal state
    showDeleteModal,
    setShowDeleteModal,
    // Event handlers
    handleUsernameChange,
    handleBiographyChange,
    handleSave,
    handleReset,
    handleSendPasswordReset,
    handleDeleteAccount,
    // Setters for toggles
    setPublicProfile,
    setBadgeNotifications,
    setCommunityUpdates,
    // User data
    user,
  };
}
