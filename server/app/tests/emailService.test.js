const { sendUsersEmail } = require('../services/emailService');
const sgMail = require('@sendgrid/mail');
const { getAllEmailUsers } = require('../services/userService');

// Mock the dependencies
jest.mock('@sendgrid/mail', () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
}));
jest.mock('../services/userService', () => ({
  getAllEmailUsers: jest.fn(),
}));

describe('emailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendUsersEmail', () => {
    it('should send emails to all users and return correct sent/failed counts', async () => {
      const mockUsers = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
      ];
      getAllEmailUsers.mockResolvedValue(mockUsers);
      sgMail.send
        .mockResolvedValueOnce({}) // First email succeeds
        .mockResolvedValueOnce({}); // Second email succeeds

      const result = await sendUsersEmail({
        subject: 'Test Subject',
        text: 'Test email content',
      });

      expect(result).toEqual({ sent: 2, failed: 0 });
      expect(getAllEmailUsers).toHaveBeenCalled();
      expect(sgMail.send).toHaveBeenCalledTimes(2);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'user1@example.com',
        from: process.env.SENDGRID_SENDER,
        subject: 'Test Subject',
        text: 'Test email content',
        html: expect.stringContaining('Test email content'),
      });
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'user2@example.com',
        from: process.env.SENDGRID_SENDER,
        subject: 'Test Subject',
        text: 'Test email content',
        html: expect.stringContaining('Test email content'),
      });
    });

    it('should handle partial failures and return correct sent/failed counts', async () => {
      const mockUsers = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'user3@example.com' },
      ];
      getAllEmailUsers.mockResolvedValue(mockUsers);
      sgMail.send
        .mockResolvedValueOnce({}) // First email succeeds
        .mockRejectedValueOnce(new Error('SendGrid error')) // Second email fails
        .mockResolvedValueOnce({}); // Third email succeeds

      const result = await sendUsersEmail({
        subject: 'Test Subject',
        text: 'Test email content',
      });

      expect(result).toEqual({ sent: 2, failed: 1 });
      expect(getAllEmailUsers).toHaveBeenCalled();
      expect(sgMail.send).toHaveBeenCalledTimes(3);
      expect(sgMail.send).toHaveBeenCalledWith({
        to: 'user1@example.com',
        from: process.env.SENDGRID_SENDER,
        subject: 'Test Subject',
        text: 'Test email content',
        html: expect.stringContaining('Test email content'),
      });
    });

    it('should throw an error if getAllEmailUsers fails', async () => {
      getAllEmailUsers.mockRejectedValue(new Error('DB error'));

      await expect(
        sendUsersEmail({
          subject: 'Test Subject',
          text: 'Test email content',
        })
      ).rejects.toThrow('Failed to send emails to all users');
      expect(getAllEmailUsers).toHaveBeenCalled();
      expect(sgMail.send).not.toHaveBeenCalled();
    });

    it('should throw an error if all email sends fail', async () => {
      const mockUsers = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
      ];
      getAllEmailUsers.mockResolvedValue(mockUsers);
      sgMail.send.mockRejectedValue(new Error('SendGrid error'));

      const result = await sendUsersEmail({
        subject: 'Test Subject',
        text: 'Test email content',
      });

      expect(result).toEqual({ sent: 0, failed: 2 });
      expect(getAllEmailUsers).toHaveBeenCalled();
      expect(sgMail.send).toHaveBeenCalledTimes(2);
    });

    it('should correctly format HTML email content', async () => {
      const mockUsers = [{ email: 'user1@example.com' }];
      getAllEmailUsers.mockResolvedValue(mockUsers);
      sgMail.send.mockResolvedValue({});

      await sendUsersEmail({
        subject: 'Test Subject',
        text: 'Test email content',
      });

      expect(sgMail.send).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('<div class="logo">GLOW - Temp Tracker</div>'),
          html: expect.stringContaining('<h1>Test Subject</h1>'),
          html: expect.stringContaining('<div class="message">Test email content</div>'),
          html: expect.stringContaining('© 2025 TempTracker. All rights reserved.'),
        })
      );
    });
  });
});