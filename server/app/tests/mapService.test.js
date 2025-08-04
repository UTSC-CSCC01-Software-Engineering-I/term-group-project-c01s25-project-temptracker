const { getTemperatureReading, lakeClicked, getChartData, checkWaterBodies } = require('../services/mapService');
const supabase = require('../models/supabaseClient');
const turf = require('@turf/turf');

// Mock dependencies
jest.mock('../models/supabaseClient', () => ({
  from: jest.fn(),
  storage: {
    from: jest.fn(),
  },
}));
jest.mock('@turf/turf', () => ({
  point: jest.fn(),
  booleanPointInPolygon: jest.fn(),
}));

describe('mapService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemperatureReading', () => {
    const mockGeoJson = {
      features: [
        {
          geometry: { coordinates: [-80.0, 42.0] },
          properties: { temperature: 20 },
        },
      ],
    };
    const date = '20230804';
    const hour = '12';

    it('should return temperature reading for valid coordinates', async () => {
      const coordinates = [42.0, -80.0];
      supabase.storage.from.mockReturnValue({
        download: jest.fn().mockResolvedValue({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) } }),
      });
      const result = await getTemperatureReading(coordinates, date, hour);
      expect(result).toEqual({
        message: 'Temperature reading acquired successfully',
        data: { temp: 20, lat: 42.0, lng: -80.0 },
      });
      expect(supabase.storage.from).toHaveBeenCalledWith('geojson');
      expect(supabase.storage.from().download).toHaveBeenCalledWith(`${date}/loofs_${date}_points_${hour}.geo.json`);
    });

    it('should return unsuccessful if no point within max_distance', async () => {
      const coordinates = [50.0, -100.0]; // Far from mock point
      supabase.storage.from.mockReturnValue({
        download: jest.fn().mockResolvedValue({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) } }),
      });
      const result = await getTemperatureReading(coordinates, date, hour);
      expect(result).toEqual({ message: 'Temperature reading unsuccessful', data: null });
    });

    it('should handle Supabase storage error', async () => {
      const coordinates = [42.0, -80.0];
      supabase.storage.from.mockReturnValue({
        download: jest.fn().mockRejectedValue(new Error('Storage error')),
      });
      const result = await getTemperatureReading(coordinates, date, hour);
      expect(result).toEqual({ message: 'Temperature reading unsuccessful', data: null });
    });
  });

  describe('lakeClicked', () => {
    const coordinates = [42.0, -80.0];
    const date = '20230804';
    const hour = '12';
    const mockGeoJson = {
      features: [{ geometry: { coordinates: [-80.0, 42.0] } }],
    };

    it('should return lake name if point is in contour', async () => {
      supabase.storage.from.mockReturnValue({
        download: jest.fn().mockResolvedValue({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) } }),
      });
      turf.point.mockReturnValue({ type: 'Point', coordinates: [-80.0, 42.0] });
      turf.booleanPointInPolygon.mockReturnValue(true);
      const result = await lakeClicked(coordinates, date, hour);
      expect(result).toEqual({ message: 'Point in known water body', lake: 'loofs' });
      expect(turf.point).toHaveBeenCalledWith([-80.0, 42.0]);
      expect(turf.booleanPointInPolygon).toHaveBeenCalled();
    });

    it('should return no lake if point is not in contour', async () => {
      supabase.storage.from.mockReturnValue({
        download: jest.fn().mockResolvedValue({ data: { text: jest.fn().mockResolvedValue(JSON.stringify(mockGeoJson)) } }),
      });
      turf.point.mockReturnValue({ type: 'Point', coordinates: [-80.0, 42.0] });
      turf.booleanPointInPolygon.mockReturnValue(false);
      const result = await lakeClicked(coordinates, date, hour);
      expect(result).toEqual({ message: 'Point not in a known water body', lake: 'no lake' });
    });

    it('should handle Supabase error', async () => {
      supabase.storage.from.mockReturnValue({
        download: jest.fn().mockRejectedValue(new Error('Storage error')),
      });
      const result = await lakeClicked(coordinates, date, hour);
      expect(result).toEqual({ message: 'Point not in a known water body', lake: 'no lake' });
    });
  });

  describe('getChartData', () => {
    it('should return aggregated temperature data for valid lake', async () => {
      const mockData = [
        { latitude: 42.0, longitude: -80.0, temperature: 20, measured_on: '2023-08-01T12:00:00Z' },
        { latitude: 42.0, longitude: -80.0, temperature: 22, measured_on: '2023-08-02T12:00:00Z' },
      ];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });
      const result = await getChartData('loofs');
      expect(result).toEqual({
        message: 'Successfully retrieved lake time data',
        data: [{ date: '2023-08', temperature: 21 }],
      });
      expect(supabase.from).toHaveBeenCalledWith('temperatures');
    });

    it('should return no data message if no data found', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ data: null, error: null }),
      });
      const result = await getChartData('loofs');
      expect(result).toEqual({ message: 'No retrieved lake time data', data: null });
    });

    it('should return lake not clicked if no lake provided', async () => {
      const result = await getChartData(null);
      expect(result).toEqual({ message: 'Lake not clicked', data: null });
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('should handle Supabase error', async () => {
      const mockError = new Error('Database error');
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockRejectedValue(mockError),
      });
      const result = await getChartData('loofs');
      expect(result).toEqual({ message: 'Database error', data: null });
    });
  });

  describe('checkWaterBodies', () => {
    const mockRecords = [
      { id: 1, latitude: 42.0, longitude: -80.0, water_body: null },
    ];
    const mockGeoJson = {
      features: [{ geometry: { coordinates: [-80.0, 42.0] } }],
    };

    it('should return no records message if no records found', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ data: [], error: null }),
      });
      const result = await checkWaterBodies();
      expect(result).toEqual({ message: 'No Records to process' });
      expect(supabase.from).toHaveBeenCalledWith('temperatures');
    });

    it('should throw error on Supabase select failure', async () => {
      const mockError = new Error('Database error');
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });
      await expect(checkWaterBodies()).rejects.toThrow('Database error');
    });
  });
});