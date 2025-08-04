const { getBadges, getTopStats } = require('../controllers/generalDataController');
const generalDataService = require('../services/generalDataService');

// Mock the generalDataService module
jest.mock('../services/generalDataService', () => ({
  getBadges: jest.fn(),
  getTopStats: jest.fn(),
}));

// Mock Express response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('generalDataController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBadges', () => {
    it('should return badges when getBadges succeeds', async () => {
      const mockBadges = [
        { id: 1, name: 'Badge 1' },
        { id: 2, name: 'Badge 2' },
      ];
      generalDataService.getBadges.mockResolvedValue(mockBadges);
      const req = {};
      const res = mockResponse();

      await getBadges(req, res);

      expect(generalDataService.getBadges).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockBadges);
    });

    it('should return status 500 with error message when getBadges fails', async () => {
      const mockError = new Error('Database error');
      generalDataService.getBadges.mockRejectedValue(mockError);
      const req = {};
      const res = mockResponse();

      await getBadges(req, res);

      expect(generalDataService.getBadges).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getTopStats', () => {
    it('should return stats for valid stat type', async () => {
      const mockStats = [
        {
          user_id: 'user1',
          curr_streak: 5,
          max_streak: 10,
          upload_count: 20,
          likes_count: 100,
          user_profile: { username: 'testuser1' },
        },
      ];
      generalDataService.getTopStats.mockResolvedValue(mockStats);
      const req = { params: { stat: 'upload_count' } };
      const res = mockResponse();

      await getTopStats(req, res);

      expect(generalDataService.getTopStats).toHaveBeenCalledWith('upload_count');
      expect(res.json).toHaveBeenCalledWith(mockStats);
    });

    it.each(['max_streak', 'upload_count', 'likes_count'])(
      'should return stats for valid stat type %s',
      async (stat) => {
        const mockStats = [
          {
            user_id: 'user1',
            curr_streak: 5,
            max_streak: 10,
            upload_count: 20,
            likes_count: 100,
            user_profile: { username: 'testuser1' },
          },
        ];
        generalDataService.getTopStats.mockResolvedValue(mockStats);
        const req = { params: { stat } };
        const res = mockResponse();

        await getTopStats(req, res);

        expect(generalDataService.getTopStats).toHaveBeenCalledWith(stat);
        expect(res.json).toHaveBeenCalledWith(mockStats);
      }
    );

    it('should return status 400 with error message for invalid stat type', async () => {
      const req = { params: { stat: 'invalid_stat' } };
      const res = mockResponse();

      await getTopStats(req, res);

      expect(generalDataService.getTopStats).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid stat type' });
    });

    it('should return status 500 with error message when getTopStats fails', async () => {
      const mockError = new Error('Database error');
      generalDataService.getTopStats.mockRejectedValue(mockError);
      const req = { params: { stat: 'upload_count' } };
      const res = mockResponse();

      await getTopStats(req, res);

      expect(generalDataService.getTopStats).toHaveBeenCalledWith('upload_count');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
});