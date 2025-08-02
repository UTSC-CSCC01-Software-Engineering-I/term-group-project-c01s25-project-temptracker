import { MapPin, UserRound } from "lucide-react";
import Image from "next/image";

interface ProfileHeaderProps {
  profile: {
    username: string;
    biography: string | null;
    location: string | null;
    is_public: boolean;
    profile_picture_url: string | null;
  };
  joinedDate: string;
}

export default function ProfileHeader({
  profile,
  joinedDate,
}: ProfileHeaderProps) {
  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      <div className="bg-nav-blue h-8 flex items-center justify-end px-4">
        <span className="text-xs font-medium text-white px-2 py-1 rounded">
          {profile.is_public ? "Public" : "Private"} Profile
        </span>
      </div>

      <div className="flex flex-col bg-white p-6 gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Avatar - matching profile page style */}
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
            {profile.profile_picture_url ? (
              <Image
                src={profile.profile_picture_url}
                alt="pfp"
                width={100}
                height={100}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <UserRound className="w-10 h-10 text-muted-foreground" />
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-dark-blue text-left">
              {profile.username}
            </h2>
            <div className="mt-2">
              <p className="text-sm text-gray-500">Member since {joinedDate}</p>
              {profile.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Biography section - matching profile page style */}
        {profile.biography && (
          <div>
            <h3 className="font-bold mb-2">About</h3>
            <p className="text-gray-700 break-all md:text-base text-sm">
              {profile.biography}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
