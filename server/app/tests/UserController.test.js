const userService = require('../services/userService');
const {
  getUsers,
  deleteUser,
  getUserSubmissions,
  getUserStats,
  updateUserStreak,
  updateUserSubmission,
  updateUserSettings,
  getUserBadges,
  awardUserBadges,
  getPublicUsers,
  getUserPublicProfile,
  uploadProfilePicture,
} = require('../controllers/userController');

// Mock userService
jest.mock('../services/userService', () => ({
  getAllUsers: jest.fn(),
  deleteUser: jest.fn(),
  getAllEmailUsers: jest.fn(),
  getUserSubmissions: jest.fn(),
  getUserStats: jest.fn(),
  updateUserStreak: jest.fn(),
  updateUserSubmission: jest.fn(),
  updateUserSettings: jest.fn(),
  getUserBadges: jest.fn(),
  awardUserBadges: jest.fn(),
  getPublicUsers: jest.fn(),
  getUserPublicProfile: jest.fn(),
  uploadProfilePicture: jest.fn(),
}));

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      params: { id: 'user-123', username: 'testuser' },
      body: {},
      file: null,
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe('getUsers', () => {
    test('should return all users with 200 status', async () => {
      const mockUsers = [{ id: 'user-1' }, { id: 'user-2' }];
      userService.getAllUsers.mockResolvedValueOnce(mockUsers);

      await getUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      userService.getAllUsers.mockRejectedValueOnce(new Error('Database error'));

      await getUsers(req, res);

      expect(userService.getAllUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('deleteUser', () => {
    test('should delete user and return 204 status', async () => {
      userService.deleteUser.mockResolvedValueOnce();

      await deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      userService.deleteUser.mockRejectedValueOnce(new Error('Delete error'));

      await deleteUser(req, res);

      expect(userService.deleteUser).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Delete error' });
    });
  });

  describe('getUserSubmissions', () => {
    test('should return user submissions with 200 status', async () => {
      const mockSubmissions = [{ temperature: 20 }, { temperature: 22 }];
      userService.getUserSubmissions.mockResolvedValueOnce(mockSubmissions);

      await getUserSubmissions(req, res);

      expect(userService.getUserSubmissions).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(mockSubmissions);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      userService.getUserSubmissions.mockRejectedValueOnce(new Error('Database error'));

      await getUserSubmissions(req, res);

      expect(userService.getUserSubmissions).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getUserStats', () => {
    test('should return user stats with 200 status', async () => {
      const mockStats = { curr_streak: 5, max_streak: 10 };
      userService.getUserStats.mockResolvedValueOnce(mockStats);

      await getUserStats(req, res);

      expect(userService.getUserStats).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(mockStats);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      userService.getUserStats.mockRejectedValueOnce(new Error('Database error'));

      await getUserStats(req, res);

      expect(userService.getUserStats).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateUserStreak', () => {
    test('should update user streak and return 200 status', async () => {
      userService.updateUserStreak.mockResolvedValueOnce(undefined);

      await updateUserStreak(req, res);

      expect(userService.updateUserStreak).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(undefined);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      userService.updateUserStreak.mockRejectedValueOnce(new Error('Database error'));

      await updateUserStreak(req, res);

      expect(userService.updateUserStreak).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateUserSubmission', () => {
    test('should update user submission and return 200 status', async () => {
      userService.updateUserSubmission.mockResolvedValueOnce(undefined);

      await updateUserSubmission(req, res);

      expect(userService.updateUserSubmission).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(undefined);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      userService.updateUserSubmission.mockRejectedValueOnce(new Error('Database error'));

      await updateUserSubmission(req, res);

      expect(userService.updateUserSubmission).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateUserSettings', () => {
    test('should update user settings and return 200 status', async () => {
      const settings = { username: 'newuser' };
      req.body = settings;
      const mockSettings = { username: 'newuser' };
      userService.updateUserSettings.mockResolvedValueOnce(mockSettings);

      await updateUserSettings(req, res);

      expect(userService.updateUserSettings).toHaveBeenCalledWith('user-123', settings);
      expect(res.json).toHaveBeenCalledWith(mockSettings);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      req.body = { username: 'newuser' };
      userService.updateUserSettings.mockRejectedValueOnce(new Error('Database error'));

      await updateUserSettings(req, res);

      expect(userService.updateUserSettings).toHaveBeenCalledWith('user-123', req.body);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getUserBadges', () => {
    test('should return user badges with 200 status', async () => {
      const mockBadges = [{ id: 1, name: 'Badge 1' }, { id: 2, name: 'Badge 2' }];
      userService.getUserBadges.mockResolvedValueOnce(mockBadges);

      await getUserBadges(req, res);

      expect(userService.getUserBadges).toHaveBeenCalledWith('user-123');
      expect(res.json).toHaveBeenCalledWith(mockBadges);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      userService.getUserBadges.mockRejectedValueOnce(new Error('Database error'));

      await getUserBadges(req, res);

      expect(userService.getUserBadges).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('awardUserBadges', () => {
    test('should award user badges and return 200 status', async () => {
      const mockBadges = [{ id: 1, name: 'Veteran' }];
      userService.awardUserBadges.mockResolvedValueOnce(mockBadges);

      await awardUserBadges(req, res);

      expect(userService.awardUserBadges).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBadges);
    });

    test('should return 500 status on service error', async () => {
      userService.awardUserBadges.mockRejectedValueOnce(new Error('Badge award error'));

      await awardUserBadges(req, res);

      expect(userService.awardUserBadges).toHaveBeenCalledWith('user-123');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Badge award error' });
    });
  });

  describe('getPublicUsers', () => {
    test('should return public users with 200 status', async () => {
      const mockUsers = [{ id: 'user-1', username: 'user1' }, { id: 'user-2', username: 'user2' }];
      userService.getPublicUsers.mockResolvedValueOnce(mockUsers);

      await getPublicUsers(req, res);

      expect(userService.getPublicUsers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockUsers);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      userService.getPublicUsers.mockRejectedValueOnce(new Error('Database error'));

      await getPublicUsers(req, res);

      expect(userService.getPublicUsers).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getUserPublicProfile', () => {
    test('should return public user profile with 200 status', async () => {
      const mockProfile = { id: 'user-123', username: 'testuser', is_public: true };
      userService.getUserPublicProfile.mockResolvedValueOnce(mockProfile);

      await getUserPublicProfile(req, res);

      expect(userService.getUserPublicProfile).toHaveBeenCalledWith('testuser');
      expect(res.json).toHaveBeenCalledWith(mockProfile);
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 404 status if user not found', async () => {
      userService.getUserPublicProfile.mockRejectedValueOnce(new Error('User not found'));

      await getUserPublicProfile(req, res);

      expect(userService.getUserPublicProfile).toHaveBeenCalledWith('testuser');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    test('should return 403 status if profile is private', async () => {
      userService.getUserPublicProfile.mockRejectedValueOnce(new Error('Profile is private'));

      await getUserPublicProfile(req, res);

      expect(userService.getUserPublicProfile).toHaveBeenCalledWith('testuser');
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Profile is private' });
    });

    test('should return 500 status on other service errors', async () => {
      userService.getUserPublicProfile.mockRejectedValueOnce(new Error('Database error'));

      await getUserPublicProfile(req, res);

      expect(userService.getUserPublicProfile).toHaveBeenCalledWith('testuser');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('uploadProfilePicture', () => {
    test('should upload profile picture and return 200 status', async () => {
      const file = { originalname: 'pic.jpg', buffer: Buffer.from(''), mimetype: 'image/jpeg' };
      req.file = file;
      const mockUrl = 'https://example.com/pic.jpg';
      userService.uploadProfilePicture.mockResolvedValueOnce(mockUrl);

      await uploadProfilePicture(req, res);

      expect(userService.uploadProfilePicture).toHaveBeenCalledWith('user-123', file);
      expect(res.json).toHaveBeenCalledWith({ profilePictureUrl: mockUrl });
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should remove profile picture if file is null and return 200 status', async () => {
      req.file = null;
      userService.uploadProfilePicture.mockResolvedValueOnce(null);

      await uploadProfilePicture(req, res);

      expect(userService.uploadProfilePicture).toHaveBeenCalledWith('user-123', null);
      expect(res.json).toHaveBeenCalledWith({ profilePictureUrl: null });
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 500 status on service error', async () => {
      const file = { originalname: 'pic.jpg', buffer: Buffer.from(''), mimetype: 'image/jpeg' };
      req.file = file;
      userService.uploadProfilePicture.mockRejectedValueOnce(new Error('Failed to upload profile picture'));

      await uploadProfilePicture(req, res);

      expect(userService.uploadProfilePicture).toHaveBeenCalledWith('user-123', file);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to upload profile picture' });
    });
  });
});