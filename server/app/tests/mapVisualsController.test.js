const mapVisualsController = require('../controllers/mapVisualsController');
const mapVisualsService = require('../services/mapVisualsService');
const supabase = require('../models/supabaseClient');

// Mock the supabase module to align with mapVisualsService.test.js
jest.mock('../models/supabaseClient', () => ({
  from: jest.fn(),
  storage: {
    from: jest.fn(),
  },
}));

// Mock mapVisualsService
jest.mock('../services/mapVisualsService', () => ({
  fetchContourData: jest.fn(),
}));

describe('mapVisualsController', () => {
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

    // Mock Express response object
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    it('should return 201 with structured data for week timeRange', async () => {
      const mockReq = {
        body: {
          date: mockDate,
          today: mockToday,
          currentHour: mockHour,
          timeRange: 'week',
        },
      };
      const mockResult = {
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
      };
      mapVisualsService.fetchContourData.mockResolvedValue(mockResult);

      await mapVisualsController.fetchContourData(mockReq, mockRes);

      expect(mapVisualsService.fetchContourData).toHaveBeenCalledWith(
        mockDate,
        mockToday,
        mockHour,
        'week'
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 201 with structured data for hour timeRange', async () => {
      const mockReq = {
        body: {
          date: mockDate,
          today: mockToday,
          currentHour: mockHour,
          timeRange: 'hour',
        },
      };
      const mockResult = {
        message: 'Success',
        data: {
          userPoints: mockUserPoints,
          heatMapPoints: [[42.0, -80.0]],
          loofsContours: mockGeoJson,
          leofsContours: mockGeoJson,
          lsofsContours: mockGeoJson,
          lmhofsContours: mockGeoJson,
          currentHour: 12,
        },
      };
      mapVisualsService.fetchContourData.mockResolvedValue(mockResult);

      await mapVisualsController.fetchContourData(mockReq, mockRes);

      expect(mapVisualsService.fetchContourData).toHaveBeenCalledWith(
        mockDate,
        mockToday,
        mockHour,
        'hour'
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 201 with failure response when service returns failure', async () => {
      const mockReq = {
        body: {
          date: mockDate,
          today: mockToday,
          currentHour: mockHour,
          timeRange: 'week',
        },
      };
      const mockResult = {
        message: 'Fail to fetch contour data',
        data: null,
      };
      mapVisualsService.fetchContourData.mockResolvedValue(mockResult);

      await mapVisualsController.fetchContourData(mockReq, mockRes);

      expect(mapVisualsService.fetchContourData).toHaveBeenCalledWith(
        mockDate,
        mockToday,
        mockHour,
        'week'
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return 500 when service throws an error', async () => {
      const mockReq = {
        body: {
          date: mockDate,
          today: mockToday,
          currentHour: mockHour,
          timeRange: 'week',
        },
      };
      const errorMessage = 'Service error';
      mapVisualsService.fetchContourData.mockRejectedValue(new Error(errorMessage));

      await mapVisualsController.fetchContourData(mockReq, mockRes);

      expect(mapVisualsService.fetchContourData).toHaveBeenCalledWith(
        mockDate,
        mockToday,
        mockHour,
        'week'
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('should return 500 when req.body is missing required fields', async () => {
      const mockReq = {
        body: {
          // Missing date, today, currentHour, timeRange
        },
      };
      mapVisualsService.fetchContourData.mockRejectedValue(new Error('Invalid input'));

      await mapVisualsController.fetchContourData(mockReq, mockRes);

      expect(mapVisualsService.fetchContourData).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        undefined
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid input' });
    });
  });
});