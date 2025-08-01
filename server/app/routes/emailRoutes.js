const emailController = require("../controllers/emailController");
const { Router } = require("express");
const { authenticateUser } = require("../middleware/authUser");
const { requireAdmin } = require("../middleware/reqAdmin");
const { sendEmail } = require("../services/emailService");
const { getAllUsers } = require("../services/userService");

const emailRouter = Router();

emailRouter.use(authenticateUser);
emailRouter.use(requireAdmin); // Ensure only admins can send emails
emailRouter.post("/", emailController.sendEmails);

module.exports = emailRouter;
