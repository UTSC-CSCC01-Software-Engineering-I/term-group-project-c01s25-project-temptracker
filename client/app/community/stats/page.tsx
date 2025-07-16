"use client";

import { useUser } from "@/app/context";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import Badge from "@/components/ui/Badge";
import { useState } from "react";
import { useUserStats } from "@/hooks/useUserStats";
import { Badge as BadgeType, BadgeData } from "@/types/badges";

export default function CommunityTab() {
  const { user } = useUser();
  const { sortKey, users, currentUserStat, loading, setSortKey, allBadges } =
    useCommunityStats(user?.id);
  const { badges: userBadges } = useUserStats(user?.id);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Filter badges based on selected category
  const filteredBadges =
    selectedCategory === "all"
      ? allBadges
      : allBadges.filter((badge) => badge.category === selectedCategory);

  // Helper function to check if user has earned a badge
  const getUserBadgeData = (badge: BadgeType) => {
    if (!userBadges || userBadges.length === 0) {
      return {
        isEarned: false,
        earnedDate: undefined,
      };
    }

    const userBadge = userBadges.find(
      (userBadge: BadgeData) => userBadge.badge.name === badge.name
    );
    return {
      isEarned: userBadge !== undefined,
      earnedDate: userBadge
        ? new Date((userBadge as BadgeData).earned_on)
        : undefined,
    };
  };

  // Calculate earned badges statistics
  const earnedBadgesCount = userBadges?.length || 0;
  const totalBadgesCount = allBadges.length;
  const filteredEarnedCount = filteredBadges.filter((badge) => {
    const badgeData = getUserBadgeData(badge);
    return badgeData.isEarned;
  }).length;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4 text-dark-blue">
        Community Leaderboard
      </h1>

      {/* toggle options */}
      <div className="mb-4 flex gap-4">
        <button
          className={`px-4 py-1 rounded cursor-pointer ${
            sortKey === "upload_count"
              ? "bg-nav-blue text-white"
              : "bg-gray-200"
          }`}
          onClick={() => setSortKey("upload_count")}
          disabled={loading}
        >
          Uploads
        </button>
        <button
          className={`px-4 py-1 rounded cursor-pointer ${
            sortKey === "likes_count" ? "bg-nav-blue text-white" : "bg-gray-200"
          }`}
          onClick={() => setSortKey("likes_count")}
          disabled={loading}
        >
          Likes
        </button>
        <button
          className={`px-4 py-1 rounded cursor-pointer ${
            sortKey === "max_streak" ? "bg-nav-blue text-white" : "bg-gray-200"
          }`}
          onClick={() => setSortKey("max_streak")}
          disabled={loading}
        >
          Max Streak
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-16">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead className="bg-nav-blue text-white sticky top-0 z-10">
            <tr>
              <th className="w-1/12 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Rank
              </th>
              <th className="w-3/12 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Username
              </th>
              <th className="w-2/12 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Uploads
              </th>
              <th className="w-2/12 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Streak (days)
              </th>
              <th className="w-2/12 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Likes
              </th>
            </tr>
          </thead>
        </table>

        <div className="max-h-[400px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <tbody className="text-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 font-mono text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : (
                users.map(
                  ({ user_id, rank, username, uploads, streak, likes }) => (
                    <tr
                      key={user_id}
                      className={`hover:bg-blue-100 transition-colors duration-200`}
                    >
                      <td className="w-1/12 px-6 py-2 font-mono">{rank}</td>
                      <td className="w-3/12 px-6 py-2 font-semibold text-dark-blue">
                        {username}
                      </td>
                      <td className="w-2/12 px-6 py-2 font-mono">{uploads}</td>
                      <td className="w-2/12 px-6 py-2 font-mono">{streak}</td>
                      <td className="w-2/12 px-6 py-2 font-mono">{likes}</td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {currentUserStat && (
          <div className="border-t bg-nav-blue">
            <table className="min-w-full table-fixed">
              <tbody>
                <tr className="hover:bg-nav-blue transition-colors duration-200">
                  <td className="w-1/12 px-6 py-2 font-mono">
                    {currentUserStat.rank}
                  </td>
                  <td className="w-3/12 px-6 py-2 font-semibold text-dark-blue">
                    {currentUserStat.username}
                  </td>
                  <td className="w-2/12 px-6 py-2 font-mono">
                    {currentUserStat.uploads}
                  </td>
                  <td className="w-2/12 px-6 py-2 font-mono">
                    {currentUserStat.streak}
                  </td>
                  <td className="w-2/12 px-6 py-2 font-mono">
                    {currentUserStat.likes}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-4 text-dark-blue">
        Badges
        <span className="text-lg font-normal text-muted ml-2 capitalize">
          ({filteredEarnedCount}/{filteredBadges.length} earned{" "}
          {selectedCategory === "all" ? "total" : selectedCategory})
        </span>
      </h1>

      {/* Badge progress bar */}
      {user && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-muted mb-2">
            <span>
              Your Progress: {earnedBadgesCount} of {totalBadgesCount} badges
              earned
            </span>
            <span>
              {Math.round((earnedBadgesCount / totalBadgesCount) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-nav-blue h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(earnedBadgesCount / totalBadgesCount) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Badge Categories Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          "all",
          "contribution",
          "exploration",
          "quality",
          "achievement",
          "special",
        ].map((category) => {
          const count =
            category === "all"
              ? allBadges.length
              : allBadges.filter((badge) => badge.category === category).length;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                category === selectedCategory
                  ? "bg-nav-blue text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category} ({count})
            </button>
          );
        })}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBadges.map((badge, index) => {
          const badgeData = getUserBadgeData(badge);
          return (
            <Badge
              key={index}
              badge={badge}
              isEarnedByUser={badgeData.isEarned}
              earnedDate={badgeData.earnedDate}
            />
          );
        })}
      </div>

      {/* Empty state */}
      {filteredBadges.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No badges available
          </h3>
          <p className="text-gray-500">
            {selectedCategory === "all"
              ? "Badges will appear here when they are created."
              : `No ${selectedCategory} badges available.`}
          </p>
        </div>
      )}
    </div>
  );
}
