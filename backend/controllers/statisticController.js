const { countPomodoro, countTodo, countQuiz } = require("../services/statisticService");

exports.getUserStats = async (req, res) => {
  const userId = req.params.id;

  try {
    const [totalPomodoro, completedTodos, completedQuizzes] = await Promise.all([
      countPomodoro(userId),
      countTodo(userId),
      countQuiz(userId)
    ]);

    res.json({ totalPomodoro, completedTodos, completedQuizzes });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
};