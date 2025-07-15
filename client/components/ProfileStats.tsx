"use client";

import Link from "next/link";
import { fetchCurrentUserStatsWithRank } from "../lib/services/statsService";
import { useEffect, useState } from "react";
import { useUser } from "@/app/context";

// todo: implement badges properly
const badges = [
  { label: "50 Streak", color: "bg-blue-900" },
  { label: "Explorer", color: "bg-blue-700" },
  { label: "User", color: "bg-blue-500" },
];

export default function ProfileStats() {
  const [streak, setStreak] = useState<number | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    const loadStats = async () => {
      try {
        // we default to rank with upload count
        const stats = await fetchCurrentUserStatsWithRank(
          user?.id,
          "upload_count"
        );

        setRank(stats.rank);
        setStreak(stats.curr_streak);
        console.log("User stats:", stats);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };
    loadStats();
  }, [user]);

  return (
    <div className="rounded-lg shadow-md bg-white p-6 mb-12 lg:mb-20 flex flex-col gap-6">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-start gap-16">
            <div>
              <h3 className="text-lg font-semibold text-dark-blue mb-1">
                Global Position
              </h3>
              <p className="text-dark-blue text-xl font-bold">
                {rank !== null ? `#${rank}` : "—"}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-blue mb-1">
                Current Streak
              </h3>
              <p className="text-gray-700 text-xl font-bold">
                {streak !== null
                  ? `${streak} day${streak === 1 ? "" : "s"}`
                  : "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-sm flex flex-col items-start">
          <h3 className="text-lg font-semibold text-dark-blue mb-1">Badges</h3>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-1">
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className={`inline-block ${badge.color} text-white px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap cursor-pointer hover:opacity-90 transition`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Link
          href="/community/stats"
          className="text-dark-blue hover:underline text-sm font-semibold mt-4"
        >
          View Leaderboard & Badges →
        </Link>
        <p className="text-xs text-gray-500 mt-1">
          *Position is determined by # of uploads, streak counts days with consecutive uploads
        </p>
      </div>
    </div>
  );
}
