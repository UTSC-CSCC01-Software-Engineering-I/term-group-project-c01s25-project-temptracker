const express = require("express");
const { sendEmail } = require("../services/emailService");
const { getAllUsers } = require("../services/userService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: "Missing subject or message" });
    }

    const users = await getAllUsers();
    const userList = users.users || users; // Use users.users if present, else users

    const results = await Promise.allSettled(
      userList.map((user) =>
        sendEmail({
          to: user.email,
          subject,
          text: message,
        })
      )
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - sent;

    res.json({ success: true, sent, failed });
  } catch (err) {
    console.error("Notify-all error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;