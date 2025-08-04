const userService = require('../services/userService');
const supabase = require('../models/supabaseClient');
const badgeAwardService = require('../services/badgeAwardService');

// Mock the supabase and badgeAwardService modules
jest.mock('../models/supabaseClient', () => {
  const mockSupabase = {
    from: jest.fn(),
    auth: {
      admin: {
        listUsers: jest.fn(),
        deleteUser: jest.fn(),
      },
    },
    storage: {
      from: jest.fn(),
    },
  };
  return mockSupabase;
});
jest.mock('../services/badgeAwardService');

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = { users: [{ id: '1', email: 'test@example.com' }] };
      supabase.auth.admin.listUsers.mockResolvedValue({ data: mockUsers, error: null });

      const result = await userService.getAllUsers();
      expect(result).toEqual(mockUsers);
      expect(supabase.auth.admin.listUsers).toHaveBeenCalled();
    });

    it('should throw an error if listUsers fails', async () => {
      supabase.auth.admin.listUsers.mockResolvedValue({ data: null, error: { message: 'DB error' } });

      await expect(userService.getAllUsers()).rejects.toThrow('DB error');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user successfully', async () => {
      supabase.auth.admin.deleteUser.mockResolvedValue({ error: null });

      await userService.deleteUser('user1');
      expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith('user1');
    });

    it('should throw an error if deleteUser fails', async () => {
      supabase.auth.admin.deleteUser.mockResolvedValue({ error: { message: 'Delete error' } });

      await expect(userService.deleteUser('user1')).rejects.toThrow('Delete error');
    });
  });

  describe('getAllEmailUsers', () => {
    it('should return users with community updates enabled', async () => {
      const mockData = [{ email: 'test@example.com' }];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      });

      const result = await userService.getAllEmailUsers();
      expect(result).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should throw an error if query fails', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });

      await expect(userService.getAllEmailUsers()).rejects.toThrow('DB error');
    });
  });

  describe('getUserSubmissions', () => {
    it('should return user submissions', async () => {
      const mockSubmissions = [{ id: 1, user_id: 'user1' }];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockSubmissions }),
      });

      const result = await userService.getUserSubmissions('user1');
      expect(result).toEqual(mockSubmissions);
      expect(supabase.from).toHaveBeenCalledWith('temperatures');
    });

    it('should return empty array if no submissions', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null }),
      });

      const result = await userService.getUserSubmissions('user1');
      expect(result).toEqual([]);
    });

    it('should throw an error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(userService.getUserSubmissions('user1')).rejects.toThrow('Database error');
    });
  });

  describe('getUserStats', () => {
    it('should return user stats with profile', async () => {
      const mockStats = {
        curr_streak: 5,
        max_streak: 10,
        upload_count: 20,
        likes_count: 100,
        user_profile: { username: 'testuser' },
      };
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockStats }),
      });

      const result = await userService.getUserStats('user1');
      expect(result).toEqual(mockStats);
      expect(supabase.from).toHaveBeenCalledWith('stats');
    });

    it('should throw an error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(userService.getUserStats('user1')).rejects.toThrow('Database error');
    });
  });

  describe('updateUserStreak', () => {
    it('should update streak for new day', async () => {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { curr_streak: 5, max_streak: 5, last_date: yesterday },
        }),
        update: jest.fn().mockReturnThis(),
      });

      await userService.updateUserStreak('user1');
      expect(supabase.from().update).toHaveBeenCalledWith({
        curr_streak: 6,
        max_streak: 6,
        last_date: today,
      });
    });

    it('should not update if same day', async () => {
      const today = new Date().toISOString().split('T')[0];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { curr_streak: 5, max_streak: 5, last_date: today },
        }),
        update: jest.fn().mockReturnThis(),
      });

      await userService.updateUserStreak('user1');
      expect(supabase.from().update).not.toHaveBeenCalled();
    });

    it('should throw an error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(userService.updateUserStreak('user1')).rejects.toThrow('Database error');
    });
  });

  describe('updateUserSubmission', () => {
    it('should update user submission count', async () => {
      const mockSubmissions = [{ id: 1 }, { id: 2 }];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockSubmissions }),
        update: jest.fn().mockReturnThis(),
      });

      await userService.updateUserSubmission('user1');
      expect(supabase.from().update).toHaveBeenCalledWith({ upload_count: 2 });
    });

    it('should throw an error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(userService.updateUserSubmission('user1')).rejects.toThrow('Database error');
    });
  });

  describe('updateUserSettings', () => {
    it('should update user settings', async () => {
      const mockSettings = { username: 'newuser' };
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockSettings }),
      });

      const result = await userService.updateUserSettings('user1', mockSettings);
      expect(result).toEqual(mockSettings);
      expect(supabase.from).toHaveBeenCalledWith('user_profiles');
    });

    it('should throw an error on database error', async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(userService.updateUserSettings('user1', {})).rejects.toThrow('Database error');
    });
  });

  describe('getUserBadges', () => {
    it('should return formatted user badges', async () => {
      const mockBadges = [
        { earned_on: '2023-01-01', badges: { id: 1, name: 'Test Badge' } },
      ];
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockBadges }),
      });

      const result = await userService.getUserBadges('user1');
      expect(result).toEqual([{ earned_on: '2023-01-01', badge: { id: 1, name: 'Test Badge' } }]);
    });

    it('should return empty array if no badges', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null }),
      });

      const result = await userService.getUserBadges('user1');
      expect(result).toEqual([]);
    });

    it('should throw an error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(userService.getUserBadges('user1')).rejects.toThrow('Database error');
    });
  });

  describe('awardUserBadges', () => {
    it('should throw an error if badge fetch fails', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'Badge error' } }),
      });

      await expect(userService.awardUserBadges('user1')).rejects.toThrow('Badge award error');
    });
  });

  describe('getPublicUsers', () => {
    it('should return public users with auth data', async () => {
      const mockProfiles = [{ id: 'user1', username: 'testuser', is_public: true }];
      const mockAuthUsers = { users: [{ id: 'user1', email_confirmed_at: '2023-01-01' }] };

      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockProfiles, error: null }),
      });
      supabase.auth.admin.listUsers.mockResolvedValue({ data: mockAuthUsers, error: null });

      const result = await userService.getPublicUsers();
      expect(result).toEqual([
        { ...mockProfiles[0], email_confirmed_at: '2023-01-01', created_at: undefined },
      ]);
    });

    it('should throw an error on database error', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      });

      await expect(userService.getPublicUsers()).rejects.toThrow('Database error');
    });
  });

  describe('getUserPublicProfile', () => {
    it('should throw an error if user not found', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      });

      await expect(userService.getUserPublicProfile('testuser')).rejects.toThrow('User not found');
    });

    it('should throw an error if profile is private', async () => {
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { is_public: false }, error: null }),
      });

      await expect(userService.getUserPublicProfile('testuser')).rejects.toThrow('Profile is private');
    });
  });

  describe('uploadProfilePicture', () => {
    it('should upload profile picture and return public URL', async () => {
      const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', originalname: 'test.jpg' };
      const mockPublicUrl = { publicUrl: 'https://example.com/profile.jpg' };

      supabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: { path: 'user1/test.jpg' }, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: mockPublicUrl }),
      });
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({}),
      });

      const result = await userService.uploadProfilePicture('user1', mockFile);
      expect(result).toEqual(mockPublicUrl.publicUrl);
      expect(supabase.storage.from).toHaveBeenCalledWith('profile-pictures');
    });

    it('should remove profile picture if file is null', async () => {
      supabase.from.mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({}),
      });

      const result = await userService.uploadProfilePicture('user1', null);
      expect(result).toBeNull();
      expect(supabase.from().update).toHaveBeenCalledWith({ profile_picture_url: null });
    });

    it('should throw an error on upload failure', async () => {
      const mockFile = { buffer: Buffer.from('test'), mimetype: 'image/jpeg', originalname: 'test.jpg' };
      supabase.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({ data: null, error: new Error('Upload failed') }),
      });

      await expect(userService.uploadProfilePicture('user1', mockFile)).rejects.toThrow('Failed to upload profile picture');
    });
  });
});