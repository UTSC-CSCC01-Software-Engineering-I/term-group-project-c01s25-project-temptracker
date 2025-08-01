import Link from "next/link";
import { Calendar, UserRound } from "lucide-react";
import { format } from "date-fns";

export interface PublicUser {
  id: string;
  username: string;
  biography: string | null;
  email_confirmed_at: string | null;
}

interface UserCardProps {
  user: PublicUser;
}

export default function UserCard({ user }: UserCardProps) {
  const joinedDate = user.email_confirmed_at
    ? format(new Date(user.email_confirmed_at), "MMMM yyyy")
    : "Unknown";

  return (
    <Link href={`/user/${user.username}`}>
      <div className="bg-card border rounded-lg p-6 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col h-full">
        <div className="flex-1">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <UserRound className="text-muted-foreground" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-nav-blue transition-colors truncate">
                {user.username || "Unknown"}
              </h3>
              {user.biography && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed break-all">
                  {user.biography.length > 100
                    ? `${user.biography.substring(0, 100)}...`
                    : user.biography}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center text-xs text-muted-foreground pt-3 mt-auto border-t">
          <Calendar className="w-3 h-3 mr-1" />
          Joined {joinedDate}
        </div>
      </div>
    </Link>
  );
}
