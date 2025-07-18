import React from "react";
import { Badge as BadgeType } from "@/types/badges";
import Image from "next/image";

interface BadgeProps {
  badge: BadgeType;
  isEarnedByUser?: boolean;
  earnedDate?: Date;
}

export default function Badge({
  badge,
  isEarnedByUser = false,
  earnedDate,
}: BadgeProps) {
  const isUnlocked = isEarnedByUser;

  return (
    <div
      className={`
      relative overflow-hidden rounded-lg border-2 ${badge.difficulty}-badge
      p-4 shadow-lg hover:shadow-xl transition-all duration-300 
      transform hover:scale-105 cursor-pointer
      min-h-[160px] flex flex-col justify-between
      ${!isUnlocked ? "opacity-60 filter grayscale" : ""}
    `}
    >
      {/* Difficulty indicator */}
      <div
        className={`absolute top-0 right-0 badge-accent text-white text-xs px-2 py-1 rounded-bl-lg font-semibold uppercase`}
      >
        {badge.difficulty}
      </div>

      {/* Badge icon */}
      <div className="flex items-center justify-center mb-3">
        <Image
          src={`/badges/${badge.difficulty}.png`}
          alt={`${badge.difficulty} badge icon`}
          width={64}
          height={64}
        />
      </div>

      {/* Badge content */}
      <div className="flex-1 text-center">
        <h3 className={`font-bold text-lg mb-2`}>{badge.name}</h3>
        <p className={`text-sm opacity-80 mb-3`}>{badge.description}</p>
      </div>

      {/* Badge category */}
      <div className="flex items-center justify-between mt-auto">
        <span
          className={`
          inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
          bg-white/30 border-white/50 capitalize
        `}
        >
          {badge.category}
        </span>

        {/* Unlocked date */}
        {isUnlocked && earnedDate && (
          <span className={`text-xs opacity-70 font-medium`}>
            {earnedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
