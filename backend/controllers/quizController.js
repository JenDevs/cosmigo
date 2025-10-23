const quizService = require("../services/quizService");
const getUserId = (req) => req.query.userId ?? req.body.userId ?? req.user?.userId;

// --- enkel validering  ---
function needTitle(value) {
  const t = typeof value === "string" ? value : value?.title;
  if (typeof t !== "string" || !t.trim()) return "Title is required";
  if (t.length > 200) return "Title too long (max 200)";
  return null;
}
function needQuestion(q) {
  if (!q || typeof q.text !== "string" || !q.text.trim())
    return "Question text needed";
  if (q.answer != null && typeof q.answer !== "string")
    return "Answer must be string or omitted";
  if (q.position != null && !Number.isInteger(q.position))
    return "Position must be integer";
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

// LIST
exports.getQuizzes = async (req, res) => {
  try {
    const userId = getUserId(req);
    const rows = await quizService.getAllQuizzes(userId);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: "No quizzes found" });
    }
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// GET ONE
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await quizService.getQuizById(Number(req.params.id));
    if (!quiz) return res.status(404).json({ success: false, error: "Quiz not found" });
    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// CREATE
exports.createQuiz = async (req, res) => {
  const err = needTitle(req.body?.title ?? req.body);
  if (err) return res.status(400).json({ success: false, error: err });

  try {
    const userId = getUserId(req);
    const title = (req.body.title || "").trim();
    const result = await quizService.createQuiz(userId, title);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// UPDATE TITLE
exports.updateQuizTitle = async (req, res) => {
  const err = needTitle(req.body?.title ?? req.body);
  if (err) return res.status(400).json({ success: false, error: err });

  try {
    const ok = await quizService.updateQuizTitle(Number(req.params.id), req.body.title.trim());
    if (!ok) return res.status(404).json({ success: false, error: "Quiz not found" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating quiz title:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// REPLACE QUESTIONS
exports.replaceQuestions = async (req, res) => {
  const err = needQuestionsArray(req.body);
  if (err) return res.status(400).json({ success: false, error: err });

  try {
    const ok = await quizService.replaceQuestions(Number(req.params.id), req.body.questions);
    if (!ok) return res.status(404).json({ success: false, error: "Quiz not found" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error replacing questions:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// ADD ONE QUESTION
exports.addOneQuestion = async (req, res) => {
  const err = needQuestion(req.body);
  if (err) return res.status(400).json({ success: false, error: err });

  try {
    const result = await quizService.addOneQuestion(Number(req.params.id), req.body);
    if (!result) return res.status(404).json({ success: false, error: "Quiz not found" });
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("Error adding question:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// PUBLISH
exports.publishQuiz = async (req, res) => {
  try {
    const ok = await quizService.publishQuiz(Number(req.params.id));
    if (ok === 409) return res.status(409).json({ success: false, error: "Needs at least 1 question" });
    if (!ok) return res.status(404).json({ success: false, error: "Quiz not found" });
    return res.json({ success: true, status: "published" });
  } catch (error) {
    console.error("Error publishing quiz:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

// DELETE
exports.deleteQuiz = async (req, res) => {
  try {
    const ok = await quizService.deleteQuiz(Number(req.params.id));
    if (!ok) return res.status(404).json({ success: false, error: "Quiz not found" });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
