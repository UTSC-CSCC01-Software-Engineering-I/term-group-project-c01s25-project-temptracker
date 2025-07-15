"use client";

import Link from "next/link";

// todo: implement badges properly
const badges = [
  { label: "Streak", color: "bg-blue-900" },
  { label: "Contributor", color: "bg-blue-700" },
  { label: "Early User", color: "bg-blue-500" },
];

export default function ProfileStats() {
  return (
    <div className="rounded-lg shadow-md bg-white p-6 mb-12 lg:mb-20 flex flex-col gap-6">
      <div className="flex flex-col gap-10 sm:flex-row sm:justify-between sm:gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-start gap-16">
            <div>
              <h3 className="text-lg font-semibold text-dark-blue mb-1">
                Global Position
              </h3>
              <p className="text-dark-blue text-xl font-bold">#12</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-dark-blue mb-1">
                Streak
              </h3>
              <p className="text-gray-700 text-xl font-bold">7 days</p>
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

      <Link
        href="/community/stats"
        className="text-dark-blue hover:underline text-sm font-semibold mt-4"
      >
        View Community Leaderboard & Badges →
      </Link>
    </div>
  );
}
