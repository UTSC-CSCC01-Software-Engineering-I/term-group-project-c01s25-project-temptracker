jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

const {
  awardStatsRelatedBadges,
  awardSubmissionSpecificBadges,
  awardSpecialBadges,
  getGreatLakesVisited,
} = require("../services/badgeAwardService");
const supabase = require("../models/supabaseClient");

jest.mock("../models/supabaseClient", () => ({
  auth: {
    admin: {
      getUserById: jest.fn(),
    },
  },
  from: jest.fn(),
}));

describe("badgeAwardService", () => {
  let mockFrom;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    };
    supabase.from.mockImplementation(() => mockFrom);
  });

  describe("awardStatsRelatedBadges", () => {
    it("awards badge when submission count meets requirement", async () => {
      const badge = { id: 1, requirement_metric: "submission", requirement_amount: 10, name: "Submission Pro" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq().single.mockResolvedValueOnce({ data: { user_id: userId, upload_count: 15 }, error: null });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 1, earned_on: "2025-07-19" }, error: null });

      await awardStatsRelatedBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("stats");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 1, earned_on: expect.any(Date) });
    });

    it("awards badge when streak meets requirement", async () => {
      const badge = { id: 4, requirement_metric: "streak", requirement_amount: 7, name: "Streak Master" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq().single.mockResolvedValueOnce({ data: { user_id: userId, curr_streak: 10 }, error: null });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 4, earned_on: "2025-07-19" }, error: null });

      await awardStatsRelatedBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("stats");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 4, earned_on: expect.any(Date) });
    });

    it("awards badge when engagement meets requirement", async () => {
      const badge = { id: 5, requirement_metric: "engagement", requirement_amount: 50, name: "Engagement Star" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq().single.mockResolvedValueOnce({ data: { user_id: userId, likes_count: 60 }, error: null });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 5, earned_on: "2025-07-19" }, error: null });

      await awardStatsRelatedBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("stats");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 5, earned_on: expect.any(Date) });
    });

    it("does not award badge when requirements are not met", async () => {
      const badge = { id: 1, requirement_metric: "submission", requirement_amount: 10, name: "Submission Pro" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq().single.mockResolvedValueOnce({ data: { user_id: userId, upload_count: 5 }, error: null });

      await awardStatsRelatedBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([]);
      expect(supabase.from).toHaveBeenCalledWith("stats");
      expect(mockFrom.insert).not.toHaveBeenCalled();
    });

    it("handles errors during stats fetch", async () => {
      const badge = { id: 1, requirement_metric: "submission", requirement_amount: 10 };
      const userId = "user-123";
      const awardedBadges = [];
      const error = new Error("Database error");
      mockFrom.eq().single.mockRejectedValueOnce(error);

      await expect(awardStatsRelatedBadges(badge, userId, awardedBadges)).rejects.toThrow("Database error");
      expect(awardedBadges).toEqual([]);
      expect(supabase.from).toHaveBeenCalledWith("stats");
      expect(console.error).toHaveBeenCalledWith("Error in awardStatsRelatedBadges:", error);
    });
  });

  describe("awardSubmissionSpecificBadges", () => {
    it("awards Verified Contributor badge when submission is verified", async () => {
      const badge = { id: 15, name: "Verified Contributor" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq.mockResolvedValueOnce({ data: [{ user_id: userId, is_verified: true }], error: null });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 15, earned_on: "2025-07-19" }, error: null });

      await awardSubmissionSpecificBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 15, earned_on: expect.any(Date) });
    });

    it("awards Night Owl badge for late-night submission", async () => {
      const badge = { id: 13, name: "Night Owl" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq.mockResolvedValueOnce({
        data: [{ user_id: userId, measured_on: "2025-07-19T22:30:00Z" }],
        error: null,
      });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 13, earned_on: "2025-07-19" }, error: null });

      await awardSubmissionSpecificBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 13, earned_on: expect.any(Date) });
    });

    it("awards Early Bird badge for early-morning submission", async () => {
      const badge = { id: 16, name: "Early Bird" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq.mockResolvedValueOnce({
        data: [{ user_id: userId, measured_on: "2025-07-19T06:00:00Z" }],
        error: null,
      });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 16, earned_on: "2025-07-19" }, error: null });

      await awardSubmissionSpecificBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 16, earned_on: expect.any(Date) });
    });

    it("awards Detail Oriented badge for 25+ submissions with notes", async () => {
      const badge = { id: 10, name: "Detail Oriented" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq.mockResolvedValueOnce({
        data: Array(25).fill({ user_id: userId, notes: "Test note" }),
        error: null,
      });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 10, earned_on: "2025-07-19" }, error: null });

      await awardSubmissionSpecificBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 10, earned_on: expect.any(Date) });
    });

    it("awards Local Explorer badge for unique locations", async () => {
      const badge = { id: 6, name: "Local Explorer", requirement_amount: 5 };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq.mockResolvedValueOnce({
        data: [
          { user_id: userId, latitude: 40, longitude: -80 },
          { user_id: userId, latitude: 41, longitude: -81 },
          { user_id: userId, latitude: 42, longitude: -82 },
          { user_id: userId, latitude: 43, longitude: -83 },
          { user_id: userId, latitude: 44, longitude: -84 },
        ],
        error: null,
      });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 6, earned_on: "2025-07-19" }, error: null });

      await awardSubmissionSpecificBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 6, earned_on: expect.any(Date) });
    });

    it("awards Temperature Hunter badge for temperature range", async () => {
      const badge = { id: 9, name: "Temperature Hunter", requirement_amount: 20 };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq.mockResolvedValueOnce({
        data: [
          { user_id: userId, temperature: 10 },
          { user_id: userId, temperature: 30 },
        ],
        error: null,
      });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 9, earned_on: "2025-07-19" }, error: null });

      await awardSubmissionSpecificBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 9, earned_on: expect.any(Date) });
    });

    it("awards Lake Hopper badge for Great Lakes visits", async () => {
      const badge = { id: 7, name: "Lake Hopper", requirement_amount: 2 };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq.mockResolvedValueOnce({
        data: [
          { user_id: userId, latitude: 47, longitude: -88 }, // Lake Superior
          { user_id: userId, latitude: 44, longitude: -82 }, // Lake Huron
        ],
        error: null,
      });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 7, earned_on: "2025-07-19" }, error: null });

      await awardSubmissionSpecificBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 7, earned_on: expect.any(Date) });
    });

    it("does not award badge for unknown ID", async () => {
      const badge = { id: 999, name: "Unknown Badge" };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.eq.mockResolvedValueOnce({ data: [], error: null });

      await awardSubmissionSpecificBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockFrom.insert).not.toHaveBeenCalled();
    });

    it("handles errors during submission fetch", async () => {
      const badge = { id: 15, name: "Verified Contributor" };
      const userId = "user-123";
      const awardedBadges = [];
      const error = new Error("Database error");
      mockFrom.eq.mockRejectedValueOnce(error);

      await expect(awardSubmissionSpecificBadges(badge, userId, awardedBadges)).rejects.toThrow("Database error");
      expect(awardedBadges).toEqual([]);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(console.error).toHaveBeenCalledWith("Error in awardSubmissionSpecificBadges:", error);
    });
  });

  describe("awardSpecialBadges", () => {
    it("awards Veteran badge for account age", async () => {
      const badge = { id: 14, name: "Veteran", requirement_amount: 365 };
      const userId = "user-123";
      const awardedBadges = [];
      supabase.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user_metadata: { created_at: "2023-07-01" } },
        error: null,
      });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 14, earned_on: "2025-07-19" }, error: null });

      await awardSpecialBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.auth.admin.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 14, earned_on: expect.any(Date) });
    });

    it("awards Top 10 badge for top upload count", async () => {
      const badge = { id: 12, name: "Top 10", requirement_amount: 10 };
      const userId = "user-123";
      const awardedBadges = [];
      mockFrom.order().limit.mockResolvedValueOnce({
        data: [{ user_id: userId, upload_count: 100 }],
        error: null,
      });
      mockFrom.insert().select().single.mockResolvedValueOnce({ data: { user_id: userId, badge_id: 12, earned_on: "2025-07-19" }, error: null });

      await awardSpecialBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([{ ...badge, earned_on: "2025-07-19" }]);
      expect(supabase.from).toHaveBeenCalledWith("stats");
      expect(mockFrom.insert).toHaveBeenCalledWith({ user_id: userId, badge_id: 12, earned_on: expect.any(Date) });
    });

    it("does not award Veteran badge for new account", async () => {
      const badge = { id: 14, name: "Veteran", requirement_amount: 365 };
      const userId = "user-123";
      const awardedBadges = [];
      supabase.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user_metadata: { created_at: "2025-07-01" } },
        error: null,
      });

      await awardSpecialBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([]);
      expect(supabase.auth.admin.getUserById).toHaveBeenCalledWith(userId);
      expect(mockFrom.insert).not.toHaveBeenCalled();
    });

    it("does not award badge for unknown ID", async () => {
      const badge = { id: 999, name: "Unknown Badge" };
      const userId = "user-123";
      const awardedBadges = [];

      await awardSpecialBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toEqual([]);
      expect(supabase.auth.admin.getUserById).not.toHaveBeenCalled();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it("handles errors during user fetch", async () => {
      const badge = { id: 14, name: "Veteran", requirement_amount: 365 };
      const userId = "user-123";
      const awardedBadges = [];
      const error = new Error("Database error");
      supabase.auth.admin.getUserById.mockRejectedValueOnce(error);

      await expect(awardSpecialBadges(badge, userId, awardedBadges)).rejects.toThrow("Database error");
      expect(awardedBadges).toEqual([]);
      expect(supabase.auth.admin.getUserById).toHaveBeenCalledWith(userId);
      expect(console.error).toHaveBeenCalledWith("Error in awardSpecialBadges:", error);
    });
  });

  describe("getGreatLakesVisited", () => {
    it("returns count of unique Great Lakes visited", () => {
      const userSubmissions = [
        { latitude: 47, longitude: -88 }, // Lake Superior
        { latitude: 44, longitude: -82 }, // Lake Huron
        { latitude: 44, longitude: -82 }, // Duplicate Lake Huron
        { latitude: 42, longitude: -81 }, // Lake Erie
      ];

      const result = getGreatLakesVisited(userSubmissions);

      expect(result).toBe(3);
      expect(console.log).toHaveBeenCalledWith("Visited Great Lakes:", expect.any(Set));
    });

    it("returns 0 when no Great Lakes visited", () => {
      const userSubmissions = [
        { latitude: 30, longitude: -90 }, // Outside Great Lakes
      ];

      const result = getGreatLakesVisited(userSubmissions);

      expect(result).toBe(0);
      expect(console.log).toHaveBeenCalledWith("Visited Great Lakes:", expect.any(Set));
    });

    it("handles empty submissions", () => {
      const userSubmissions = [];

      const result = getGreatLakesVisited(userSubmissions);

      expect(result).toBe(0);
      expect(console.log).toHaveBeenCalledWith("Visited Great Lakes:", expect.any(Set));
    });
  });
});
