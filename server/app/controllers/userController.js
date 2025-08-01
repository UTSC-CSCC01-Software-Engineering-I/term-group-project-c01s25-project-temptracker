const userService = require("../services/userService");

async function getUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  const userId = req.params.id;
  try {
    await userService.deleteUser(userId);
    res.status(204).send();
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

async function updateUserStreak(req, res) {
  const userId = req.params.id;
  try {
    const updatedUser = await userService.updateUserStreak(userId);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateUserSubmission(req, res) {
  const userId = req.params.id;
  try {
    const updatedSubmission = await userService.updateUserSubmission(userId);
    res.json(updatedSubmission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateUserSettings(req, res) {
  const userId = req.params.id;
  const settings = req.body;
  try {
    const updatedSettings = await userService.updateUserSettings(
      userId,
      settings
    );
    res.json(updatedSettings);
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
  deleteUser,
  getUserSubmissions,
  getUserStats,
  updateUserStreak,
  updateUserSubmission,
  updateUserSettings,
  getUserBadges,
  awardUserBadges,
};
