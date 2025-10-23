const quizService = require("../services/quizService");

// GET: alla quiz
async function listQuizzes(req, res) {
  try {
    const rows = await quizService.getAllQuizzes(req.user.id);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: "Database error" });
  }
}

// GET: ett quiz + frågor
async function getQuiz(req, res) {
  try {
    const q = await quizService.getQuizById(req.params.id, req.user.id);
    if (q === 0) return res.status(404).json({ success: false, error: "Not found" });
    if (q === 403) return res.status(403).json({ success: false, error: "Not your quiz" });
    res.json(q);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

// POST: skapa nytt
async function createQuiz(req, res) {
  try {
    const { title } = req.body;
    const created = await quizService.createQuiz(req.user.id, title);
    res.json(created);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

// PUT: uppdatera titel
async function updateQuizTitle(req, res) {
  try {
    const ok = await quizService.updateQuizTitle(req.params.id, req.user.id, req.body.title);
    if (ok === 0) return res.status(404).json({ success: false, error: "Not found" });
    if (ok === 403) return res.status(403).json({ success: false, error: "Forbidden" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

// PUT: ersätt alla frågor
async function replaceQuestions(req, res) {
  try {
    const ok = await quizService.replaceQuestions(req.params.id, req.user.id, req.body.questions);
    if (ok === 0) return res.status(404).json({ success: false, error: "Not found" });
    if (ok === 403) return res.status(403).json({ success: false, error: "Forbidden" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

// DELETE: ta bort quiz
async function deleteQuiz(req, res) {
  try {
    const ok = await quizService.deleteQuiz(req.params.id, req.user.id);
    if (ok === 0) return res.status(404).json({ success: false, error: "Not found" });
    if (ok === 403) return res.status(403).json({ success: false, error: "Forbidden" });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

// POST /api/quizzes/:id/archive
async function archiveQuiz(req, res) {
  try {
    const ok = await quizService.archiveQuiz(req.params.id, req.user.id);
    if (ok === 0) return res.status(404).json({ success: false, error: "Not found" });
    if (ok === 403) return res.status(403).json({ success: false, error: "Forbidden" });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
}

module.exports = {
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuizTitle,
  replaceQuestions,
  deleteQuiz,
  archiveQuiz, 
};
