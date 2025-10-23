const db = require("../connectionMySQL");

// LIST
async function svcListQuizzes(userId) {
  const [rows] = await db.promise().query(
    "SELECT id, title, status, createdAt FROM quizzes WHERE userId=? ORDER BY createdAt DESC",
    [userId]
  );
  return rows;
}

// GET ONE
async function svcGetQuiz(userId, quizId) {
  const [qz] = await db.promise().query(
    "SELECT id, title, status FROM quizzes WHERE id=? AND userId=?",
    [quizId, userId]
  );
  const quiz = qz[0];
  if (!quiz) return null;

  const [qs] = await db.promise().query(
    "SELECT id, text, answer, position FROM questions WHERE quizId=? ORDER BY position ASC, id ASC",
    [quizId]
  );
  return { ...quiz, questions: qs };
}

// CREATE DRAFT
async function svcCreateQuizDraft(userId, title) {
  const [ins] = await db
    .promise()
    .query("INSERT INTO quizzes (userId, title, status) VALUES (?, ?, 'draft')", [
      userId,
      title,
    ]);
  return { id: ins.insertId, title, status: "draft" };
}

// UPDATE TITLE
async function svcUpdateTitle(userId, quizId, title) {
  const [r] = await db
    .promise()
    .query("UPDATE quizzes SET title=? WHERE id=? AND userId=?", [title, quizId, userId]);
  if (r.affectedRows === 0) {
    const [[exists]] = await db.promise().query("SELECT id FROM quizzes WHERE id=?", [quizId]);
    return exists ? 403 : 0; // 403 = finns men inte din
  }
  return true;
}

// REPLACE ALL QUESTIONS (transaction)
async function svcReplaceQuestions(userId, quizId, questions) {
  const conn = await db.promise().getConnection();
  try {
    await conn.beginTransaction();

    const [[owner]] = await conn.query(
      "SELECT id FROM quizzes WHERE id=? AND userId=?",
      [quizId, userId]
    );
    if (!owner) {
      await conn.rollback();
      const [[exists]] = await conn.query("SELECT id FROM quizzes WHERE id=?", [quizId]);
      return exists ? 403 : 0;
    }

    await conn.query("DELETE FROM questions WHERE quizId=?", [quizId]);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await conn.query(
        "INSERT INTO questions (quizId, text, answer, position) VALUES (?, ?, ?, ?)",
        [quizId, q.text.trim(), q.answer ?? null, q.position ?? i]
      );
    }

    await conn.commit();
    return true;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

// ADD ONE QUESTION
async function svcAddOneQuestion(userId, quizId, q) {
  const [[owner]] = await db
    .promise()
    .query("SELECT id FROM quizzes WHERE id=? AND userId=?", [quizId, userId]);
  if (!owner) {
    const [[exists]] = await db.promise().query("SELECT id FROM quizzes WHERE id=?", [quizId]);
    return exists ? 403 : 0;
  }

  // auto-position: max(position) + 1 om ej skickad
  let pos = q.position;
  if (pos == null) {
    const [[row]] = await db
      .promise()
      .query("SELECT COALESCE(MAX(position), -1) AS maxPos FROM questions WHERE quizId=?", [
        quizId,
      ]);
    pos = (row.maxPos ?? -1) + 1;
  }

  const [ins] = await db
    .promise()
    .query("INSERT INTO questions (quizId, text, answer, position) VALUES (?, ?, ?, ?)", [
      quizId,
      q.text.trim(),
      q.answer ?? null,
      pos,
    ]);

  return { id: ins.insertId, quizId, text: q.text.trim(), answer: q.answer ?? null, position: pos };
}

// PUBLISH (kräver minst 1 fråga)
async function svcPublishQuiz(userId, quizId) {
  const [[owner]] = await db
    .promise()
    .query("SELECT id FROM quizzes WHERE id=? AND userId=?", [quizId, userId]);
  if (!owner) {
    const [[exists]] = await db.promise().query("SELECT id FROM quizzes WHERE id=?", [quizId]);
    return exists ? 403 : 0;
  }

  const [[cnt]] = await db
    .promise()
    .query("SELECT COUNT(*) AS c FROM questions WHERE quizId=?", [quizId]);
  if ((cnt?.c ?? 0) < 1) return 409;

  const [u] = await db
    .promise()
    .query("UPDATE quizzes SET status='published' WHERE id=?", [quizId]);
  return u.affectedRows > 0;
}

// DELETE
async function svcDeleteQuiz(userId, quizId) {
  const [r] = await db
    .promise()
    .query("DELETE FROM quizzes WHERE id=? AND userId=?", [quizId, userId]);
  return r.affectedRows > 0;
}

module.exports = {
  svcListQuizzes,
  svcGetQuiz,
  svcCreateQuizDraft,
  svcUpdateTitle,
  svcReplaceQuestions,
  svcAddOneQuestion,
  svcPublishQuiz,
  svcDeleteQuiz,
};
