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

function getNoteById(noteId) {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Note WHERE noteId = ?";
    connectionMySQL.query(sql, [noteId], (err, rows) => {
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
    const sql = `
      UPDATE Note
      SET noteTitle = ?, noteContent = ?
      WHERE noteId = ? AND userId = ?
    `;
    const params = [noteTitle, noteContent, Number(noteId), Number(userId)];

    connectionMySQL.query(sql, params, (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0)
        return reject(new Error("Note not found or not authorized"));
      resolve({
        noteId: Number(noteId),
        userId: Number(userId),
        noteTitle,
        noteContent,
      });
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
