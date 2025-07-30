const mapService = require("../services/mapService");

async function getTemperatureReading(req, res) {
  try {
    const data = req.body
    const result = await mapService.getTemperatureReading(data.coord, data.date, data.hour)
    res.status(201).json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  getTemperatureReading
};
