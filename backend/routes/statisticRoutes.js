const express = require("express");
const router = express.Router();
const statisticController = require("../controllers/statisticController");

router.get("/api/statistics/:id", statisticController.getUserStats);

module.exports = router;