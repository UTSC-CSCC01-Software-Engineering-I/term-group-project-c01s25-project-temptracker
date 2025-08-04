const supabase = require('../models/supabaseClient');
const { getClosestVerifiedTemps, getAverageClosestTemperature } = require('../services/tempByCoordinatesService');

// Mock supabase
jest.mock('../models/supabaseClient', () => ({
  rpc: jest.fn(),
}));

describe('Temperature By Coordinates Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getClosestVerifiedTemps', () => {
    const mockTemps = [
      { temperature: 20, latitude: 42.0, longitude: -83.0 },
      { temperature: 22, latitude: 42.1, longitude: -83.1 },
    ];

    test('should return temperature records when RPC call succeeds', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: mockTemps, error: null });

      const result = await getClosestVerifiedTemps(42.0, -83.0, 2, '30 days');

      expect(result).toEqual(mockTemps);
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: 42.0,
        user_longitude: -83.0,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });

    test('should return empty array when RPC call returns error', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: null, error: new Error('Supabase error') });

      const result = await getClosestVerifiedTemps(42.0, -83.0, 2, '30 days');

      expect(result).toEqual([]);
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: 42.0,
        user_longitude: -83.0,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });

    test('should return empty array when RPC call returns no data', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await getClosestVerifiedTemps(42.0, -83.0, 2, '30 days');

      expect(result).toEqual([]);
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: 42.0,
        user_longitude: -83.0,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });

    test('should handle invalid latitude/longitude inputs', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await getClosestVerifiedTemps(null, undefined, 2, '30 days');

      expect(result).toEqual([]);
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: null,
        user_longitude: undefined,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });
  });

  describe('getAverageClosestTemperature', () => {
    const mockTemps = [
      { temperature: 20, latitude: 42.0, longitude: -83.0 },
      { temperature: 22, latitude: 42.1, longitude: -83.1 },
    ];

    test('should calculate average temperature from valid records', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: mockTemps, error: null });

      const result = await getAverageClosestTemperature(42.0, -83.0);

      expect(result).toBe(21); // (20 + 22) / 2
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: 42.0,
        user_longitude: -83.0,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });

    test('should return null when no records are returned', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await getAverageClosestTemperature(42.0, -83.0);

      expect(result).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: 42.0,
        user_longitude: -83.0,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });

    test('should return null when all temperatures are null', async () => {
      supabase.rpc.mockResolvedValueOnce({
        data: [
          { temperature: null, latitude: 42.0, longitude: -83.0 },
          { temperature: null, latitude: 42.1, longitude: -83.1 },
        ],
        error: null,
      });

      const result = await getAverageClosestTemperature(42.0, -83.0);

      expect(result).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: 42.0,
        user_longitude: -83.0,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });

    test('should use custom limit and recentInterval', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: mockTemps, error: null });

      const result = await getAverageClosestTemperature(42.0, -83.0, 3, '7 days');

      expect(result).toBe(21); // (20 + 22) / 2
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: 42.0,
        user_longitude: -83.0,
        limit_results: 3,
        recent_interval: '7 days',
      });
    });

    test('should handle invalid latitude/longitude inputs', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: [], error: null });

      const result = await getAverageClosestTemperature(null, undefined);

      expect(result).toBeNull();
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: null,
        user_longitude: undefined,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });

    test('should use default parameters when not provided', async () => {
      supabase.rpc.mockResolvedValueOnce({ data: mockTemps, error: null });

      const result = await getAverageClosestTemperature(42.0, -83.0);

      expect(result).toBe(21); // (20 + 22) / 2
      expect(supabase.rpc).toHaveBeenCalledWith('get_closest_verified_temps', {
        user_latitude: 42.0,
        user_longitude: -83.0,
        limit_results: 2,
        recent_interval: '30 days',
      });
    });
  });
});