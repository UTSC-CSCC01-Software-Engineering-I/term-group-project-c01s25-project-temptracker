const temperatureController = require("../controllers/temperatureController");
const { Router } = require("express");
const { authenticateUser } = require("../middleware/authUser");

const temperatureRouter = Router();

temperatureRouter.use(authenticateUser);
temperatureRouter.post("/single", temperatureController.submitTemperature);
temperatureRouter.post("/csv", temperatureController.submitTemperatures);

module.exports = temperatureRouter;
