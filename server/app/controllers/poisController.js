const { getClosestPOIs } = require("../services/poisService");

async function fetchClosestPOIs(req, res) {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon query param" });
  }

  try {
    const pois = await getClosestPOIs(parseFloat(lat), parseFloat(lon));
    res.json(pois);
  } catch (err) {
    console.error("Error fetching POIs:", err);
    res.status(500).json({ error: "Failed to fetch POIs" });
  }
}

module.exports = { fetchClosestPOIs };
