const noteService = require("./../services/noteService");

exports.getAllNotes = async (req, res) => {
  const { userId } = req.params;
  try {
    const notes = await noteService.getAllNotes(Number(userId));
    if (notes.length === 0)
      return res.status(200).json({ message: "No notes" });
    return res.json(notes);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getNoteById = async (req, res) => {
  const { userId, noteId } = req.params;
  try {
    const note = await noteService.getNoteById(Number(userId), Number(noteId));
    if (!note) return res.status(404).json({ error: "Note not found" });
    return res.json(note);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.createNote = async (req, res) => {
  const { userId } = req.params;
  const { noteTitle, noteContent } = req.body;
  if (!noteTitle || noteTitle.trim().length < 1) {
    return res.status(400).json({ success: false, error: "Title is required" });
  }
  try {
    const newNote = await noteService.createNote(
      Number(userId),
      noteTitle,
      noteContent
    );
    return res.status(201).json({ success: true, data: newNote });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.updateNote = async (req, res) => {
  const { userId, noteId } = req.params;
  const { noteTitle, noteContent } = req.body;

  if (!noteTitle || noteTitle.trim().length < 1) {
    return res.status(400).json({ success: false, error: "Title is required" });
  }

  try {
    const updated = await noteService.updateNote(
      noteId,
      userId,
      noteTitle,
      noteContent
    );
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ success: false, error: "Note not found" });
    }
    console.error("Error updating note:", err);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

exports.deleteNote = async (req, res) => {
  const { userId, noteId } = req.params;
  try {
    await noteService.deleteNote(Number(userId), Number(noteId));
    return res.status(204).end();
  } catch (e) {
    console.error(e);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};
