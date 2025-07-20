import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CommunityTab from "@/app/community/stats/page";

// ─── Mocks ─────────────────────────────────────────────────────
jest.mock("@/app/context", () => ({
  useUser: () => ({ user: { id: 1 } }),
}));

// PREPARE: mock leaderboard data
const uploadMock = [
  {
    user_id: 1,
    username: "haseeb",
    upload_count: 10,
    likes_count: 20,
    max_streak: 5,
    rank: 1,
  },
];
const likesMock = [
  {
    user_id: 2,
    username: "user2",
    upload_count: 5,
    likes_count: 50,
    max_streak: 3,
    rank: 1,
  },
];
const streakMock = [
  {
    user_id: 3,
    username: "user3",
    upload_count: 2,
    likes_count: 8,
    max_streak: 7,
    rank: 1,
  },
];

jest.mock("@/lib/services/statsService", () => ({
  fetchTopByUploadCount: jest.fn(() => Promise.resolve(uploadMock)),
  fetchTopByLikesCount: jest.fn(() => Promise.resolve(likesMock)),
  fetchTopByMaxStreak: jest.fn(() => Promise.resolve(streakMock)),
  fetchCurrentUserStatsWithRank: jest.fn(() =>
    Promise.resolve({
      user_id: 1,
      username: "haseeb",
      upload_count: 10,
      likes_count: 20,
      max_streak: 5,
      rank: 1,
    })
  ),
}));

// ─── Tests ─────────────────────────────────────────────────────
describe("CommunityTab", () => {
  test("renders leaderboard with upload data", async () => {
    // ACT
    render(<CommunityTab />);

    // VERIFY: user 'haseeb' and upload count '10' appear at least twice (main list + current user)
    await waitFor(() => {
      const rows = screen.getAllByText("haseeb");
      expect(rows.length).toBeGreaterThanOrEqual(2);
      expect(screen.getAllByText("10").length).toBeGreaterThanOrEqual(1);
    });
  });

  test("switches leaderboard sort to Likes", async () => {
    // ACT
    render(<CommunityTab />);

    // WAIT: for default 'Uploads' tab to finish loading
    await waitFor(() => expect(screen.queryByText("Loading...")).toBeNull());

    // ACT: switch to Likes tab
    const likeButtons = screen.getAllByText("Likes");
    fireEvent.click(likeButtons.find((el) => el.tagName === "BUTTON")!);

    // VERIFY: likes leaderboard loads
    await waitFor(() => {
      expect(screen.getAllByText("user2").length).toBeGreaterThan(0);
      expect(screen.getAllByText("50").length).toBeGreaterThan(0);
    });
  });

  test("switches leaderboard sort to Max Streak", async () => {
    // ACT
    render(<CommunityTab />);

    // WAIT: for default 'Uploads' tab to finish loading
    await waitFor(() => expect(screen.queryByText("Loading...")).toBeNull());

    // ACT: switch to Max Streak tab
    const streakButtons = screen.getAllByText("Max Streak");
    fireEvent.click(streakButtons.find((el) => el.tagName === "BUTTON")!);

    // VERIFY: streak leaderboard loads
    await waitFor(() => {
      expect(screen.getAllByText("user3").length).toBeGreaterThan(0);
      expect(screen.getAllByText("7").length).toBeGreaterThan(0);
    });
  });

  test("renders current user row if user is logged in", async () => {
    // ACT
    render(<CommunityTab />);

    // VERIFY: user 'haseeb' shows up in leaderboard + current user bar
    await waitFor(() => {
      const matches = screen.getAllByText("haseeb");
      expect(matches.length).toBeGreaterThan(1);
    });
  });
});
