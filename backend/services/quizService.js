const db = require("../connectionMySQL");

// LIST
async function getAllQuizzesForUser(userId) {
  const [rows] = await db.promise().query(
    "SELECT id, title, created_at FROM quizzes WHERE user_id=? ORDER BY created_at DESC",
    [userId]
  );
  return rows;
}

// GET ONE
async function getQuizById(userId, quizId) {
  const [qz] = await db.promise().query(
    "SELECT id, title FROM quizzes WHERE id=? AND user_id=?",
    [quizId, userId]
  );
  const quiz = qz[0];
  if (!quiz) return null;

  const [qs] = await db.promise().query(
    "SELECT id, text, answer, position FROM questions WHERE quiz_id=? ORDER BY position",
    [quizId]
  );
  return { ...quiz, questions: qs };
}

// CREATE
async function createQuiz(userId, payload) {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [ins] = await conn.query(
      "INSERT INTO quizzes (user_id, title) VALUES (?, ?)",
      [userId, payload.title]
    );
    const quizId = ins.insertId;

    const qs = payload.questions || [];
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      await conn.query(
        "INSERT INTO questions (quiz_id, text, answer, position) VALUES (?, ?, ?, ?)",
        [quizId, q.text, q.answer ?? null, q.position ?? i]
      );
    }

    await conn.commit();
    return { id: quizId, title: payload.title };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// UPDATE
async function updateQuiz(userId, quizId, payload) {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [[owner]] = await conn.query(
      "SELECT id FROM quizzes WHERE id=? AND user_id=?",
      [quizId, userId]
    );
    if (!owner) {
      await conn.rollback();
      return { status: 403 };
    }

    await conn.query("UPDATE quizzes SET title=? WHERE id=?", [
      payload.title,
      quizId,
    ]);

    await conn.query("DELETE FROM questions WHERE quiz_id=?", [quizId]);

    const qs = payload.questions || [];
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      await conn.query(
        "INSERT INTO questions (quiz_id, text, answer, position) VALUES (?, ?, ?, ?)",
        [quizId, q.text, q.answer ?? null, q.position ?? i]
      );
    }

    await conn.commit();
    return { ok: true };
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// DELETE
async function deleteQuiz(userId, quizId) {
  const [r] = await db
    .promise()
    .query("DELETE FROM quizzes WHERE id=? AND user_id=?", [quizId, userId]);
  return r.affectedRows > 0;
}

module.exports = {
  getAllQuizzesForUser,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
};