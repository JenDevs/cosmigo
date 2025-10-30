const quizService = require("../services/quizService");

function getUserIdFromParams(req) {
  const n = Number(req.params.userId);
  return Number.isFinite(n) ? n : null;
}

// GET: alla quiz
async function listQuizzes(req, res) {
  try {
    const userId = getUserIdFromParams(req);
    if (!userId) return res.status(400).json({ success:false, error:"Invalid userId" });

    const status = typeof req.query.status === "string" ? req.query.status : null;
    const rows = await quizService.getAllQuizzes(userId, { status });
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, error:"Database error" });
  }
}

// GET: ett quiz + frågor
async function getQuiz(req, res) {
  try {
    const userId = getUserIdFromParams(req);
    if (!userId) return res.status(400).json({ success:false, error:"Invalid userId" });

    const q = await quizService.getQuizById(req.params.id, userId);
    if (q === 0) return res.status(404).json({ success:false, error:"Not found" });
    if (q === 403) return res.status(403).json({ success:false, error:"Not your quiz" });
    res.json(q);
  } catch (e) {
    res.status(500).json({ success:false, error:e.message });
  }
}

// POST: skapa nytt
async function createQuiz(req, res) {
  try {
    const userId = getUserIdFromParams(req);
    if (!userId) return res.status(400).json({ success:false, error:"Invalid userId" });

    const { title, questions } = req.body || {};
    if (!title?.trim()) return res.status(400).json({ success:false, error:"Missing title" });

    const created = await quizService.createQuiz(userId, title.trim());

    if (Array.isArray(questions) && questions.length > 0) {
      const ok = await quizService.replaceQuestions(created.id, userId, questions);
      if (ok !== true) {
        if (ok === 403) return res.status(403).json({ success:false, error:"Forbidden" });
        if (ok === 0)   return res.status(404).json({ success:false, error:"Quiz not found" });
      }
    }
    res.status(201).json({ success:true, id: created.id });
  } catch (e) {
    console.error("createQuiz error:", e);
    res.status(500).json({ success:false, error:"Internal Server Error" });
  }
}

// PUT: titel + frågor
async function updateQuiz(req, res) {
  try {
    const userId = getUserIdFromParams(req);
    if (!userId) return res.status(400).json({ success:false, error:"Invalid userId" });

    const quizId = req.params.id;
    const { title, questions } = req.body || {};
    if (!title?.trim()) return res.status(400).json({ success:false, error:"Missing title" });

    const titleOk = await quizService.updateQuizTitle(quizId, userId, title.trim());
    if (titleOk === 0) return res.status(404).json({ success:false, error:"Not found" });
    if (titleOk === 403) return res.status(403).json({ success:false, error:"Forbidden" });

    if (Array.isArray(questions)) {
      const qOk = await quizService.replaceQuestions(quizId, userId, questions);
      if (qOk !== true) {
        if (qOk === 0) return res.status(404).json({ success:false, error:"Quiz not found" });
        if (qOk === 403) return res.status(403).json({ success:false, error:"Forbidden" });
      }
    }
    res.json({ success:true, id: quizId });
  } catch (e) {
    console.error("updateQuiz error", e);
    res.status(500).json({ success:false, error:e.message });
  }
}

async function updateQuizTitle(req, res) {
  try {
    const userId = getUserIdFromParams(req);
    if (!userId) return res.status(400).json({ success:false, error:"Invalid userId" });

    const title = (req.body.title || "").trim();
    if (!title) return res.status(400).json({ success:false, error:"Missing title" });

    const ok = await quizService.updateQuizTitle(req.params.id, userId, title);
    if (ok === 0) return res.status(404).json({ success:false, error:"Not found" });
    if (ok === 403) return res.status(403).json({ success:false, error:"Forbidden" });
    res.json({ success:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, error:e.message });
  }
}

async function replaceQuestions(req, res) {
  try {
    const userId = getUserIdFromParams(req);
    if (!userId) return res.status(400).json({ success:false, error:"Invalid userId" });

    const { questions } = req.body || {};
    if (!Array.isArray(questions)) return res.status(400).json({ success:false, error:"questions must be an array" });

    const ok = await quizService.replaceQuestions(req.params.id, userId, questions);
    if (ok === 0) return res.status(404).json({ success:false, error:"Not found" });
    if (ok === 403) return res.status(403).json({ success:false, error:"Forbidden" });
    res.json({ success:true });
  } catch (e) {
    res.status(500).json({ success:false, error:e.message });
  }
}

async function deleteQuiz(req, res) {
  try {
    const userId = getUserIdFromParams(req);
    if (!userId) return res.status(400).json({ success:false, error:"Invalid userId" });

    const ok = await quizService.deleteQuiz(req.params.id, userId);
    if (ok === 0) return res.status(404).json({ success:false, error:"Not found" });
    if (ok === 403) return res.status(403).json({ success:false, error:"Forbidden" });
    res.json({ success:true });
  } catch (e) {
    res.status(500).json({ success:false, error:e.message });
  }
}

async function archiveQuiz(req, res) {
  try {
    const userId = getUserIdFromParams(req);
    if (!userId) return res.status(400).json({ success:false, error:"Invalid userId" });

    const ok = await quizService.archiveQuiz(req.params.id, userId);
    if (ok === 0) return res.status(404).json({ success:false, error:"Not found" });
    if (ok === 403) return res.status(403).json({ success:false, error:"Forbidden" });
    res.json({ success:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success:false, error:e.message });
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
