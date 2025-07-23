jest.spyOn(console, "error").mockImplementation(() => {});

const {
  submitTemperature,
  submitTemperatures,
} = require("../services/temperatureService");

const mockInsert = jest.fn().mockReturnThis();
const mockSelect = jest.fn().mockReturnThis();
const mockSingle = jest.fn().mockResolvedValue({
  data: { id: 1, temperature: 25 },
});

jest.mock("../models/supabaseClient", () => ({
  from: jest.fn(() => ({
    insert: mockInsert,
    select: mockSelect,
    single: mockSingle,
  })),
}));

const supabase = require("../models/supabaseClient");

describe("temperatureService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("submitTemperature", () => {
    it("submits a single temperature in Celsius", async () => {
      const formData = {
        temperature: 22,
        temperatureUnit: "C",
        latitude: 43.123,
        longitude: -79.456,
        date: "2023-07-01",
        time: "14:30",
        notes: "Test note",
        user_id: "user-123",
      };

      const result = await submitTemperature(formData);

      expect(result.message).toBe("Temperature submitted successfully");

      expect(supabase.from).toHaveBeenCalledWith("temperatures");

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 22,
          user_id: "user-123",
          measured_on: expect.any(String),
        })
      );
    });

    it("converts Fahrenheit to Celsius before submission", async () => {
      const formData = {
        temperature: 98.6,
        temperatureUnit: "F",
        latitude: 43.123,
        longitude: -79.456,
        date: "2023-07-01",
        time: "10:00",
        notes: "Hot day",
        user_id: "user-456",
      };

      const result = await submitTemperature(formData);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: expect.closeTo(37, 1),
        })
      );
    });

    it("handles errors during single temperature submission", async () => {
      const formData = {
        temperature: 22,
        temperatureUnit: "C",
        latitude: 43.123,
        longitude: -79.456,
        date: "2023-07-01",
        time: "14:30",
        notes: "Test note",
        user_id: "user-123",
      };

      const error = new Error("Database error");
      mockSingle.mockRejectedValueOnce(error);

      await expect(submitTemperature(formData)).rejects.toThrow("Database error");
      expect(console.error).toHaveBeenCalledWith("submitTemperatures error:", error);
    });
  });

  describe("submitTemperatures", () => {
    it("submits multiple temperatures from CSV", async () => {
      const csvData = {
        userId: "admin-001",
        formData: [
          {
            temperature: 86,
            temperatureUnit: "F",
            latitude: 44.1,
            longitude: -78.9,
            date: "2023-06-01T15:00:00Z",
            notes: "From CSV",
          },
          {
            temperature: 20,
            temperatureUnit: "C",
            latitude: 43.5,
            longitude: -79.0,
            date: "2023-06-02T12:00:00Z",
            notes: "Another row",
          },
        ],
      };

      await submitTemperatures(csvData);

      expect(supabase.from).toHaveBeenCalledWith("temperatures");

      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            temperature: expect.closeTo(30, 1),
            is_verified: true,
            user_id: "admin-001",
          }),
          expect.objectContaining({
            temperature: 20,
            is_verified: true,
            user_id: "admin-001",
          }),
        ])
      );
    });

    it("handles errors during CSV temperature submission", async () => {
      const csvData = {
        userId: "admin-001",
        formData: [
          {
            temperature: 86,
            temperatureUnit: "F",
            latitude: 44.1,
            longitude: -78.9,
            date: "2023-06-01T15:00:00Z",
            notes: "From CSV",
          },
        ],
      };

      const error = new Error("CSV Database error");
      mockInsert.mockRejectedValueOnce(error);

      await expect(submitTemperatures(csvData)).rejects.toThrow("CSV Database error");
      expect(console.error).toHaveBeenCalledWith("submitTemperatures error:", error);
    });
  });
});