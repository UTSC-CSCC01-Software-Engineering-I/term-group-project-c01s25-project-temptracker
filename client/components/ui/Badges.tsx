import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import { BadgeData } from "@/types/badges";

function BadgeContainer({
  type,
  badges,
}: {
  type: string;
  badges: BadgeData[];
}) {
  return (
    <Tooltip>
      <TooltipTrigger className="relative flex justify-center items-center select-none">
        <Image src={`/badges/${type}.png`} alt={type} width={70} height={70} />
        <p className="z-10 absolute text-xl font-bold text-white hover:cursor-default">
          {badges.length}
        </p>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-lg font-semibold mb-2 capitalize text-white">
          {type} Badges
        </p>
        <div className="flex flex-col gap-2">
          {badges.map((badge) => (
            <div key={badge.badge.name}>
              <h4 className="text-base text-white">
                {badge.badge.name} | Earned on{" "}
                {new Date(badge.earned_on).toLocaleDateString()}
              </h4>
              <p className={`text-sm text-muted`}>{badge.badge.description}</p>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default function Badges({ badges }: { badges: BadgeData[] }) {
  const bronzeBadges: BadgeData[] = [];
  const silverBadges: BadgeData[] = [];
  const goldBadges: BadgeData[] = [];
  const diamondBadges: BadgeData[] = [];

  badges.forEach((badge) => {
    switch (badge.badge.difficulty) {
      case "bronze":
        bronzeBadges.push(badge);
        break;
      case "silver":
        silverBadges.push(badge);
        break;
      case "gold":
        goldBadges.push(badge);
        break;
      case "diamond":
        diamondBadges.push(badge);
        break;
    }
  });

  return (
    <div className="grid grid-cols-2 gap-y-2 w-full md:flex md:flex-row md:gap-4">
      <BadgeContainer type="bronze" badges={bronzeBadges} />
      <BadgeContainer type="silver" badges={silverBadges} />
      <BadgeContainer type="gold" badges={goldBadges} />
      <BadgeContainer type="diamond" badges={diamondBadges} />
    </div>
  );
}
