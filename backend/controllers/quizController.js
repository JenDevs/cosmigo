const {
  svcListQuizzes,
  svcGetQuiz,
  svcCreateQuizDraft,
  svcUpdateTitle,
  svcReplaceQuestions,
  svcAddOneQuestion,
  svcPublishQuiz,
  svcDeleteQuiz,
} = require("../services/quizService");

// --- validering ---
function needTitle(body) {
  const t = body?.title;
  if (typeof t !== "string" || !t.trim()) return "Title needed";
  if (t.length > 200) return "Title too long (max 200)";
  return null;
}
function needQuestion(q) {
  if (!q || typeof q.text !== "string" || !q.text.trim()) return "Question text needed";
  if (q.answer != null && typeof q.answer !== "string") return "Answer must be string or omitted";
  if (q.position != null && !Number.isInteger(q.position)) return "Position must be integer";
  return null;
}
function needQuestionsArray(body) {
  if (!body || !Array.isArray(body.questions)) return "questions[] required";
  if (body.questions.length === 0) return "At least 1 question needed";
  for (const q of body.questions) {
    const err = needQuestion(q);
    if (err) return err;
  }
  return null;
}
const getUserId = (req) => req.user?.id || req.user?.userId;

// --- controllers ---
async function listQuizzes(req, res) {
  try {
    const rows = await svcListQuizzes(getUserId(req));
    res.json(rows); // innehåller createdAt/status från service
  } catch (e) {
    console.error("LIST ERROR:", e);
    res.status(500).json({ error: "Could not get list" });
  }
}

async function getQuiz(req, res) {
  try {
    const quiz = await svcGetQuiz(getUserId(req), Number(req.params.id));
    if (!quiz) return res.status(404).json({ error: "Not found" });
    res.json(quiz);
  } catch (e) {
    console.error("GET ERROR:", e);
    res.status(500).json({ error: "Could not get quiz" });
  }
}

async function createQuizDraft(req, res) {
  const err = needTitle(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const result = await svcCreateQuizDraft(getUserId(req), req.body.title.trim());
    res.status(201).json(result); // { id, title, status:'draft' }
  } catch (e) {
    console.error("CREATE ERROR:", e);
    res.status(500).json({ error: "Could not create quiz" });
  }
}

async function updateTitle(req, res) {
  const err = needTitle(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const ok = await svcUpdateTitle(getUserId(req), Number(req.params.id), req.body.title.trim());
    if (ok === 403) return res.status(403).json({ error: "Not user" });
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error("UPDATE TITLE ERROR:", e);
    res.status(500).json({ error: "Could not update title" });
  }
}

async function replaceQuestions(req, res) {
  const err = needQuestionsArray(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const ok = await svcReplaceQuestions(getUserId(req), Number(req.params.id), req.body.questions);
    if (ok === 403) return res.status(403).json({ error: "Not user" });
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error("REPLACE QUESTIONS ERROR:", e);
    res.status(500).json({ error: "Could not save questions" });
  }
}

async function addOneQuestion(req, res) {
  const err = needQuestion(req.body);
  if (err) return res.status(400).json({ error: err });
  try {
    const result = await svcAddOneQuestion(getUserId(req), Number(req.params.id), req.body);
    if (result === 403) return res.status(403).json({ error: "Not user" });
    if (!result) return res.status(404).json({ error: "Not found" });
    res.status(201).json(result);
  } catch (e) {
    console.error("ADD QUESTION ERROR:", e);
    res.status(500).json({ error: "Could not add question" });
  }
}

async function publishQuiz(req, res) {
  try {
    const ok = await svcPublishQuiz(getUserId(req), Number(req.params.id));
    if (ok === 403) return res.status(403).json({ error: "Not user" });
    if (ok === 409) return res.status(409).json({ error: "Needs at least 1 question" });
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true, status: "published" });
  } catch (e) {
    console.error("PUBLISH ERROR:", e);
    res.status(500).json({ error: "Could not publish" });
  }
}

async function deleteQuizCtrl(req, res) {
  try {
    const ok = await svcDeleteQuiz(getUserId(req), Number(req.params.id));
    if (!ok) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    console.error("DELETE ERROR:", e);
    res.status(500).json({ error: "Could not delete" });
  }
}

module.exports = {
  listQuizzes,
  getQuiz,
  createQuizDraft,
  updateTitle,
  replaceQuestions,
  addOneQuestion,
  publishQuiz,
  deleteQuizCtrl,
};