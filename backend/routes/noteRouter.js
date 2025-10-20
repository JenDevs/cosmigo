const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");

router.get("/api/notes", noteController.getNotes);
router.get("/api/notes/:id", noteController.getNote);
router.post("/api/notes", noteController.createNote);
router.put("/api/notes/:id", noteController.updateNote);
router.delete("/api/notes/:id", noteController.deleteNote);
module.exports = router;
