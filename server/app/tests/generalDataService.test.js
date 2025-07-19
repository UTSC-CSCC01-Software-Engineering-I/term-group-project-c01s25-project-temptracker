jest.mock('../models/supabaseClient', () => ({
  from: jest.fn(() => ({
    select: jest.fn(),
  })),
}));

const supabase = require('../models/supabaseClient');
const { getBadges } = require('../services/generalDataService');

describe("getBadges", () => {
  it("should return badge data", async () => {
    const mockBadges = [{ id: 1, name: "Fast Learner" }];
    
    // Mock the chain supabase.from().select()
    supabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: mockBadges }),
    });

    const result = await getBadges();
    expect(result).toEqual(mockBadges);
  });

  it("should return [] if data is null", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockResolvedValue({ data: null }),
    });

    const result = await getBadges();
    expect(result).toEqual([]);
  });

  it("should throw if supabase throws", async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockRejectedValue(new Error("DB error")),
    });

    await expect(getBadges()).rejects.toThrow("DB error");
  });
});
