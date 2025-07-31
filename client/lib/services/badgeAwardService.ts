import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Badge } from "@/types/badges";

export async function awardBadges(userId: string) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("No access token found");
  }

  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const response = await axios.post(
      `${API_BASE_URL}/users/${userId}/badges/award`,
      {},
      {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    console.log("Awarded badges:", response.data);

    // Show toast notifications for newly earned badges
    const newBadges = response.data || [];
    if (newBadges && newBadges.length > 0) {
      // TODO: Check if user has enabled badge notifications
      showBadgeToasts(newBadges);
    }

    return newBadges;
  } catch (err) {
    console.error("Failed to award badges:", err);
    throw err;
  }
}

// Difficulty colors for toast styling
const DIFFICULTY_COLORS = {
  bronze: "#ca7e4b",
  silver: "#b6b8bc",
  gold: "#f6bd43",
  diamond: "#27b2ef",
};

function showBadgeToasts(badges: Badge[]) {
  badges.forEach((badge, index) => {
    setTimeout(() => {
      const color = DIFFICULTY_COLORS[badge.difficulty] || "#FFD700";

      toast(`Badge Earned: ${badge.name}!`, {
        description: badge.description,
        duration: 5000,
        style: {
          border: `2px solid ${color}`,
          borderLeft: `6px solid ${color}`,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
        },
        className: "font-semibold",
      });
    }, index * 1500);
  });

  if (badges.length > 1) {
    setTimeout(() => {
      toast(`Amazing! You earned ${badges.length} badges!`, {
        description: "Check your profile to see all your achievements",
        duration: 6000,
        style: {
          border: "2px solid #10B981",
          borderLeft: "6px solid #10B981",
        },
        className: "font-bold",
        action: {
          label: "View All Badges",
          onClick: () => {
            window.location.href = "/profile";
          },
        },
      });
    }, badges.length * 1500 + 1000);
  }
}
