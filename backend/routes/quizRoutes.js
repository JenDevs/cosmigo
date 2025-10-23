const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

router.get("/",         quizController.listQuizzes);          // GET    /api/quizzes
router.get("/:id",      quizController.getQuiz);              // GET    /api/quizzes/:id
router.post("/",        quizController.createQuiz);           // POST   /api/quizzes
router.put("/:id",      quizController.updateQuiz);           // PUT    /api/quizzes/:id
router.put("/:id/title",    quizController.updateQuizTitle);  // PUT    /api/quizzes/:id/title
router.put("/:id/questions",quizController.replaceQuestions); // PUT    /api/quizzes/:id/questions
router.delete("/:id",   quizController.deleteQuiz);           // DELETE /api/quizzes/:id
router.post("/:id/archive",quizController.archiveQuiz);       // POST   /api/quizzes/:id/archive

module.exports = router;
