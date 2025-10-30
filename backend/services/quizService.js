const connectionMySQL = require("../connectionMySQL");

function ensureOwner(quizId, userId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT id FROM quizzes WHERE id=? AND userId=?";
    connectionMySQL.query(sql, [quizId, userId], (err, rows) => {
      if (err) return reject(err);
      if (rows.length === 1) return resolve(true);

      const sql2 = "SELECT id FROM quizzes WHERE id=?";
      connectionMySQL.query(sql2, [quizId], (err2, rows2) => {
        if (err2) return reject(err2);
        if (rows2.length === 1) return resolve(403);
        return resolve(0);
      });
    });
  });
}

// LIST 
function getAllQuizzes(userId, { status = null } = {}) {
  return new Promise((resolve, reject) => {
     let sql = `
      SELECT id, title, status, createdAt
      FROM quizzes
      WHERE userId=?`;
    const params = [userId];

    if (status) {
      sql += ` AND status=?`;
      params.push(status);
    }

    sql += ` ORDER BY createdAt DESC`;

    connectionMySQL.query(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// GET ONE (inkl. frågor)
function getQuizById(quizId, userId) {
  return new Promise((resolve, reject) => {
    const sqlQuiz = `SELECT id, userId, title, status FROM quizzes WHERE id=?`;
    connectionMySQL.query(sqlQuiz, [quizId], (err, rows) => {
      if (err) return reject(err);
      const quiz = rows?.[0];
      if (!quiz) return resolve(0);            
      if (quiz.userId !== userId) return resolve(403); 

      const sqlQs = `
        SELECT id, text, answer, position
        FROM questions
        WHERE quizId=?
        ORDER BY position ASC, id ASC`;
      connectionMySQL.query(sqlQs, [quizId], (err2, qs) => {
        if (err2) return reject(err2);
        delete quiz.userId;
        resolve({ ...quiz, questions: qs });
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
function updateQuizTitle(quizId, userId, title) {
  return new Promise(async (resolve, reject) => {
    try {
      const own = await ensureOwner(quizId, userId);
      if (own !== true) return resolve(own); // 403/0
      const sql = `UPDATE quizzes SET title=? WHERE id=? AND userId=?`;
      connectionMySQL.query(sql, [title, quizId, userId], (err, r) => {
        if (err) reject(err);
        else resolve(r.affectedRows > 0);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// UPDATE STATUS
function updateStatus(quizId, userId, status) {
  return new Promise(async (resolve, reject) => {
    try {
      const own = await ensureOwner(quizId, userId);
      if (own !== true) return resolve(own);
      const sql = `UPDATE quizzes SET status=? WHERE id=? AND userId=?`;
      connectionMySQL.query(sql, [status, quizId, userId], (err, r) => {
        if (err) reject(err);
        else resolve(r.affectedRows > 0);
      });
    } catch (e) { reject(e); }
  });
}

// REPLACE ALL QUESTIONS 
function replaceQuestions(quizId, userId, questions) {
  return new Promise(async (resolve, reject) => {
    try {
      const own = await ensureOwner(quizId, userId);
      if (own !== true) return resolve(own);

      connectionMySQL.beginTransaction((err) => {
        if (err) return reject(err);

        const delSql = `DELETE FROM questions WHERE quizId=?`;
        connectionMySQL.query(delSql, [quizId], (errDel) => {
          if (errDel) return connectionMySQL.rollback(() => reject(errDel));

          if (!questions || questions.length === 0) {
            return connectionMySQL.commit((errC) =>
              errC ? connectionMySQL.rollback(() => reject(errC)) : resolve(true)
            );
          }

          const insSql = `INSERT INTO questions (quizId, text, answer, position) VALUES ?`;
          const values = questions.map((q, i) => [
            quizId,
            (q.text || "").trim(),
            q.answer ?? null,
            Number.isInteger(q.position) ? q.position : i,
          ]);

          connectionMySQL.query(insSql, [values], (errIns) => {
            if (errIns) return connectionMySQL.rollback(() => reject(errIns));
            connectionMySQL.commit((errC) =>
              errC ? connectionMySQL.rollback(() => reject(errC)) : resolve(true)
            );
          });
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}

// ADD ONE QUESTION 
function addOneQuestion(quizId, userId, q) {
  return new Promise(async (resolve, reject) => {
    try {
      const own = await ensureOwner(quizId, userId);
      if (own !== true) return resolve(own);

      const text = (q.text || "").trim();
      if (!text) return reject(new Error("Question text needed"));

      const doInsert = (position) => {
        const insSql = `INSERT INTO questions (quizId, text, answer, position) VALUES (?, ?, ?, ?)`;
        connectionMySQL.query(
          insSql,
          [quizId, text, (q.answer || "").trim() || null, position],
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
        const posSql = `SELECT COALESCE(MAX(position), -1) AS maxPos FROM questions WHERE quizId=?`;
        connectionMySQL.query(posSql, [quizId], (err, rows) => {
          if (err) return reject(err);
          const nextPos = ((rows?.[0]?.maxPos ?? -1) + 1) | 0;
          doInsert(nextPos);
        });
      } else {
        doInsert(q.position | 0);
      }
    } catch (e) {
      reject(e);
    }
  });
}

// PUBLISH (user + minst 1 fråga)
function publishQuiz(quizId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const own = await ensureOwner(quizId, userId);
      if (own !== true) return resolve(own);

      const cntSql = `SELECT COUNT(*) AS c FROM questions WHERE quizId=?`;
      connectionMySQL.query(cntSql, [quizId], (err, rows) => {
        if (err) return reject(err);
        const c = rows?.[0]?.c ?? 0;
        if (c < 1) return resolve(409);

        const upd = `UPDATE quizzes SET status='published' WHERE id=? AND userId=?`;
        connectionMySQL.query(upd, [quizId, userId], (err2, r) => {
          if (err2) reject(err2);
          else resolve(r.affectedRows > 0);
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}

// DELETE 
function deleteQuiz(quizId, userId) {
  return new Promise(async (resolve, reject) => {
    try {
      const own = await ensureOwner(quizId, userId);
      if (own !== true) return resolve(own);
      const sql = `DELETE FROM quizzes WHERE id=? AND userId=?`;
      connectionMySQL.query(sql, [quizId, userId], (err, r) => {
        if (err) reject(err);
        else resolve(r.affectedRows > 0);
      });
    } catch (e) {
      reject(e);
    }
  });
}

// ARCHIVE QUIZ
function archiveQuiz(quizId, userId) { 
  return new Promise(async (resolve, reject) => {
    try {
      const own = await ensureOwner(quizId, userId);
      if (own !== true) return resolve(own); 

      const sql = `UPDATE quizzes SET status='archived' WHERE id=? AND userId=?`;
      connectionMySQL.query(sql, [quizId, userId], (err, r) => {
        if (err) return reject(err);
        resolve(r.affectedRows > 0);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = {
  getAllQuizzes,
  getQuizById,
  createQuiz,
  updateQuizTitle,
  updateStatus,
  replaceQuestions,
  addOneQuestion,
  publishQuiz,
  deleteQuiz,
  archiveQuiz,
};
