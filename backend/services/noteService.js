const connectionMySQL = require("./../connectionMySQL");

function getAllNotes(userId) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Note WHERE userId = ?";
    connectionMySQL.query(sql, [userId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getNoteById(noteId) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM Note WHERE noteId = ?";
    connectionMySQL.query(sql, [noteId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0]);
    });
  });
}

function createNote(userId, noteTitle, noteContent) {
  return new Promise((resolve, reject) => {
    let sql =
      "INSERT INTO Note (userId, noteTitle, noteContent) VALUES (?, ?, ?)";
    let params = [userId, noteTitle, noteContent];
    connectionMySQL.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve({ noteId: result.insertId, userId, noteTitle, noteContent });
    });
  });
}

function updateNote(noteId, noteTitle, noteContent) {
  return new Promise((resolve, reject) => {
    let sql = "UPDATE Note SET noteTitle = ?, noteContent = ? WHERE noteId = ?";
    let params = [noteTitle, noteContent, noteId];
    connectionMySQL.query(sql, params, (err, result) => {
      if (err) reject(err);
      else resolve({ noteId, userId, noteTitle, noteContent });
    });
  });
}

function deleteNote(noteId) {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM Note WHERE noteId = ?";
    connectionMySQL.query(sql, [noteId], (err, result) => {
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
