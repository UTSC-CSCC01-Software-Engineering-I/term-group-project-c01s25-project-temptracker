const mapVisualsController = require("../controllers/mapVisualsController");
const { Router } = require("express");

const mapVisualsRouter = Router();

mapVisualsRouter.post("/fetch-contours", mapVisualsController.fetchContourData);

module.exports = mapVisualsRouter;