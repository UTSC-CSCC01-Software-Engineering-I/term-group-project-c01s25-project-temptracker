const request = require("supertest");
const express = require("express");
const userRouter = require("../routes/userRoutes");
const userController = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authUser");
const { requireAdmin } = require("../middleware/reqAdmin");
const { verifySelfAccess } = require("../middleware/verifySelf");

jest.mock("../controllers/userController", () => ({
  getUsers: jest.fn(),
  getUserSubmissions: jest.fn(),
  getUserBadges: jest.fn(),
  awardUserBadges: jest.fn(),
}));

jest.mock("../middleware/authUser", () => ({
  authenticateUser: jest.fn((req, res, next) => {
    req.user = { id: "user-123", email: "test@example.com" };
    next();
  }),
}));

jest.mock("../middleware/reqAdmin", () => ({
  requireAdmin: jest.fn((req, res, next) => {
    next();
  }),
}));

jest.mock("../middleware/verifySelf", () => ({
  verifySelfAccess: jest.fn((req, res, next) => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      res.status(403).json({ error: "Access denied" });
    }
  }),
}));

describe("userRoutes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(userRouter);
  });

  describe("GET /", () => {
    it("should call getUsers controller and return 200 with users on success", async () => {
      const mockUsers = [{ id: "user-1" }, { id: "user-2" }];
      userController.getUsers.mockImplementation((req, res) =>
        res.json(mockUsers)
      );

      const response = await request(app)
        .get("/")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockUsers);
      expect(authenticateUser).toHaveBeenCalled();
      expect(requireAdmin).toHaveBeenCalled();
      expect(userController.getUsers).toHaveBeenCalled();
    });

    it("should return 500 with error message when getUsers controller fails", async () => {
      const error = new Error("Failed to fetch users");
      userController.getUsers.mockImplementation((req, res) =>
        res.status(500).json({ error: error.message })
      );

      const response = await request(app)
        .get("/")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Failed to fetch users" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(requireAdmin).toHaveBeenCalled();
      expect(userController.getUsers).toHaveBeenCalled();
    });

    it("should return 401 if authentication fails", async () => {
      authenticateUser.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: "Invalid token" })
      );

      const response = await request(app)
        .get("/")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid token" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(userController.getUsers).not.toHaveBeenCalled();
    });

    it("should return 403 if admin access is denied", async () => {
      requireAdmin.mockImplementationOnce((req, res) =>
        res.status(403).json({ error: "Admin access required" })
      );

      const response = await request(app)
        .get("/")
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Admin access required" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(requireAdmin).toHaveBeenCalled();
      expect(userController.getUsers).not.toHaveBeenCalled();
    });
  });

  describe("GET /:id/submissions", () => {
    it("should call getUserSubmissions controller and return 200 with submissions on success", async () => {
      const userId = "user-123";
      const mockSubmissions = [
        { id: 1, temperature: 22, user_id: userId },
        { id: 2, temperature: 25, user_id: userId },
      ];
      userController.getUserSubmissions.mockImplementation((req, res) =>
        res.json(mockSubmissions)
      );

      const response = await request(app)
        .get(`/${userId}/submissions`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubmissions);
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.getUserSubmissions).toHaveBeenCalled();
    });

    it("should return 500 with error message when getUserSubmissions controller fails", async () => {
      const userId = "user-123";
      const error = new Error("Database error");
      userController.getUserSubmissions.mockImplementation((req, res) =>
        res.status(500).json({ error: error.message })
      );

      const response = await request(app)
        .get(`/${userId}/submissions`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.getUserSubmissions).toHaveBeenCalled();
    });

    it("should return 401 if authentication fails", async () => {
      authenticateUser.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: "Invalid token" })
      );

      const response = await request(app)
        .get("/user-123/submissions")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid token" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).not.toHaveBeenCalled();
      expect(userController.getUserSubmissions).not.toHaveBeenCalled();
    });

    it("should return 403 if self-access is denied", async () => {
      const userId = "user-456";
      userController.getUserSubmissions.mockImplementation((req, res) =>
        res.json([])
      );

      const response = await request(app)
        .get(`/${userId}/submissions`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Access denied" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.getUserSubmissions).not.toHaveBeenCalled();
    });
  });

  describe("GET /:id/badges", () => {
    it("should call getUserBadges controller and return 200 with badges on success", async () => {
      const userId = "user-123";
      const mockBadges = [
        { earned_on: "2023-07-01", badge: { id: 1, name: "First Submission" } },
      ];
      userController.getUserBadges.mockImplementation((req, res) =>
        res.json(mockBadges)
      );

      const response = await request(app)
        .get(`/${userId}/badges`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBadges);
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.getUserBadges).toHaveBeenCalled();
    });

    it("should return 500 with error message when getUserBadges controller fails", async () => {
      const userId = "user-123";
      const error = new Error("Database error");
      userController.getUserBadges.mockImplementation((req, res) =>
        res.status(500).json({ error: error.message })
      );

      const response = await request(app)
        .get(`/${userId}/badges`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.getUserBadges).toHaveBeenCalled();
    });

    it("should return 401 if authentication fails", async () => {
      authenticateUser.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: "Invalid token" })
      );

      const response = await request(app)
        .get("/user-123/badges")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid token" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).not.toHaveBeenCalled();
      expect(userController.getUserBadges).not.toHaveBeenCalled();
    });

    it("should return 403 if self-access is denied", async () => {
      const userId = "user-456";
      userController.getUserBadges.mockImplementation((req, res) =>
        res.json([])
      );

      const response = await request(app)
        .get(`/${userId}/badges`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Access denied" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.getUserBadges).not.toHaveBeenCalled();
    });
  });

  describe("POST /:id/badges/award", () => {
    it("should call awardUserBadges controller and return 200 with badges on success", async () => {
      const userId = "user-123";
      const mockBadges = [
        { id: 2, name: "Location Master" },
        { id: 3, name: "Special Badge" },
      ];
      userController.awardUserBadges.mockImplementation((req, res) =>
        res.status(200).json(mockBadges)
      );

      const response = await request(app)
        .post(`/${userId}/badges/award`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBadges);
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.awardUserBadges).toHaveBeenCalled();
    });

    it("should return 500 with error message when awardUserBadges controller fails", async () => {
      const userId = "user-123";
      const error = new Error("Badge award error");
      userController.awardUserBadges.mockImplementation((req, res) =>
        res.status(500).json({ error: error.message })
      );

      const response = await request(app)
        .post(`/${userId}/badges/award`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Badge award error" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.awardUserBadges).toHaveBeenCalled();
    });

    it("should return 401 if authentication fails", async () => {
      authenticateUser.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: "Invalid token" })
      );

      const response = await request(app)
        .post("/user-123/badges/award")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid token" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).not.toHaveBeenCalled();
      expect(userController.awardUserBadges).not.toHaveBeenCalled();
    });

    it("should return 403 if self-access is denied", async () => {
      const userId = "user-456";
      userController.awardUserBadges.mockImplementation((req, res) =>
        res.status(200).json([])
      );

      const response = await request(app)
        .post(`/${userId}/badges/award`)
        .set("Authorization", "Bearer valid-token");

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ error: "Access denied" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(verifySelfAccess).toHaveBeenCalled();
      expect(userController.awardUserBadges).not.toHaveBeenCalled();
    });
  });
});