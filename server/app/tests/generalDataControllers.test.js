const { getBadges } = require("../controllers/generalDataController");
const generalDataService = require("../services/generalDataService");

jest.mock("../services/generalDataService", () => ({
  getBadges: jest.fn(),
}));

describe("generalDataController", () => {
  let mockReq, mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getBadges", () => {
    it("returns badges as JSON on successful fetch", async () => {
      const mockBadges = [
        { id: 1, name: "First Submission" },
        { id: 2, name: "Location Master" },
      ];
      generalDataService.getBadges.mockResolvedValue(mockBadges);

      await getBadges(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockBadges);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(generalDataService.getBadges).toHaveBeenCalled();
    });

    it("returns 500 with error message on failure", async () => {
      const error = new Error("Database error");
      generalDataService.getBadges.mockRejectedValue(error);

      await getBadges(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Database error" });
      expect(generalDataService.getBadges).toHaveBeenCalled();
    });
  });
});