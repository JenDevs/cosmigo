const connectionMySQL = require("./../connectionMySQL");

function getAllNotes(userId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Note WHERE userId = ?";
    connectionMySQL.query(sql, [userId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function getNoteById(userId, noteId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Note WHERE userId = ? AND noteId = ?";
    connectionMySQL.query(sql, [userId, noteId], (err, rows) => {
      if (err) return reject(err);
      resolve(rows[0]);
    });
  });
}

function createNote(userId, noteTitle, noteContent) {
  return new Promise((resolve, reject) => {
    const sql =
      "INSERT INTO Note (userId, noteTitle, noteContent) VALUES (?, ?, ?)";
    const params = [userId, noteTitle, noteContent];

    connectionMySQL.query(sql, params, (err, result) => {
      if (err) return reject(err);
      resolve({
        noteId: result.insertId,
        userId,
        noteTitle,
        noteContent,
      });
    });
  });
}

function updateNote(noteId, userId, noteTitle, noteContent) {
  return new Promise((resolve, reject) => {
    const sqlUpdate = `
      UPDATE Note
      SET noteTitle = ?, noteContent = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE noteId = ? AND userId = ?
    `;
    const params = [noteTitle, noteContent, Number(noteId), Number(userId)];

    connectionMySQL.query(sqlUpdate, params, (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0)
        return reject(new Error("Note not found or not authorized"));

      const sqlSelect = `
        SELECT noteId, userId, noteTitle, noteContent, updatedAt
        FROM Note
        WHERE noteId = ? AND userId = ?
      `;
      connectionMySQL.query(
        sqlSelect,
        [Number(noteId), Number(userId)],
        (e2, rows) => {
          if (e2) return reject(e2);
          resolve(rows[0]);
        }
      );
    });
  });
}

function deleteNote(userId, noteId) {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM Note WHERE userId = ? AND noteId = ?";
    connectionMySQL.query(sql, [userId, noteId], (err, result) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
};
