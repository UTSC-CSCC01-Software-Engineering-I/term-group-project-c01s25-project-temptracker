import { Trophy } from "lucide-react";
import { format } from "date-fns";

interface ProfileBadgesProps {
  badges?: Array<{
    id: string;
    name: string;
    description: string;
    earned_on: string;
  }>;
}

export default function ProfileBadges({ badges }: ProfileBadgesProps) {
  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-6 h-6" />
        Badges & Achievements
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 bg-white shadow-md rounded-lg p-6">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border"
            title={badge.description}
          >
            <p className="text-sm font-medium text-gray-800">{badge.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(badge.earned_on), "MMM yyyy")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
