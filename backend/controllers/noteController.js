const noteService = require("./../services/noteService");

exports.getNotes = async (req, res) => {
  try {
    const userId = req.query.userId; // Change to req.user.userId when authentication is implemented
    const notes = await noteService.getAllNotes(userId);
    if (notes.length === 0) {
      return res.status(404).json({ error: "No notes found" });
    }
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNoteById = async (req, res) => {
  const noteId = req.params.id;
  try {
    const note = await noteService.getNoteById(noteId);
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createNote = async (req, res) => {
  const { userId, noteTitle, noteContent } = req.body;
  if (!noteTitle || noteTitle.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: "Title is required",
    });
  }
  try {
    const newNote = await noteService.createNote(
      userId,
      noteTitle,
      noteContent
    );
    return res.status(201).json({
      success: true,
      data: newNote,
    });
  } catch (error) {
    console.error("Error creating note:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

exports.updateNote = async (req, res) => {
  const noteId = req.params.id;
  const { noteTitle, noteContent } = req.body;
  if (!noteTitle || noteTitle.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: "Title is required",
    });
  }
  try {
    const updatedNote = await noteService.updateNote(
      noteId,
      noteTitle,
      noteContent
    );
    return res.status(200).json({
      success: true,
      data: updatedNote,
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

exports.deleteNote = async (req, res) => {
  const noteId = req.params.id;
  try {
    await noteService.deleteNote(noteId);
    return res.status(204).json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};
