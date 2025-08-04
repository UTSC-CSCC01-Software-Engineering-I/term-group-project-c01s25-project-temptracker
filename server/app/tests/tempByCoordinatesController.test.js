const tempByCoordinatesService = require('../services/tempByCoordinatesService');
const { getClosestVerifiedTemps, getAverageClosestTemperature } = require('../controllers/tempByCoordinatesController');

// Mock tempByCoordinatesService
jest.mock('../services/tempByCoordinatesService', () => ({
  getClosestVerifiedTemps: jest.fn(),
  getAverageClosestTemperature: jest.fn(),
}));

describe('Temperature By Coordinates Controller', () => {
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock res object with status and json methods
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('getClosestVerifiedTemps', () => {
    const mockTemps = [
      { temperature: 20, latitude: 42.0, longitude: -83.0 },
      { temperature: 22, latitude: 42.1, longitude: -83.1 },
    ];

    test('should return temperature records for valid lat and lon', async () => {
      tempByCoordinatesService.getClosestVerifiedTemps.mockResolvedValueOnce(mockTemps);
      const req = { query: { lat: '42.0', lon: '-83.0', limit: '2', interval: '30 days' } };

      await getClosestVerifiedTemps(req, mockRes);

      expect(tempByCoordinatesService.getClosestVerifiedTemps).toHaveBeenCalledWith(42.0, -83.0, 2, '30 days');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockTemps);
    });

    test('should return 400 if lat is missing', async () => {
      const req = { query: { lon: '-83.0' } };

      await getClosestVerifiedTemps(req, mockRes);

      expect(tempByCoordinatesService.getClosestVerifiedTemps).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing lat or lon query parameters' });
    });

    test('should return 400 if lon is missing', async () => {
      const req = { query: { lat: '42.0' } };

      await getClosestVerifiedTemps(req, mockRes);

      expect(tempByCoordinatesService.getClosestVerifiedTemps).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing lat or lon query parameters' });
    });

    test('should handle invalid lat and lon', async () => {
      tempByCoordinatesService.getClosestVerifiedTemps.mockResolvedValueOnce([]);
      const req = { query: { lat: 'invalid', lon: 'invalid', limit: '2', interval: '30 days' } };

      await getClosestVerifiedTemps(req, mockRes);

      expect(tempByCoordinatesService.getClosestVerifiedTemps).toHaveBeenCalledWith(NaN, NaN, 2, '30 days');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    test('should use default limit and interval if not provided', async () => {
      tempByCoordinatesService.getClosestVerifiedTemps.mockResolvedValueOnce(mockTemps);
      const req = { query: { lat: '42.0', lon: '-83.0' } };

      await getClosestVerifiedTemps(req, mockRes);

      expect(tempByCoordinatesService.getClosestVerifiedTemps).toHaveBeenCalledWith(42.0, -83.0, 2, '30 days');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockTemps);
    });

    test('should return 500 if service throws error', async () => {
      tempByCoordinatesService.getClosestVerifiedTemps.mockRejectedValueOnce(new Error('Service error'));
      const req = { query: { lat: '42.0', lon: '-83.0', limit: '2', interval: '30 days' } };

      await getClosestVerifiedTemps(req, mockRes);

      expect(tempByCoordinatesService.getClosestVerifiedTemps).toHaveBeenCalledWith(42.0, -83.0, 2, '30 days');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch closest verified temperatures' });
    });
  });

  describe('getAverageClosestTemperature', () => {
    test('should return average temperature for valid lat and lon', async () => {
      tempByCoordinatesService.getAverageClosestTemperature.mockResolvedValueOnce(21);
      const req = { query: { lat: '42.0', lon: '-83.0', limit: '2', interval: '30 days' } };

      await getAverageClosestTemperature(req, mockRes);

      expect(tempByCoordinatesService.getAverageClosestTemperature).toHaveBeenCalledWith(42.0, -83.0, 2, '30 days');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ average: 21 });
    });

    test('should return 400 if lat is missing', async () => {
      const req = { query: { lon: '-83.0' } };

      await getAverageClosestTemperature(req, mockRes);

      expect(tempByCoordinatesService.getAverageClosestTemperature).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing lat or lon query parameters' });
    });

    test('should return 400 if lon is missing', async () => {
      const req = { query: { lat: '42.0' } };

      await getAverageClosestTemperature(req, mockRes);

      expect(tempByCoordinatesService.getAverageClosestTemperature).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing lat or lon query parameters' });
    });

    test('should handle invalid lat and lon', async () => {
      tempByCoordinatesService.getAverageClosestTemperature.mockResolvedValueOnce(null);
      const req = { query: { lat: 'invalid', lon: 'invalid', limit: '2', interval: '30 days' } };

      await getAverageClosestTemperature(req, mockRes);

      expect(tempByCoordinatesService.getAverageClosestTemperature).toHaveBeenCalledWith(NaN, NaN, 2, '30 days');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ average: null });
    });

    test('should use default limit and interval if not provided', async () => {
      tempByCoordinatesService.getAverageClosestTemperature.mockResolvedValueOnce(21);
      const req = { query: { lat: '42.0', lon: '-83.0' } };

      await getAverageClosestTemperature(req, mockRes);

      expect(tempByCoordinatesService.getAverageClosestTemperature).toHaveBeenCalledWith(42.0, -83.0, 2, '30 days');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ average: 21 });
    });

    test('should return null average if service returns null', async () => {
      tempByCoordinatesService.getAverageClosestTemperature.mockResolvedValueOnce(null);
      const req = { query: { lat: '42.0', lon: '-83.0', limit: '2', interval: '30 days' } };

      await getAverageClosestTemperature(req, mockRes);

      expect(tempByCoordinatesService.getAverageClosestTemperature).toHaveBeenCalledWith(42.0, -83.0, 2, '30 days');
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ average: null });
    });

    test('should return 500 if service throws error', async () => {
      tempByCoordinatesService.getAverageClosestTemperature.mockRejectedValueOnce(new Error('Service error'));
      const req = { query: { lat: '42.0', lon: '-83.0', limit: '2', interval: '30 days' } };

      await getAverageClosestTemperature(req, mockRes);

      expect(tempByCoordinatesService.getAverageClosestTemperature).toHaveBeenCalledWith(42.0, -83.0, 2, '30 days');
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Failed to fetch average temperature' });
    });
  });
});