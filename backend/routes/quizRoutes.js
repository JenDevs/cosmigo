const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

// Lista alla quiz
router.get("/quizzes", quizController.listQuizzes);

// Hämta ett quiz inkl frågor
router.get("/quizzes/:id", quizController.getQuiz);

// Skapa nytt quiz
router.post("/quizzes", quizController.createQuiz);

// Uppdatera quiz-titel
router.put("/quizzes/:id/title", quizController.updateQuizTitle);

// Ersätt alla frågor
router.put("/quizzes/:id/questions", quizController.replaceQuestions);

// Radera quiz
router.delete("/quizzes/:id", quizController.deleteQuiz);

// Arkivera quiz
router.post("/quizzes/:id/archive", quizController.archiveQuiz);

module.exports = router;
