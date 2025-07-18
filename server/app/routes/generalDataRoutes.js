const generalDataController = require("../controllers/generalDataController");
const { Router } = require("express");

const generalDataRouter = Router();

generalDataRouter.get("/badges", generalDataController.getBadges);

module.exports = generalDataRouter;
