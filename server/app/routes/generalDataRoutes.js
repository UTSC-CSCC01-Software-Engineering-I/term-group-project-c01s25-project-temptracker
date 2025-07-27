const generalDataController = require("../controllers/generalDataController");
const { Router } = require("express");

const generalDataRouter = Router();

generalDataRouter.get("/badges", generalDataController.getBadges);
generalDataRouter.get("/top-user-stats/:stat", generalDataController.getTopStats);

module.exports = generalDataRouter;
