jest.spyOn(console, "error").mockImplementation(() => {});

const {
  getAllUsers,
  getUserSubmissions,
  getUserBadges,
  awardUserBadges,
} = require("../services/userService");
const badgeAwardService = require("../services/badgeAwardService");

jest.mock("../models/supabaseClient", () => ({
  auth: {
    admin: {
      listUsers: jest.fn(),
    },
  },
  from: jest.fn(),
}));

jest.mock("../services/badgeAwardService", () => ({
  awardStatsRelatedBadges: jest.fn(),
  awardSubmissionSpecificBadges: jest.fn(),
  awardSpecialBadges: jest.fn(),
}));

const supabase = require("../models/supabaseClient");

describe("userService", () => {
  let mockSelect, mockEq;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSelect = jest.fn().mockReturnThis();
    mockEq = jest.fn().mockReturnThis();
    supabase.from.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
    });
  });

  describe("getAllUsers", () => {
    it("returns list of users on success", async () => {
      const mockUsers = [{ id: "user-1" }, { id: "user-2" }];
      supabase.auth.admin.listUsers.mockResolvedValue({ data: mockUsers, error: null });

      const result = await getAllUsers();

      expect(result).toEqual(mockUsers);
      expect(supabase.auth.admin.listUsers).toHaveBeenCalled();
    });

    it("throws error when Supabase fails", async () => {
      const error = new Error("Failed to fetch users");
      supabase.auth.admin.listUsers.mockResolvedValue({ data: null, error });

      await expect(getAllUsers()).rejects.toThrow("Failed to fetch users");
    });
  });

  describe("getUserSubmissions", () => {
    it("returns user submissions for a given user ID", async () => {
      const mockSubmissions = [
        { id: 1, temperature: 22, user_id: "user-123" },
        { id: 2, temperature: 25, user_id: "user-123" },
      ];
      mockEq.mockResolvedValueOnce({ data: mockSubmissions, error: null });

      const result = await getUserSubmissions("user-123");

      expect(result).toEqual(mockSubmissions);
      expect(supabase.from).toHaveBeenCalledWith("temperatures");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("returns empty array when no submissions exist", async () => {
      mockEq.mockResolvedValueOnce({ data: null, error: null });

      const result = await getUserSubmissions("user-123");

      expect(result).toEqual([]);
    });

    it("handles errors during submission fetch", async () => {
      const error = new Error("Database error");
      mockEq.mockRejectedValueOnce(error);

      await expect(getUserSubmissions("user-123")).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("Error fetching user submissions:", error);
    });
  });

  describe("getUserBadges", () => {
    it("returns formatted user badges for a given user ID", async () => {
      const mockBadges = [
        { earned_on: "2023-07-01", badges: { id: 1, name: "First Submission" } },
        { earned_on: "2023-07-02", badges: { id: 2, name: "Streak" } },
      ];
      mockEq.mockResolvedValueOnce({ data: mockBadges, error: null });

      const result = await getUserBadges("user-123");

      expect(result).toEqual([
        { earned_on: "2023-07-01", badge: { id: 1, name: "First Submission" } },
        { earned_on: "2023-07-02", badge: { id: 2, name: "Streak" } },
      ]);
      expect(supabase.from).toHaveBeenCalledWith("user_badges");
      expect(mockSelect).toHaveBeenCalledWith("earned_on, badges (*)");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("returns empty array when no badges exist", async () => {
      mockEq.mockResolvedValueOnce({ data: null, error: null });

      const result = await getUserBadges("user-123");

      expect(result).toEqual([]);
    });

    it("handles errors during badge fetch", async () => {
      const error = new Error("Database error");
      mockEq.mockRejectedValueOnce(error);

      await expect(getUserBadges("user-123")).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("Error fetching user badges:", error);
    });
  });

  describe("awardUserBadges", () => {
    it("awards new badges to user based on requirements", async () => {
      const mockBadges = [
        { id: 1, requirement_metric: "submission" },
        { id: 2, requirement_metric: "locations" },
        { id: 3, requirement_metric: "special" },
        { id: 4, requirement_metric: "streak" },
      ];
      const mockUserBadges = [{ badge_id: 1, user_id: "user-123" }];
      const mockAwardedBadges = [
        { id: 2, name: "Location Master" },
        { id: 3, name: "Special Badge" },
        { id: 4, name: "Streak Master" },
      ];

      supabase.from.mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(
          table === "badges"
            ? { data: mockBadges, error: null }
            : { data: mockUserBadges, error: null }
        ),
      }));

      badgeAwardService.awardStatsRelatedBadges.mockImplementation(
        async (badge, userId, awardedBadges) => {
          if (badge.id === 4) {
            awardedBadges.push({ id: 4, name: "Streak Master" });
          }
        }
      );
      badgeAwardService.awardSubmissionSpecificBadges.mockImplementation(
        async (badge, userId, awardedBadges) => {
          if (badge.id === 2) {
            awardedBadges.push({ id: 2, name: "Location Master" });
          }
        }
      );
      badgeAwardService.awardSpecialBadges.mockImplementation(
        async (badge, userId, awardedBadges) => {
          if (badge.id === 3) {
            awardedBadges.push({ id: 3, name: "Special Badge" });
          }
        }
      );

      const result = await awardUserBadges("user-123");

      expect(result).toEqual(mockAwardedBadges);
      expect(supabase.from).toHaveBeenCalledWith("badges");
      expect(supabase.from).toHaveBeenCalledWith("user_badges");
      expect(badgeAwardService.awardStatsRelatedBadges).toHaveBeenCalledWith(
        { id: 4, requirement_metric: "streak" },
        "user-123",
        expect.any(Array)
      );
      expect(badgeAwardService.awardSubmissionSpecificBadges).toHaveBeenCalledWith(
        { id: 2, requirement_metric: "locations" },
        "user-123",
        expect.any(Array)
      );
      expect(badgeAwardService.awardSpecialBadges).toHaveBeenCalledWith(
        { id: 3, requirement_metric: "special" },
        "user-123",
        expect.any(Array)
      );
    });

    it("skips already awarded badges", async () => {
      const mockBadges = [{ id: 1, requirement_metric: "submission" }];
      const mockUserBadges = [{ badge_id: 1, user_id: "user-123" }];

      supabase.from.mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue(
          table === "badges"
            ? { data: mockBadges, error: null }
            : { data: mockUserBadges, error: null }
        ),
      }));

      const result = await awardUserBadges("user-123");

      expect(result).toEqual([]);
      expect(badgeAwardService.awardStatsRelatedBadges).not.toHaveBeenCalled();
    });

    it("handles errors during badge awarding", async () => {
      const error = new Error("Badge award error");
      supabase.from.mockImplementation((table) => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(error),
      }));

      await expect(awardUserBadges("user-123")).rejects.toThrow("Badge award error");
      expect(console.error).toHaveBeenCalledWith("Error awarding user badges:", error);
    });
  });
});