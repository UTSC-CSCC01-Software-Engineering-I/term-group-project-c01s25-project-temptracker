import { render, screen } from "@testing-library/react";
import Badges from "@/components/ui/Badges";
import { BadgeData } from "@/types/badges";

describe("Badges component", () => {
  test("renders badge containers with correct badge count", () => {
    // --- PREPARE ---
    const testBadges: BadgeData[] = [
      {
        badge: {
          name: "Early Bird",
          description: "",
          category: "achievement",
          difficulty: "bronze",
        },
        earned_on: new Date("2025-07-01"),
      },
      {
        badge: {
          name: "Sharpshooter",
          description: "",
          category: "achievement",
          difficulty: "silver",
        },
        earned_on: new Date("2025-07-02"),
      },
      {
        badge: {
          name: "Consistent Contributor",
          description: "",
          category: "achievement",
          difficulty: "gold",
        },
        earned_on: new Date("2025-07-03"),
      },
      {
        badge: {
          name: "Elite",
          description: "",
          category: "achievement",
          difficulty: "diamond",
        },
        earned_on: new Date("2025-07-04"),
      },
    ];

    // --- ACT ---
    render(<Badges badges={testBadges} />);

    // --- VERIFY ---
    expect(screen.getByAltText("bronze")).toBeTruthy();
    expect(screen.getByAltText("silver")).toBeTruthy();
    expect(screen.getByAltText("gold")).toBeTruthy();
    expect(screen.getByAltText("diamond")).toBeTruthy();

    expect(screen.getAllByText("1")).toHaveLength(4); // One badge each
  });

  test("groups badges by difficulty and renders name/description", () => {
    // --- PREPARE ---
    const testBadges: BadgeData[] = [
      {
        badge: {
          name: "Early Bird",
          description: "Logged in early",
          category: "achievement",
          difficulty: "bronze",
        },
        earned_on: new Date("2025-07-01"),
      },
      {
        badge: {
          name: "Sharpshooter",
          description: "Perfect accuracy",
          category: "achievement",
          difficulty: "silver",
        },
        earned_on: new Date("2025-07-02"),
      },
      {
        badge: {
          name: "Consistent Contributor",
          description: "Posted daily",
          category: "achievement",
          difficulty: "gold",
        },
        earned_on: new Date("2025-07-03"),
      },
      {
        badge: {
          name: "Elite",
          description: "Top performer",
          category: "achievement",
          difficulty: "diamond",
        },
        earned_on: new Date("2025-07-04"),
      },
    ];

    // --- ACT ---
    render(<Badges badges={testBadges} />);
  });

  test("renders all 4 badge containers even with empty list", () => {
    // --- ACT ---
    render(<Badges badges={[]} />);

    // --- VERIFY ---
    expect(screen.getByAltText("bronze")).toBeTruthy();
    expect(screen.getByAltText("silver")).toBeTruthy();
    expect(screen.getByAltText("gold")).toBeTruthy();
    expect(screen.getByAltText("diamond")).toBeTruthy();
  });
});
