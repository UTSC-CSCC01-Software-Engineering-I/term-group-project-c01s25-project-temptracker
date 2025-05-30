const userService = require("../services/user-service");

async function getUsers(req, res) {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getUsers,
};
