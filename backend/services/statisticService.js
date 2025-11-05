const connectionMySQL = require("./../connectionMySQL");

function countPomodoro(userId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT COUNT(*) AS totalPomodoro FROM `pomodoro` WHERE `pomodoroUserId` = ?";
    connectionMySQL.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error("SQL ERROR IN countPomodoro:", err);
        return reject(err);
      }
      resolve(rows[0]?.totalPomodoro ?? 0);
    });
  });
}

function countTodo(userId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT COUNT(*) AS completedTodos FROM `Todo` WHERE `todoIsCompleted` = 1 AND `userId` = ?";
    connectionMySQL.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error("SQL ERROR IN countTodo:", err);
        return reject(err);
      }
      resolve(rows[0]?.completedTodos ?? 0);
    });
  });
}

function countQuiz(userId) {
  return new Promise((resolve, reject) => {
    const sql =
      "SELECT COUNT(*) AS completedQuizzes FROM `quizzes` WHERE `userId` = ? AND `status` IN ('published','archived')";
    connectionMySQL.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error("SQL ERROR IN countQuiz:", err);
        return reject(err);
      }
      resolve(rows[0]?.completedQuizzes ?? 0);
    });
  });
}

module.exports = {
  countPomodoro,
  countTodo,
  countQuiz,
};
