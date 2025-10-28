const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

const validateIds = (req, res, next) => {
  const { userId, noteId } = req.params;
  if (userId && !Number.isInteger(Number(userId))) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  if (noteId && !Number.isInteger(Number(noteId))) {
    return res.status(400).json({ error: "Invalid noteId" });
  }
  next();
};

router.get("/api/users/:userId/notes", validateIds, noteController.getAllNotes);
router.get(
  "/api/users/:userId/notes/:noteId",
  validateIds,
  noteController.getNoteById
);
router.post("/api/users/:userId/notes", validateIds, noteController.createNote);
router.put(
  "/api/users/:userId/notes/:noteId",
  validateIds,
  noteController.updateNote
);
router.delete(
  "/api/users/:userId/notes/:noteId",
  validateIds,
  noteController.deleteNote
);

module.exports = router;
