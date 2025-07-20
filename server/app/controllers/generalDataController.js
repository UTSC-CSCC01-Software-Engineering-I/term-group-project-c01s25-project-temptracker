const generalDataService = require("../services/generalDataService");

async function getBadges(req, res) {
  try {
    const badges = await generalDataService.getBadges();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getBadges,
};
