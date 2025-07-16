import Image from "next/image";

interface Badge {
  name: string;
  description: string;
  category:
    | "contribution"
    | "exploration"
    | "quality"
    | "achievement"
    | "special";
  difficulty: "bronze" | "silver" | "gold" | "diamond";
  unlockedAt?: Date;
}

interface BadgeData {
  earned_on: Date;
  badge: Badge;
}

function BadgeContainer({
  type,
  badges,
}: {
  type: string;
  badges: BadgeData[];
}) {
  return (
    <div className="relative flex justify-center items-center select-none">
      <Image src={`/badges/${type}.png`} alt={type} width={70} height={70} />
      <p className="z-10 absolute text-xl font-bold text-white hover:cursor-default">
        {badges.length}
      </p>
    </div>
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
