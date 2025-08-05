const { getBadges, getTopStats } = require('../services/generalDataService');
const supabase = require('../models/supabaseClient');

// Mock the supabase client
jest.mock('../models/supabaseClient', () => ({
  from: jest.fn(),
}));

describe('generalDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBadges', () => {
    it('should return all badges when data is available', async () => {
      const mockBadges = [
        { id: 1, name: 'Badge 1' },
        { id: 2, name: 'Badge 2' },
      ];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: mockBadges, error: null }),
      });

      const result = await getBadges();
      expect(result).toEqual(mockBadges);
      expect(supabase.from).toHaveBeenCalledWith('badges');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
    });

    it('should return empty array when no badges are found', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ data: null, error: null }),
      });

      const result = await getBadges();
      expect(result).toEqual([]);
      expect(supabase.from).toHaveBeenCalledWith('badges');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
    });

    it('should throw an error on database failure', async () => {
      const mockError = new Error('DB error');
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockReturnThis(),
        select: jest.fn().mockRejectedValue(mockError),
      });

      await expect(getBadges()).rejects.toThrow('DB error');
      expect(supabase.from).toHaveBeenCalledWith('badges');
      expect(supabase.from().select).toHaveBeenCalledWith('*');
    });
  });

  describe('getTopStats', () => {
    it('should return top stats ordered by specified stat with user profile', async () => {
      const mockStats = [
        {
          user_id: 'user1',
          curr_streak: 5,
          max_streak: 10,
          upload_count: 20,
          likes_count: 100,
          user_profile: { username: 'testuser1' },
        },
        {
          user_id: 'user2',
          curr_streak: 3,
          max_streak: 8,
          upload_count: 15,
          likes_count: 50,
          user_profile: { username: 'testuser2' },
        },
      ];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: mockStats, error: null }),
      });

      const result = await getTopStats('upload_count');
      expect(result).toEqual(mockStats);
      expect(supabase.from).toHaveBeenCalledWith('stats');
      expect(supabase.from().select).toHaveBeenCalledWith(`
      user_id,
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `);
      expect(supabase.from().order).toHaveBeenCalledWith('upload_count', { ascending: false });
      expect(supabase.from().limit).toHaveBeenCalledWith(50);
    });

    it('should throw an error on database failure', async () => {
      const mockError = new Error('DB error');
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      await expect(getTopStats('upload_count')).rejects.toThrow('DB error');
      expect(supabase.from).toHaveBeenCalledWith('stats');
      expect(supabase.from().select).toHaveBeenCalledWith(`
      user_id,
      curr_streak,
      max_streak,
      upload_count,
      likes_count,
      user_profile:user_profiles(username)
    `);
      expect(supabase.from().order).toHaveBeenCalledWith('upload_count', { ascending: false });
      expect(supabase.from().limit).toHaveBeenCalledWith(50);
    });
  });
});