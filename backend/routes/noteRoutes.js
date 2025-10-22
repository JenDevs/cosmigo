const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.get("/api/users/:userId/notes", noteController.getAllNotes);
router.get("/api/users/:userId/notes/:noteId", noteController.getNoteById);
router.post("/api/users/:userId/notes", noteController.createNote);
router.put("/api/users/:userId/notes/:noteId", noteController.updateNote);
router.delete("/api/users/:userId/notes/:noteId", noteController.deleteNote);
module.exports = router;
