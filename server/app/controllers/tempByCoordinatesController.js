const tempByCoordinatesService = require("../services/tempByCoordinatesService");

async function getClosestVerifiedTemps(req, res) {
  const { lat, lon, limit, interval } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon query parameters" });
  }

  try {
    const temps = await tempByCoordinatesService.getClosestVerifiedTemps(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(limit) || 2,
      interval || "30 days"
    );
    res.json(temps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch closest verified temperatures" });
  }
}

async function getAverageClosestTemperature(req, res) {
  const { lat, lon, limit, interval } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat or lon query parameters" });
  }

  try {
    const avgTemp = await tempByCoordinatesService.getAverageClosestTemperature(
      parseFloat(lat),
      parseFloat(lon),
      parseInt(limit) || 2,
      interval || "30 days"
    );
    res.json({ average: avgTemp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch average temperature" });
  }
}

module.exports = {
  getClosestVerifiedTemps,
  getAverageClosestTemperature,
};
