const mapVisualsService = require("../services/mapVisualsService");

async function fetchContourData(req, res) {
  try {
    const data = req.body;
    const { date, today, currentHour, timeRange } = data
    const result = await mapVisualsService.fetchContourData(date, today, currentHour, timeRange);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


module.exports = {
    fetchContourData
};