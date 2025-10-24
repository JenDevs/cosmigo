const express = require("express");
const router = express.Router();
const pomodoroController = require("../controllers/pomodoroController");

console.log("Pomodoro routes loaded");


router.get("/", pomodoroController.getAllPomodoros);
router.get("/:id", pomodoroController.getPomodoroById);
router.get("/user/:pomodoroUserId", pomodoroController.getPomodorosByUserId);
router.post("/", pomodoroController.createPomodoro);
router.put("/", pomodoroController.updatePomodoro);
router.delete("/:id", pomodoroController.deletePomodoro);

module.exports = router;

