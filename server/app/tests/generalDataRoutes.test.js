const request = require("supertest");
const express = require("express");
const generalDataRouter = require("../routes/generalDataRoutes");
const generalDataController = require("../controllers/generalDataController");

jest.mock("../controllers/generalDataController", () => ({
  getBadges: jest.fn(),
}));

describe("generalDataRoutes", () => {
  let app;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use(generalDataRouter);
  });

  describe("GET /badges", () => {
    it("should call getBadges controller and return 200 with badges on success", async () => {
      const mockBadges = [
        { id: 1, name: "First Submission" },
        { id: 2, name: "Location Master" },
      ];
      generalDataController.getBadges.mockImplementation((req, res) =>
        res.json(mockBadges)
      );

      const response = await request(app).get("/badges");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBadges);
      expect(generalDataController.getBadges).toHaveBeenCalled();
    });

    it("should return 500 with error message when getBadges controller fails", async () => {
      const error = new Error("Database error");
      generalDataController.getBadges.mockImplementation((req, res) =>
        res.status(500).json({ error: error.message })
      );

      const response = await request(app).get("/badges");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Database error" });
      expect(generalDataController.getBadges).toHaveBeenCalled();
    });

    it("should route GET /badges to generalDataController.getBadges", async () => {
      const mockBadges = [{ id: 1, name: "First Submission" }];
      generalDataController.getBadges.mockImplementation((req, res) =>
        res.json(mockBadges)
      );

      await request(app).get("/badges");

      expect(generalDataController.getBadges).toHaveBeenCalled();
    });
  });
});