const mapController = require("../controllers/mapController");
const { Router } = require("express");

const mapRouter = Router();

mapRouter.post("/temp", mapController.getTemperatureReading)
mapRouter.post("/clicked_lake", mapController.lakeClicked)
mapRouter.post("/chart", mapController.getChartData)
mapRouter.post("/script", mapController.checkWaterBodies)

module.exports = mapRouter;

