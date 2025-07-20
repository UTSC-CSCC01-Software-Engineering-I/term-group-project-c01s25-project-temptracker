import React from "react";
import { render, screen } from "@testing-library/react";
import Badge from "@/components/ui/Badge";
import { Badge as BadgeType } from "@/types/badges";

describe("Badge component", () => {
  const sampleBadge: BadgeType = {
    name: "Test Badge",
    description: "Earned for testing components.",
    category: "quality",
    difficulty: "bronze",
  };

  test("renders badge name and description", () => {
    const { container } = render(<Badge badge={sampleBadge} />);
    const html = container.innerHTML;

    expect(html.includes("Test Badge")).toBe(true);
    expect(html.includes("Earned for testing components.")).toBe(true);
    expect(html.includes("testing")).toBe(true);
    expect(html.includes("bronze")).toBe(true);
  });

  test("renders image with correct alt text and src", () => {
  render(<Badge badge={sampleBadge} />);
  const img = screen.getByAltText("bronze badge icon") as HTMLImageElement;

  expect(img.alt).toBe("bronze badge icon");
  expect(img.getAttribute("src")?.includes("badges%2Fbronze.png")).toBe(true);
});

  test("grayscale class applied when not earned", () => {
    const { container } = render(<Badge badge={sampleBadge} isEarnedByUser={false} />);
    expect(container.innerHTML.includes("grayscale")).toBe(true);
  });



  test("no earned date shown if not provided", () => {
    const { container } = render(<Badge badge={sampleBadge} isEarnedByUser={true} />);
    expect(container.innerHTML.includes("2025")).toBe(false);
  });
});
