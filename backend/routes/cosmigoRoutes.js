const express = require("express");
const router = express.Router();
const cosmigoController = require("../controllers/cosmigoController");

router.get("/api/users/:userId/cosmigo", cosmigoController.getProfile);
router.post("/api/users/:userId/cosmigo/unlock", cosmigoController.unlockKey); // { key: "cosmigo_lv_2_smize" }
router.post("/api/users/:userId/cosmigo/equip", cosmigoController.equipKey); // { key: "cosmigo_lv_2_smize" }

module.exports = router;
