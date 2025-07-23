const { getUsers, getUserSubmissions, getUserBadges, awardUserBadges } = require("../controllers/userController");
const userService = require("../services/userService");

jest.mock("../services/userService", () => ({
  getAllUsers: jest.fn(),
  getUserSubmissions: jest.fn(),
  getUserBadges: jest.fn(),
  awardUserBadges: jest.fn(),
}));

describe("userController", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getUsers", () => {
    it("returns users as JSON on successful fetch", async () => {
      const mockUsers = [{ id: "user-1" }, { id: "user-2" }];
      userService.getAllUsers.mockResolvedValue(mockUsers);

      await getUsers(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(userService.getAllUsers).toHaveBeenCalled();
    });

    it("returns 500 with error message on failure", async () => {
      const error = new Error("Failed to fetch users");
      userService.getAllUsers.mockRejectedValue(error);

      await getUsers(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Failed to fetch users" });
      expect(userService.getAllUsers).toHaveBeenCalled();
    });
  });

  describe("getUserSubmissions", () => {
    it("returns user submissions as JSON on successful fetch", async () => {
      const userId = "user-123";
      const mockSubmissions = [
        { id: 1, temperature: 22, user_id: userId },
        { id: 2, temperature: 25, user_id: userId },
      ];
      mockReq.params.id = userId;
      userService.getUserSubmissions.mockResolvedValue(mockSubmissions);

      await getUserSubmissions(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockSubmissions);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(userService.getUserSubmissions).toHaveBeenCalledWith(userId);
    });

    it("returns 500 with error message on failure", async () => {
      const userId = "user-123";
      const error = new Error("Database error");
      mockReq.params.id = userId;
      userService.getUserSubmissions.mockRejectedValue(error);

      await getUserSubmissions(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
      expect(userService.getUserSubmissions).toHaveBeenCalledWith(userId);
    });
  });

  describe("getUserBadges", () => {
    it("returns user badges as JSON on successful fetch", async () => {
      const userId = "user-123";
      const mockBadges = [
        { earned_on: "2023-07-01", badge: { id: 1, name: "First Submission" } },
        { earned_on: "2023-07-02", badge: { id: 2, name: "Streak" } },
      ];
      mockReq.params.id = userId;
      userService.getUserBadges.mockResolvedValue(mockBadges);

      await getUserBadges(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockBadges);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(userService.getUserBadges).toHaveBeenCalledWith(userId);
    });

    it("returns 500 with error message on failure", async () => {
      const userId = "user-123";
      const error = new Error("Database error");
      mockReq.params.id = userId;
      userService.getUserBadges.mockRejectedValue(error);

      await getUserBadges(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
      expect(userService.getUserBadges).toHaveBeenCalledWith(userId);
    });
  });

  describe("awardUserBadges", () => {
    it("returns awarded badges as JSON with 200 status on successful award", async () => {
      const userId = "user-123";
      const mockBadges = [
        { id: 2, name: "Location Master" },
        { id: 3, name: "Special Badge" },
      ];
      mockReq.params.id = userId;
      userService.awardUserBadges.mockResolvedValue(mockBadges);

      await awardUserBadges(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockBadges);
      expect(userService.awardUserBadges).toHaveBeenCalledWith(userId);
    });

    it("returns 500 with error message on failure", async () => {
      const userId = "user-123";
      const error = new Error("Badge award error");
      mockReq.params.id = userId;
      userService.awardUserBadges.mockRejectedValue(error);

      await awardUserBadges(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Badge award error" });
      expect(userService.awardUserBadges).toHaveBeenCalledWith(userId);
    });
  });
});