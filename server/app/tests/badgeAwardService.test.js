const {
  awardStatsRelatedBadges,
  awardSubmissionSpecificBadges,
  awardSpecialBadges,
  getGreatLakesVisited,
} = require('../services/badgeAwardService');
const supabase = require('../models/supabaseClient');

// Debug import
console.log('Imported badgeAwardService:', require('../services/badgeAwardService'));

// Mock Supabase client
jest.mock('../models/supabaseClient', () => ({
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  auth: {
    admin: {
      getUserById: jest.fn(),
    },
  },
}));

describe('Badge Award Service', () => {
  let awardedBadges;

  beforeEach(() => {
    awardedBadges = [];
    jest.clearAllMocks();
  });

  describe('awardStatsRelatedBadges', () => {
    const userId = 'user-123';
    const badge = {
      id: 1,
      requirement_metric: 'submission',
      requirement_amount: 10,
      name: 'Submission Master',
    };

    test('should award badge when user meets submission requirement', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({
        data: { user_id: userId, upload_count: 15, curr_streak: 5, likes_count: 0 },
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: badge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      console.log('Calling awardStatsRelatedBadges for submission');
      await awardStatsRelatedBadges(badge, userId, awardedBadges);
      console.log('awardedBadges after submission test:', awardedBadges);

      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0]).toMatchObject({
        ...badge,
        earned_on: '2025-08-03T00:00:00Z',
      });
      expect(supabase.from).toHaveBeenCalledWith('stats');
      expect(supabase.from).toHaveBeenCalledWith('user_badges');
    });

    test('should not award badge when user does not meet requirement', async () => {
      supabase.from().select().eq().single.mockResolvedValueOnce({
        data: { user_id: userId, upload_count: 5, curr_streak: 5, likes_count: 0 },
      });

      await awardStatsRelatedBadges(badge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(0);
      expect(supabase.from).not.toHaveBeenCalledWith('user_badges');
    });

    test('should award badge for streak requirement', async () => {
      const streakBadge = { ...badge, requirement_metric: 'streak', id: 2 };
      supabase.from().select().eq().single.mockResolvedValueOnce({
        data: { user_id: userId, upload_count: 5, curr_streak: 15, likes_count: 0 },
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: streakBadge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      console.log('Calling awardStatsRelatedBadges for streak');
      await awardStatsRelatedBadges(streakBadge, userId, awardedBadges);
      console.log('awardedBadges after streak test:', awardedBadges);

      expect(awardedBadges).toHaveLength(1);
    });

    test('should award badge for engagement requirement', async () => {
      const engagementBadge = { ...badge, requirement_metric: 'engagement', id: 3 };
      supabase.from().select().eq().single.mockResolvedValueOnce({
        data: { user_id: userId, upload_count: 5, curr_streak: 5, likes_count: 15 },
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: engagementBadge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      console.log('Calling awardStatsRelatedBadges for engagement');
      await awardStatsRelatedBadges(engagementBadge, userId, awardedBadges);
      console.log('awardedBadges after engagement test:', awardedBadges);

      expect(awardedBadges).toHaveLength(1);
    });

    test('should handle errors during stats fetch', async () => {
      const error = new Error('Database error');
      supabase.from().select().eq().single.mockRejectedValueOnce(error);

      await expect(awardStatsRelatedBadges(badge, userId, awardedBadges)).rejects.toThrow('Database error');
      expect(awardedBadges).toHaveLength(0);
      expect(supabase.from).toHaveBeenCalledWith('stats');
    });
  });

  describe('awardSubmissionSpecificBadges', () => {
    const userId = 'user-123';
    const baseBadge = { id: 15, name: 'Verified Contributor', requirement_amount: 1 };

    test('should award Verified Contributor badge', async () => {
      supabase.from().select().eq.mockResolvedValueOnce({
        data: [{ user_id: userId, is_verified: true }],
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: baseBadge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      await awardSubmissionSpecificBadges(baseBadge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0].name).toBe('Verified Contributor');
    });

    test('should award Detail Oriented badge', async () => {
      const detailBadge = { ...baseBadge, id: 10, name: 'Detail Oriented', requirement_amount: 25 };
      supabase.from().select().eq.mockResolvedValueOnce({
        data: Array(25).fill({ user_id: userId, notes: 'Some notes' }),
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: detailBadge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      await awardSubmissionSpecificBadges(detailBadge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0].name).toBe('Detail Oriented');
    });

    test('should award Local Explorer badge', async () => {
      const explorerBadge = { ...baseBadge, id: 6, name: 'Local Explorer', requirement_amount: 5 };
      supabase.from().select().eq.mockResolvedValueOnce({
        data: [
          { user_id: userId, latitude: 40, longitude: -80 },
          { user_id: userId, latitude: 41, longitude: -81 },
          { user_id: userId, latitude: 42, longitude: -82 },
          { user_id: userId, latitude: 43, longitude: -83 },
          { user_id: userId, latitude: 44, longitude: -84 },
        ],
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: explorerBadge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      await awardSubmissionSpecificBadges(explorerBadge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0].name).toBe('Local Explorer');
    });

    test('should award Temperature Hunter badge', async () => {
      const hunterBadge = { ...baseBadge, id: 9, name: 'Temperature Hunter', requirement_amount: 20 };
      supabase.from().select().eq.mockResolvedValueOnce({
        data: [
          { user_id: userId, temperature: 10 },
          { user_id: userId, temperature: 35 },
        ],
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: hunterBadge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      await awardSubmissionSpecificBadges(hunterBadge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0].name).toBe('Temperature Hunter');
    });

    test('should not award badge for unknown badge id', async () => {
      const unknownBadge = { ...baseBadge, id: 999, name: 'Unknown' };
      supabase.from().select().eq.mockResolvedValueOnce({
        data: [{ user_id: userId, is_verified: true }],
      });

      await awardSubmissionSpecificBadges(unknownBadge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(0);
      expect(supabase.from).not.toHaveBeenCalledWith('user_badges');
    });

    test('should handle errors during submission fetch', async () => {
      const error = new Error('Database error');
      supabase.from().select().eq.mockRejectedValueOnce(error);

      await expect(awardSubmissionSpecificBadges(baseBadge, userId, awardedBadges)).rejects.toThrow('Database error');
      expect(awardedBadges).toHaveLength(0);
      expect(supabase.from).toHaveBeenCalledWith('temperatures');
    });
  });

  describe('awardSpecialBadges', () => {
    const userId = 'user-123';
    const veteranBadge = { id: 14, name: 'Veteran', requirement_amount: 365 };

    test('should award Veteran badge when account is old enough', async () => {
      const createdAt = new Date('2024-08-03T00:00:00Z');
      supabase.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user_metadata: { created_at: createdAt.toISOString() } },
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: veteranBadge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      await awardSpecialBadges(veteranBadge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0].name).toBe('Veteran');
    });

    test('should not award Veteran badge when account is too new', async () => {
      const createdAt = new Date('2025-07-01T00:00:00Z');
      supabase.auth.admin.getUserById.mockResolvedValueOnce({
        data: { user_metadata: { created_at: createdAt.toISOString() } },
      });

      await awardSpecialBadges(veteranBadge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(0);
      expect(supabase.from).not.toHaveBeenCalledWith('user_badges');
    });

    test('should award Top 10 badge when user is in top 10', async () => {
      const top10Badge = { id: 12, name: 'Top 10', requirement_amount: 10 };
      supabase.from().select().order().limit.mockResolvedValueOnce({
        data: [{ user_id: userId, upload_count: 100 }],
      });
      supabase.from().insert().select().single.mockResolvedValueOnce({
        data: { user_id: userId, badge_id: top10Badge.id, earned_on: '2025-08-03T00:00:00Z' },
      });

      await awardSpecialBadges(top10Badge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(1);
      expect(awardedBadges[0].name).toBe('Top 10');
    });

    test('should not award badge for unknown special badge id', async () => {
      const unknownBadge = { id: 999, name: 'Unknown' };
      await awardSpecialBadges(unknownBadge, userId, awardedBadges);

      expect(awardedBadges).toHaveLength(0);
      expect(supabase.from).not.toHaveBeenCalledWith('user_badges');
    });

    test('should handle errors during user fetch', async () => {
      const error = new Error('Database error');
      supabase.auth.admin.getUserById.mockRejectedValueOnce(error);

      await expect(awardSpecialBadges(veteranBadge, userId, awardedBadges)).rejects.toThrow('Database error');
      expect(awardedBadges).toHaveLength(0);
      expect(supabase.auth.admin.getUserById).toHaveBeenCalledWith(userId);
    });
  });
});