"use client";

import { useUser } from "@/app/context";
import { useCommunityStats } from "@/hooks/useCommunityStats";

export default function CommunityTab() {
  const { user } = useUser();
  const { sortKey, users, currentUserStat, loading, setSortKey, allBadges } =
    useCommunityStats(user?.id);
  console.log(allBadges);

  const maxVisible = 50; // not used?

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

      <h1 className="text-3xl font-bold mb-4 text-dark-blue">Badges</h1>
    </div>
  );
}
