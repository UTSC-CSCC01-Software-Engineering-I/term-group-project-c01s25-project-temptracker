const mapController = require("../controllers/mapController");
const { Router } = require("express");

const mapRouter = Router();

mapRouter.post("/temp", mapController.getTemperatureReading)

module.exports = mapRouter;

