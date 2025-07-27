const generalDataService = require("../services/generalDataService");

async function getBadges(req, res) {
  try {
    const badges = await generalDataService.getBadges();
    res.json(badges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTopStats(req, res) {
  try {
    const stat = req.params.stat;
    if (!["max_streak", "upload_count", "likes_count"].includes(stat)) {
      return res.status(400).json({ error: "Invalid stat type" });
    }

    const topUploads = await generalDataService.getTopStats(stat);
    res.json(topUploads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getBadges,
  getTopStats,
};
