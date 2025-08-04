const { fetchClosestPOIs } = require('../controllers/poisController');
const { getClosestPOIs } = require('../services/poisService');

// Mock the poisService module
jest.mock('../services/poisService', () => ({
  getClosestPOIs: jest.fn(),
}));

// Mock Express response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('poisController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error to clean up test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error after each test
    console.error.mockRestore();
  });

  describe('fetchClosestPOIs', () => {
    it('should return POIs with implicit status 200 on success', async () => {
      const mockPOIs = [{ id: 1, name: 'Park', latitude: 42.0, longitude: -80.0, lake: 'loofs', distance: 0.1 }];
      getClosestPOIs.mockResolvedValue(mockPOIs);
      const req = {
        query: {
          lat: '42.0',
          lon: '-80.0',
        },
      };
      const res = mockResponse();

      await fetchClosestPOIs(req, res);

      expect(getClosestPOIs).toHaveBeenCalledWith(42.0, -80.0);
      expect(res.status).not.toHaveBeenCalled(); // Implicit 200
      expect(res.json).toHaveBeenCalledWith(mockPOIs);
    });

    it('should return status 400 if lat is missing', async () => {
      const req = {
        query: {
          lon: '-80.0',
        },
      };
      const res = mockResponse();

      await fetchClosestPOIs(req, res);

      expect(getClosestPOIs).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing lat or lon query param' });
    });

    it('should return status 400 if lon is missing', async () => {
      const req = {
        query: {
          lat: '42.0',
        },
      };
      const res = mockResponse();

      await fetchClosestPOIs(req, res);

      expect(getClosestPOIs).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing lat or lon query param' });
    });

    it('should return status 400 if query is empty', async () => {
      const req = { query: {} };
      const res = mockResponse();

      await fetchClosestPOIs(req, res);

      expect(getClosestPOIs).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing lat or lon query param' });
    });

    it('should return status 500 with error message on failure', async () => {
      const mockError = new Error('Service error');
      getClosestPOIs.mockRejectedValue(mockError);
      const req = {
        query: {
          lat: '42.0',
          lon: '-80.0',
        },
      };
      const res = mockResponse();

      await fetchClosestPOIs(req, res);

      expect(getClosestPOIs).toHaveBeenCalledWith(42.0, -80.0);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch POIs' });
    });
  });
});