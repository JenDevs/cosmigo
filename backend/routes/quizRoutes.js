const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");

const validateIds = (req, res, next) => {
  const { userId, id } = req.params;
  if (userId && !Number.isInteger(Number(userId))) {
    return res.status(400).json({ error: "Invalid userId" });
  }
  if (id && !Number.isInteger(Number(id))) {
    return res.status(400).json({ error: "Invalid quiz id" });
  }
  next();
};

router.get   ("/users/:userId/quizzes",           validateIds, quizController.listQuizzes);
router.get   ("/users/:userId/quizzes/:id",       validateIds, quizController.getQuiz);
router.post  ("/users/:userId/quizzes",           validateIds, quizController.createQuiz);
router.put   ("/users/:userId/quizzes/:id",       validateIds, quizController.updateQuiz);
router.put   ("/users/:userId/quizzes/:id/title", validateIds, quizController.updateQuizTitle);
router.put   ("/users/:userId/quizzes/:id/questions", validateIds, quizController.replaceQuestions);
router.delete("/users/:userId/quizzes/:id",       validateIds, quizController.deleteQuiz);
router.post  ("/users/:userId/quizzes/:id/archive", validateIds, quizController.archiveQuiz);

module.exports = router;
