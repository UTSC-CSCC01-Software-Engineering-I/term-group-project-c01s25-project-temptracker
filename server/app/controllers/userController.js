const userService = require("../services/userService");

async function getUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUserSubmissions(req, res) {
  const userId = req.params.id;
  try {
    const submissions = await userService.getUserSubmissions(userId);
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUsers,
  getUserSubmissions,
};
