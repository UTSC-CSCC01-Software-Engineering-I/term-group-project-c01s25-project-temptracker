const temperatureService = require("../services/temperatureService");

async function submitTemperature(req, res) {
  try {
    const data = req.body;
    const result = await temperatureService.submitTemperature(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function submitTemperatures(req, res) {
  try {
    const data = req.body;
    const result = await temperatureService.submitTemperatures(data);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


module.exports = {
  submitTemperature,
  submitTemperatures
};
