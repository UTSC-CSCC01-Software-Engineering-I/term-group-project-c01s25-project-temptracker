const request = require("supertest");
const express = require("express");
const temperatureRouter = require("../routes/temperatureRoutes");
const temperatureController = require("../controllers/temperatureController");
const { authenticateUser } = require("../middleware/authUser");

jest.mock("../controllers/temperatureController", () => ({
  submitTemperature: jest.fn(),
  submitTemperatures: jest.fn(),
}));

jest.mock("../middleware/authUser", () => ({
  authenticateUser: jest.fn((req, res, next) => {
    req.user = { id: "user-123", email: "test@example.com" };
    next();
  }),
}));

describe("temperatureRoutes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(temperatureRouter);
  });

  describe("POST /single", () => {
    it("should call submitTemperature controller and return 201 with result on success", async () => {
      const mockData = { temperature: 22, user_id: "user-123" };
      const mockResult = { id: 1, ...mockData };
      temperatureController.submitTemperature.mockImplementation((req, res) =>
        res.status(201).json(mockResult)
      );

      const response = await request(app)
        .post("/single")
        .set("Authorization", "Bearer valid-token")
        .send(mockData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
      expect(authenticateUser).toHaveBeenCalled();
      expect(temperatureController.submitTemperature).toHaveBeenCalled();
    });

    it("should return 500 with error message when submitTemperature controller fails", async () => {
      const mockData = { temperature: 22, user_id: "user-123" };
      const error = new Error("Database error");
      temperatureController.submitTemperature.mockImplementation((req, res) =>
        res.status(500).json({ error: error.message })
      );

      const response = await request(app)
        .post("/single")
        .set("Authorization", "Bearer valid-token")
        .send(mockData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(temperatureController.submitTemperature).toHaveBeenCalled();
    });

    it("should return 401 if authentication fails", async () => {
      authenticateUser.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: "Invalid token" })
      );

      const response = await request(app)
        .post("/single")
        .set("Authorization", "Bearer invalid-token")
        .send({ temperature: 22, user_id: "user-123" });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid token" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(temperatureController.submitTemperature).not.toHaveBeenCalled();
    });
  });

  describe("POST /csv", () => {
    it("should call submitTemperatures controller and return 201 with result on success", async () => {
      const mockData = [
        { temperature: 22, user_id: "user-123" },
        { temperature: 25, user_id: "user-123" },
      ];
      const mockResult = [
        { id: 1, temperature: 22, user_id: "user-123" },
        { id: 2, temperature: 25, user_id: "user-123" },
      ];
      temperatureController.submitTemperatures.mockImplementation((req, res) =>
        res.status(201).json(mockResult)
      );

      const response = await request(app)
        .post("/csv")
        .set("Authorization", "Bearer valid-token")
        .send(mockData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockResult);
      expect(authenticateUser).toHaveBeenCalled();
      expect(temperatureController.submitTemperatures).toHaveBeenCalled();
    });

    it("should return 500 with error message when submitTemperatures controller fails", async () => {
      const mockData = [
        { temperature: 22, user_id: "user-123" },
        { temperature: 25, user_id: "user-123" },
      ];
      const error = new Error("Database error");
      temperatureController.submitTemperatures.mockImplementation((req, res) =>
        res.status(500).json({ error: error.message })
      );

      const response = await request(app)
        .post("/csv")
        .set("Authorization", "Bearer valid-token")
        .send(mockData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(temperatureController.submitTemperatures).toHaveBeenCalled();
    });

    it("should return 401 if authentication fails", async () => {
      authenticateUser.mockImplementationOnce((req, res) =>
        res.status(401).json({ error: "Invalid token" })
      );

      const response = await request(app)
        .post("/csv")
        .set("Authorization", "Bearer invalid-token")
        .send([
          { temperature: 22, user_id: "user-123" },
          { temperature: 25, user_id: "user-123" },
        ]);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: "Invalid token" });
      expect(authenticateUser).toHaveBeenCalled();
      expect(temperatureController.submitTemperatures).not.toHaveBeenCalled();
    });
  });
});