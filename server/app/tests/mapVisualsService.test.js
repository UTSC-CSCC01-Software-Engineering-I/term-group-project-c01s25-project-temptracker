const { fetchContourData } = require('../services/mapVisualsService');
const supabase = require('../models/supabaseClient');

// Mock the supabase module
jest.mock('../models/supabaseClient', () => ({
  from: jest.fn(),
  storage: {
    from: jest.fn(),
  },
}));

describe('mapVisualsService', () => {
  const OriginalDate = Date; // Store the original Date constructor

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console logs to clean up test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Mock Date constructor for EDT (UTC-4)
    jest.spyOn(global, 'Date').mockImplementation((date) => {
      if (date === '2023-08-04') {
        // Simulate EDT: 2023-08-04 in EDT is 2023-08-03T20:00:00Z
        return new OriginalDate('2023-08-03T20:00:00Z');
      }
      return new OriginalDate(date || '2023-08-03T20:00:00Z');
    });
  });

  afterEach(() => {
    // Restore console logs and Date mock
    console.log.mockRestore();
    console.error.mockRestore();
    global.Date.mockRestore();
  });

  describe('fetchContourData', () => {
    const mockUserPoints = [
      { latitude: 42.0, longitude: -80.0, temperature: 20, measured_on: '2023-08-04T12:00:00Z' },
    ];
    const mockGeoJson = { type: 'FeatureCollection', features: [] };
    const mockDate = '2023-08-04';
    const mockToday = '2023-08-04';
    const mockHour = 12;

    it('should fetch data for week timeRange and return structured data', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ data: mockUserPoints, error: null }),
      });
      supabase.storage.from.mockReturnValue({
        download: jest.fn()
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null }),
      });

      const result = await fetchContourData(mockDate, mockToday, mockHour, 'week');

      expect(supabase.from).toHaveBeenCalledWith('temperatures');
      expect(supabase.from().select).toHaveBeenCalledWith('latitude,longitude,temperature,measured_on');
      expect(supabase.from().select().gte).toHaveBeenCalledWith('measured_on', '2023-08-03T04:00:00.000Z');
      expect(supabase.from().select().gte().lt).toHaveBeenCalledWith('measured_on', '2023-08-04T04:00:00.000Z');
      expect(supabase.storage.from).toHaveBeenCalledWith('geojson');
      expect(supabase.storage.from().download).toHaveBeenCalledWith('20230803/loofs_20230803_12.geo.json');
      expect(supabase.storage.from().download).toHaveBeenCalledWith('20230803/leofs_20230803_12.geo.json');
      expect(supabase.storage.from().download).toHaveBeenCalledWith('20230803/lsofs_20230803_12.geo.json');
      expect(supabase.storage.from().download).toHaveBeenCalledWith('20230803/lmhofs_20230803_12.geo.json');
      expect(result).toEqual({
        message: 'Success',
        data: {
          userPoints: mockUserPoints,
          heatMapPoints: [[42.0, -80.0]],
          loofsContours: mockGeoJson,
          leofsContours: mockGeoJson,
          lsofsContours: mockGeoJson,
          lmhofsContours: mockGeoJson,
          tempDate: '2023-08-03T20:00:00.000Z',
        },
      });
    });

    it('should handle empty user points', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ data: [], error: null }),
      });
      supabase.storage.from.mockReturnValue({
        download: jest.fn()
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null }),
      });

      const result = await fetchContourData(mockDate, mockToday, mockHour, 'week');

      expect(result).toEqual({
        message: 'Success',
        data: {
          userPoints: [],
          heatMapPoints: [],
          loofsContours: mockGeoJson,
          leofsContours: mockGeoJson,
          lsofsContours: mockGeoJson,
          lmhofsContours: mockGeoJson,
          tempDate: '2023-08-03T20:00:00.000Z',
        },
      });
    });

    it('should handle Supabase database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
      });
      supabase.storage.from.mockReturnValue({
        download: jest.fn().mockResolvedValue({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null }),
      });

      const result = await fetchContourData(mockDate, mockToday, mockHour, 'week');

      expect(result).toEqual({
        message: 'Fail to fetch contour data',
        data: null,
      });
    });

    it('should handle Supabase storage error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ data: mockUserPoints, error: null }),
      });
      supabase.storage.from.mockReturnValue({
        download: jest.fn()
          .mockResolvedValueOnce({ data: null, error: new Error('Storage error') })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null }),
      });

      const result = await fetchContourData(mockDate, mockToday, mockHour, 'week');

      expect(result).toEqual({
        message: 'Fail to fetch contour data',
        data: null,
      });
    });

    it('should handle invalid JSON in storage data', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockResolvedValue({ data: mockUserPoints, error: null }),
      });
      supabase.storage.from.mockReturnValue({
        download: jest.fn()
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue('invalid JSON') }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null })
          .mockResolvedValueOnce({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) }, error: null }),
      });

      const result = await fetchContourData(mockDate, mockToday, mockHour, 'week');

      expect(result).toEqual({
        message: 'Fail to fetch contour data',
        data: null,
      });
    });
  });
});