const emailService = require("../services/emailService");

async function sendEmails(req, res) {
  const { subject, message } = req.body;
  if (!subject || !message) {
    return res.status(400).json({ error: "Missing subject or message" });
  }

  try {
    const result = await emailService.sendUsersEmail({
      subject,
      text: message,
    });
    res.status(200).json({ message: "Emails sent successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  sendEmails,
};
