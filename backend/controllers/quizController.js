const quizService = require("../services/quizService");

// GET: alla quiz
async function listQuizzes(req, res) {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : null;
    const rows = await quizService.getAllQuizzes(req.user.id, { status });
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
    const { title, questions } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, error: "Missing title" });
    }

    const created = await quizService.createQuiz(req.user.id, title.trim());

    // Spara frågor om de skickades
    if (Array.isArray(questions) && questions.length > 0) {
      const ok = await quizService.replaceQuestions(created.id, req.user.id, questions);
      if (ok !== true) {
        if (ok === 403) return res.status(403).json({ success:false, error:"Forbidden" });
        if (ok === 0)   return res.status(404).json({ success:false, error:"Quiz not found" });
      }
    }

    return res.json({ success: true, id: created.id });
  } catch (e) {
    console.error("createQuiz error:", e);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

// PUT /api/quizzes/:id – uppdatera både titel och frågor
async function updateQuiz(req, res) {
  try {
    const quizId = req.params.id;
    const { title, questions } = req.body;

    if (!title?.trim()) return res.status(400).json({ success: false, error: "Missing title" });

    const titleOk = await quizService.updateQuizTitle(quizId, req.user.id, title.trim());
    if (titleOk === 0) return res.status(404).json({ success: false, error: "Not found" });
    if (titleOk === 403) return res.status(403).json({ success: false, error: "Forbidden" });

    if (Array.isArray(questions)) {
      const qOk = await quizService.replaceQuestions(quizId, req.user.id, questions);
      if (qOk !== true) {
        if (qOk === 0) return res.status(404).json({ success: false, error: "Quiz not found" });
        if (qOk === 403) return res.status(403).json({ success: false, error: "Forbidden" });
      }
    }

    res.json({ success: true, id: quizId });
  } catch (e) {
    console.error("updateQuiz error", e);
    res.status(500).json({ success: false, error: e.message });
  }
}

// PUT: uppdatera titel
async function updateQuizTitle(req, res) {
  try {
    const title = (req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({ success: false, error: "Missing title" });
    }

    const ok = await quizService.updateQuizTitle(req.params.id, req.user.id, title);

    if (ok === 0) return res.status(404).json({ success: false, error: "Not found" });
    if (ok === 403) return res.status(403).json({ success: false, error: "Forbidden" });

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
}

// PUT: ersätt alla frågor
async function replaceQuestions(req, res) {
  try {
    const { questions } = req.body || {};
    if (!Array.isArray(questions)) {
      return res.status(400).json({ success: false, error: "questions must be an array" });
    }

    const ok = await quizService.replaceQuestions(req.params.id, req.user.id, questions);
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
  updateQuiz,
  updateQuizTitle,
  replaceQuestions,
  deleteQuiz,
  archiveQuiz,
};
