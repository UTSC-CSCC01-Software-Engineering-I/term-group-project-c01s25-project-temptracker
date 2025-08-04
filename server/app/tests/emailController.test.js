const { sendEmails } = require('../controllers/emailController');
const { sendUsersEmail } = require('../services/emailService');

// Mock the emailService module
jest.mock('../services/emailService', () => ({
  sendUsersEmail: jest.fn(),
}));

// Mock Express response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('emailController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmails', () => {
    it('should return success message with status 200 when sendUsersEmail succeeds', async () => {
      const mockResult = { sent: 2, failed: 0 };
      sendUsersEmail.mockResolvedValue(mockResult);
      const req = {
        body: {
          subject: 'Test Subject',
          message: 'Test email content',
        },
      };
      const res = mockResponse();

      await sendEmails(req, res);

      expect(sendUsersEmail).toHaveBeenCalledWith({
        subject: 'Test Subject',
        text: 'Test email content',
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Emails sent successfully' });
    });

    it('should return status 400 with error message if subject is missing', async () => {
      const req = {
        body: {
          message: 'Test email content',
        },
      };
      const res = mockResponse();

      await sendEmails(req, res);

      expect(sendUsersEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing subject or message' });
    });

    it('should return status 400 with error message if message is missing', async () => {
      const req = {
        body: {
          subject: 'Test Subject',
        },
      };
      const res = mockResponse();

      await sendEmails(req, res);

      expect(sendUsersEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing subject or message' });
    });

    it('should return status 400 with error message if body is empty', async () => {
      const req = { body: {} };
      const res = mockResponse();

      await sendEmails(req, res);

      expect(sendUsersEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing subject or message' });
    });

    it('should return status 500 with error message when sendUsersEmail fails', async () => {
      const mockError = new Error('Failed to send emails');
      sendUsersEmail.mockRejectedValue(mockError);
      const req = {
        body: {
          subject: 'Test Subject',
          message: 'Test email content',
        },
      };
      const res = mockResponse();

      await sendEmails(req, res);

      expect(sendUsersEmail).toHaveBeenCalledWith({
        subject: 'Test Subject',
        text: 'Test email content',
      });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to send emails' });
    });
  });
});