const { submitTemperature, submitTemperatures } = require("../controllers/temperatureController");
const temperatureService = require("../services/temperatureService");

jest.mock("../services/temperatureService", () => ({
  submitTemperature: jest.fn(),
  submitTemperatures: jest.fn(),
}));

describe("temperatureController", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("submitTemperature", () => {
    it("returns 201 with result on successful single temperature submission", async () => {
      const mockData = { temperature: 22, user_id: "user-123" };
      const mockResult = { id: 1, ...mockData };
      mockReq.body = mockData;
      temperatureService.submitTemperature.mockResolvedValue(mockResult);

      await submitTemperature(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      expect(temperatureService.submitTemperature).toHaveBeenCalledWith(mockData);
    });

    it("returns 500 with error message on single temperature submission failure", async () => {
      const mockData = { temperature: 22, user_id: "user-123" };
      const error = new Error("Database error");
      mockReq.body = mockData;
      temperatureService.submitTemperature.mockRejectedValue(error);

      await submitTemperature(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
      expect(temperatureService.submitTemperature).toHaveBeenCalledWith(mockData);
    });
  });

  describe("submitTemperatures", () => {
    it("returns 201 with result on successful bulk temperature submission", async () => {
      const mockData = [
        { temperature: 22, user_id: "user-123" },
        { temperature: 25, user_id: "user-123" },
      ];
      const mockResult = [
        { id: 1, temperature: 22, user_id: "user-123" },
        { id: 2, temperature: 25, user_id: "user-123" },
      ];
      mockReq.body = mockData;
      temperatureService.submitTemperatures.mockResolvedValue(mockResult);

      await submitTemperatures(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      expect(temperatureService.submitTemperatures).toHaveBeenCalledWith(mockData);
    });

    it("returns 500 with error message on bulk temperature submission failure", async () => {
      const mockData = [
        { temperature: 22, user_id: "user-123" },
        { temperature: 25, user_id: "user-123" },
      ];
      const error = new Error("Database error");
      mockReq.body = mockData;
      temperatureService.submitTemperatures.mockRejectedValue(error);

      await submitTemperatures(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
      expect(temperatureService.submitTemperatures).toHaveBeenCalledWith(mockData);
    });
  });
});