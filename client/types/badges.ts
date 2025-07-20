export type Badge = {
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

export type BadgeData = {
  earned_on: Date;
  badge: Badge;
}