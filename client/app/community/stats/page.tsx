"use client";

import React from "react";

type User = {
  rank: number;
  username: string;
  uploads: number;
  streak: number;
  likes: number;
};

const topUsers: User[] = Array.from({ length: 30 }, (_, i) => ({
  // will fix this
  rank: i + 1,
  username: `User${i + 1}`,
  uploads: Math.floor(Math.random() * 200),
  streak: Math.floor(Math.random() * 30),
  likes: Math.floor(Math.random() * 1000),
}));

const currentUser: User = {
  rank: 75,
  username: "CurrentUser",
  uploads: 56,
  streak: 12,
  likes: 345,
};

export default function CommunityTab() {
  const maxVisible = 30;
  const visibleUsers = topUsers.slice(0, maxVisible);
  const isCurrentUserVisible = currentUser.rank <= maxVisible;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-4 text-dark-blue">
        Community Leaderboard
      </h1>

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
              {visibleUsers.map(
                ({ rank, username, uploads, streak, likes }) => (
                  <tr
                    key={rank}
                    className={`hover:bg-blue-100 transition-colors duration-200 ${
                      username === currentUser.username ? "bg-nav-blue" : ""
                    }`}
                  >
                    <td className="w-1/12 px-6 py-2 whitespace-nowrap font-mono">
                      {rank}
                    </td>
                    <td className="w-3/12 px-6 py-2 whitespace-nowrap font-semibold text-dark-blue">
                      {username}
                    </td>
                    <td className="w-2/12 px-6 py-2 whitespace-nowrap font-mono">
                      {uploads}
                    </td>
                    <td className="w-2/12 px-6 py-2 whitespace-nowrap font-mono">
                      {streak}
                    </td>
                    <td className="w-2/12 px-6 py-2 whitespace-nowrap font-mono">
                      {likes}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {!isCurrentUserVisible && (
          <>
            <div className="border-t border-gray-400 mt-4" />
            <table className="min-w-full divide-y divide-gray-200 table-fixed">
              <tbody className="text-gray-700">
                <tr className="bg-yellow-50 hover:bg-yellow-100 transition-colors duration-200">
                  <td className="w-1/12 px-6 py-2 whitespace-nowrap font-mono">
                    {currentUser.rank}
                  </td>
                  <td className="w-3/12 px-6 py-2 whitespace-nowrap font-semibold text-dark-blue">
                    {currentUser.username}
                  </td>
                  <td className="w-2/12 px-6 py-2 whitespace-nowrap font-mono">
                    {currentUser.uploads}
                  </td>
                  <td className="w-2/12 px-6 py-2 whitespace-nowrap font-mono">
                    {currentUser.streak}
                  </td>
                  <td className="w-2/12 px-6 py-2 whitespace-nowrap font-mono">
                    {currentUser.likes}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>

      <h1 className="text-3xl font-bold mb-4 text-dark-blue"> 
        Badges
        {/* to do later */}
      </h1>
    </div>
  );
}
