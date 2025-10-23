const express = require("express");
const {
  listQuizzes,
  getQuiz,
  createQuizDraft,
  updateTitle,
  replaceQuestions,
  addOneQuestion,
  publishQuiz,
  deleteQuizCtrl,
} = require("../controllers/quizController");

const r = express.Router();

// LIST + GET
r.get("/", listQuizzes);              // GET    /api/quizzes
r.get("/:id", getQuiz);               // GET    /api/quizzes/:id

// CREATE (steg A: bara titel -> draft)
r.post("/", createQuizDraft);         // POST   /api/quizzes    { title }

// UPDATE TITLE
r.put("/:id/title", updateTitle);     // PUT    /api/quizzes/:id/title  { title }

// QUESTIONS (steg B)
r.put("/:id/questions", replaceQuestions); // PUT  /api/quizzes/:id/questions  { questions: [...] }
r.post("/:id/questions", addOneQuestion);  // POST /api/quizzes/:id/questions  { text, answer?, position? }

// PUBLISH (steg C – kräver minst 1 fråga)
r.post("/:id/publish", publishQuiz);  // POST   /api/quizzes/:id/publish

// DELETE
r.delete("/:id", deleteQuizCtrl);     // DELETE /api/quizzes/:id

module.exports = r;
