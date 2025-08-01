const express = require("express");
const router = express.Router();
const { fetchClosestPOIs } = require("../controllers/poisController");

router.get("/closest", fetchClosestPOIs);

module.exports = router;
