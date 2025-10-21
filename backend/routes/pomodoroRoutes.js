const express = require("express");
const router = express.Router();
const pomodoroController = require("../controllers/pomodoroController");

router.get("/api/pomodoro", pomodoroController.getAllPomodoros);
router.get("/api/pomodoro/:id", pomodoroController.getPomodoroById);
router.get(
  "/api/pomodoro/user/:pomodoroUserId",
  pomodoroController.getPomodorosByUserId
);
router.post("/api/pomodoro/", pomodoroController.createPomodoro);
router.put("/api/pomodoro/", pomodoroController.updatePomodoro);
router.delete("/api/pomodoro/:id", pomodoroController.deletePomodoro);

module.exports = router;
