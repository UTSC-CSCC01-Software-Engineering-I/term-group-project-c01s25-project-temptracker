const express = require("express");
const router = express.Router();
const controller = require("../controllers/tempByCoordinatesController");

router.get("/closest", controller.getClosestVerifiedTemps);
router.get("/average", controller.getAverageClosestTemperature);

module.exports = router;
