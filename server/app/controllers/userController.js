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

async function getUserStats(req, res) {
  const userId = req.params.id;
  try {
    const stats = await userService.getUserStats(userId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUserBadges(req, res) {
  const userId = req.params.id;
  try {
    const badges = await userService.getUserBadges(userId);
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function awardUserBadges(req, res) {
  const userId = req.params.id;
  try {
    const badges = await userService.awardUserBadges(userId);
    res.status(200).json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUsers,
  getUserSubmissions,
  getUserStats,
  getUserBadges,
  awardUserBadges,
};
