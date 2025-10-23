const connectionMySQL = require("../connectionMySQL");

// LIST
function getAllQuizzes(userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT id, title, status, createdAt
      FROM quizzes
      WHERE userId=?
      ORDER BY createdAt DESC`;
    connectionMySQL.query(sql, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// GET ONE (inkl. frågor)
function getQuizById(quizId) {
  return new Promise((resolve, reject) => {
    const sqlQuiz = `SELECT id, userId, title, status FROM quizzes WHERE id=?`;
    connectionMySQL.query(sqlQuiz, [quizId], (err, rows) => {
      if (err) return reject(err);
      const quiz = rows?.[0];
      if (!quiz) return resolve(null);

      const sqlQs = `
        SELECT id, text, answer, position
        FROM questions
        WHERE quizId=?
        ORDER BY position ASC, id ASC`;
      connectionMySQL.query(sqlQs, [quizId], (err2, qs) => {
        if (err2) reject(err2);
        else resolve({ ...quiz, questions: qs });
      });
    });
  });
}

// CREATE
function createQuiz(userId, title) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO quizzes (userId, title, status) VALUES (?, ?, 'draft')`;
    connectionMySQL.query(sql, [userId, title], (err, r) => {
      if (err) reject(err);
      else resolve({ id: r.insertId, userId, title, status: "draft" });
    });
  });
}

// UPDATE TITLE
function updateQuizTitle(quizId, title) {
  return new Promise((resolve, reject) => {
    const sql = `UPDATE quizzes SET title=? WHERE id=?`;
    connectionMySQL.query(sql, [title, quizId], (err, r) => {
      if (err) reject(err);
      else resolve(r.affectedRows > 0);
    });
  });
}

// REPLACE ALL QUESTIONS
function replaceQuestions(quizId, questions) {
  return new Promise((resolve, reject) => {
    connectionMySQL.beginTransaction((err) => {
      if (err) return reject(err);

      const delSql = `DELETE FROM questions WHERE quizId=?`;
      connectionMySQL.query(delSql, [quizId], (errDel) => {
        if (errDel) {
          return connectionMySQL.rollback(() => reject(errDel));
        }

        if (!questions || questions.length === 0) {
          return connectionMySQL.commit((errC) =>
            errC ? connectionMySQL.rollback(() => reject(errC)) : resolve(true)
          );
        }

        const insSql =
          `INSERT INTO questions (quizId, text, answer, position) VALUES ?`;
        const values = questions.map((q, i) => [
          quizId,
          (q.text || "").trim(),
          q.answer ?? null,
          Number.isInteger(q.position) ? q.position : i,
        ]);

        connectionMySQL.query(insSql, [values], (errIns) => {
          if (errIns) {
            return connectionMySQL.rollback(() => reject(errIns));
          }
          connectionMySQL.commit((errC) =>
            errC ? connectionMySQL.rollback(() => reject(errC)) : resolve(true)
          );
        });
      });
    });
  });
}

// ADD ONE QUESTION
function addOneQuestion(quizId, q) {
  return new Promise((resolve, reject) => {
    const posSql = `SELECT COALESCE(MAX(position), -1) AS maxPos FROM questions WHERE quizId=?`;
    const text = (q.text || "").trim();
    if (!text) return reject(new Error("Question text needed"));

    const doInsert = (position) => {
      const insSql = `INSERT INTO questions (quizId, text, answer, position) VALUES (?, ?, ?, ?)`;
      connectionMySQL.query(
        insSql,
        [quizId, text, q.answer ?? null, position],
        (err, r) => {
          if (err) reject(err);
          else resolve({
            id: r.insertId,
            quizId,
            text,
            answer: q.answer ?? null,
            position,
          });
        }
      );
    };

    if (q.position == null) {
      connectionMySQL.query(posSql, [quizId], (err, rows) => {
        if (err) return reject(err);
        const nextPos = ((rows?.[0]?.maxPos ?? -1) + 1) | 0;
        doInsert(nextPos);
      });
    } else {
      doInsert(q.position | 0);
    }
  });
}

// PUBLISH (kräver minst 1 fråga)
function publishQuiz(quizId) {
  return new Promise((resolve, reject) => {
    const cntSql = `SELECT COUNT(*) AS c FROM questions WHERE quizId=?`;
    connectionMySQL.query(cntSql, [quizId], (err, rows) => {
      if (err) return reject(err);
      const c = rows?.[0]?.c ?? 0;
      if (c < 1) return resolve(409); 

      const upd = `UPDATE quizzes SET status='published' WHERE id=?`;
      connectionMySQL.query(upd, [quizId], (err2, r) => {
        if (err2) reject(err2);
        else resolve(r.affectedRows > 0);
      });
    });
  });
}

// DELETE
function deleteQuiz(quizId) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM quizzes WHERE id=?`;
    connectionMySQL.query(sql, [quizId], (err, r) => {
      if (err) reject(err);
      else resolve(r.affectedRows > 0);
    });
  });
}

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuizTitle,
  replaceQuestions,
  addOneQuestion,
  publishQuiz,
  deleteQuiz,
};
