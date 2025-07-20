"use client";

import Link from "next/link";
import { useUser } from "@/app/context";
import { useUserStats } from "@/hooks/useUserStats";
import Badges from "./ui/Badges";

export default function ProfileStats() {
  const { user } = useUser();
  const { streak, rank, badges } = useUserStats(user?.id);

  console.log(badges);

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
          <Badges badges={badges} />
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
          *Position is determined by # of uploads, streak counts days with
          consecutive uploads
        </p>
      </div>
    </div>
  );
}
