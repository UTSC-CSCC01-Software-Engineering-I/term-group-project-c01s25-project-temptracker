import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import CommunityTab from "@/app/community/stats/page";
import { useUser } from "@/app/context";
import { useCommunityStats } from "@/hooks/useCommunityStats";
import { useUserStats } from "@/hooks/useUserStats";

// ─── Mocks ──────────────────────────────────────────────────────────────
jest.mock("@/app/context", () => ({
  useUser: jest.fn(),
}));

jest.mock("@/hooks/useCommunityStats", () => ({
  useCommunityStats: jest.fn(),
}));

jest.mock("@/hooks/useUserStats", () => ({
  useUserStats: jest.fn(),
}));

// ─── Test Data ──────────────────────────────────────────────────────────
const mockUser = { id: "user1", email: "test@example.com" };
const mockUsers = [
  {
    user_id: "user1",
    rank: 1,
    username: "Alpha",
    uploads: 10,
    streak: 5,
    likes: 100,
  },
  {
    user_id: "user2",
    rank: 2,
    username: "Beta",
    uploads: 8,
    streak: 3,
    likes: 50,
  },
];
const mockBadges = [
  {
    name: "Bronze",
    category: "contribution",
    description: "Basic badge",
    image_url: "bronze.png",
  },
  {
    name: "Silver",
    category: "exploration",
    description: "Medium badge",
    image_url: "silver.png",
  },
];
const mockUserBadges = [
  {
    badge: {
      name: "Bronze",
      category: "contribution",
      image_url: "bronze.png",
    },
    earned_on: new Date().toISOString(),
  },
];

// ─── Tests ──────────────────────────────────────────────────────────────
describe("CommunityTab", () => {
  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({ user: mockUser });

    (useCommunityStats as jest.Mock).mockReturnValue({
      sortKey: "upload_count",
      users: mockUsers,
      currentUserStat: mockUsers[0],
      loading: false,
      setSortKey: jest.fn(),
      allBadges: mockBadges,
    });

    (useUserStats as jest.Mock).mockReturnValue({
      badges: mockUserBadges,
    });
  });

  test("renders leaderboard and badges with stats", () => {
    render(<CommunityTab />);
    expect(screen.queryByText(/Community Leaderboard/i)).toBeTruthy();
    expect(screen.queryAllByText("Alpha").length).toBeGreaterThan(0);
    expect(screen.queryAllByText("Beta").length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/Badges/i).length).toBeGreaterThan(0); // ✅ fixed
    expect(screen.queryByText(/Bronze/i)).toBeTruthy();
  });

  test("changes sort key on button click", () => {
    const setSortKeyMock = jest.fn();
    (useCommunityStats as jest.Mock).mockReturnValue({
      sortKey: "upload_count",
      users: mockUsers,
      currentUserStat: mockUsers[0],
      loading: false,
      setSortKey: setSortKeyMock,
      allBadges: mockBadges,
    });

    render(<CommunityTab />);

    const sortButtons = screen.getAllByRole("button", { name: /Likes/i });
    fireEvent.click(sortButtons[0]); // Only click the one in the controls
    expect(setSortKeyMock).toHaveBeenCalledWith("likes_count");

    const streakButton = screen.getByRole("button", { name: /Max Streak/i });
    fireEvent.click(streakButton);
    expect(setSortKeyMock).toHaveBeenCalledWith("max_streak");
  });

  test("displays loading state", () => {
    (useCommunityStats as jest.Mock).mockReturnValue({
      sortKey: "upload_count",
      users: [],
      currentUserStat: null,
      loading: true,
      setSortKey: jest.fn(),
      allBadges: [],
    });

    render(<CommunityTab />);
    expect(screen.queryByText("Loading...")).toBeTruthy();
  });

  test("filters badge categories and updates header", () => {
    render(<CommunityTab />);
    expect(screen.queryByText(/all \(2\)/i)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /contribution/i }));
    expect(screen.queryByText(/1\/1 earned contribution/i)).toBeTruthy();
  });

  test("shows empty state if no badges available", () => {
    (useCommunityStats as jest.Mock).mockReturnValue({
      sortKey: "upload_count",
      users: mockUsers,
      currentUserStat: mockUsers[0],
      loading: false,
      setSortKey: jest.fn(),
      allBadges: [],
    });

    render(<CommunityTab />);
    expect(screen.queryByText(/No badges available/i)).toBeTruthy();
  });
});