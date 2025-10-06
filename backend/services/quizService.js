function getAllQuizzes(db) {
  return db.query("SELECT * FROM quiz").then((results) => results);
}

function getQuizById(db, quizId) {
  return db
    .query("SELECT * FROM quiz WHERE id = ?", [quizId])
    .then((results) => results[0]);
}

function createQuiz(db, quizData) {
  return db
    .query("INSERT INTO quiz (title, description) VALUES (?, ?)", [
      quizData.title,
      quizData.description,
    ])
    .then((result) => ({ id: result.insertId, ...quizData }));
}

function updateQuiz(db, quizId, quizData) {
  return db
    .query("UPDATE quiz SET title = ?, description = ? WHERE id = ?", [
      quizData.title,
      quizData.description,
      quizId,
    ])
    .then(() => ({ id: quizId, ...quizData }));
}
function deleteQuiz(db, quizId) {
  return db
    .query("DELETE FROM quiz WHERE id = ?", [quizId])
    .then(() => ({ id: quizId }));
}

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};
