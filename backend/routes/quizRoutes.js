const express = require("express");
const quizCtrl = require("../controllers/quizController");

const router = express.Router();

router.get("/api/quizzes", quizCtrl.getQuizzes);
router.get("/api/quizzes/:id", quizCtrl.getQuizById);

router.post("/api/quizzes", quizCtrl.createQuiz); 
router.put("/api/quizzes/:id/title", quizCtrl.updateQuizTitle);

router.put("/api/quizzes/:id/questions", quizCtrl.replaceQuestions); 
router.post("/api/quizzes/:id/questions", quizCtrl.addOneQuestion);  

router.post("/api/quizzes/:id/publish", quizCtrl.publishQuiz);
router.delete("/api/quizzes/:id", quizCtrl.deleteQuiz);

router.post("/api/quizzes/:id/archive", quizCtrl.archiveQuiz);
router.post("/api/quizzes/:id/unarchive", quizCtrl.unarchiveQuiz);

module.exports = router;
