const connectionMySQL = require("./../connectionMySQL");

function getAllPomodoros() {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM pomodoro";
    connectionMySQL.query(sql, (err, rows) => {
      if (err) {
        console.error("SQL ERROR in getAllPomodoros:", err);
        reject(err);
      } else resolve(rows);
    });
  });
}

function getPomodoroById(id) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM pomodoro WHERE pomodoroId = ?";
    connectionMySQL.query(sql, [id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getPomodorosByUserId(pomodoroUserId) {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM pomodoro WHERE pomodoroUserId = ?";
    connectionMySQL.query(sql, [pomodoroUserId], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function createPomodoro(
  sessionType,
  duration,
  completed,
  startTime,
  endTime,
  pomodoroUserId
) {
  return new Promise((resolve, reject) => {
    let sql =
      "INSERT INTO pomodoro (sessionType, duration, completed, startTime, endTime, pomodoroUserId) VALUES (?, ?, ?, ?, ?, ?)";
    let params = [
      sessionType,
      duration,
      completed,
      startTime,
      endTime,
      pomodoroUserId,
    ];

    connectionMySQL.query(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function updatePomodoro(
  sessionType,
  duration,
  completed,
  startTime,
  endTime,
  pomodoroUserId,
  pomodoroId
) {
  return new Promise((resolve, reject) => {
    let sql =
      "UPDATE pomodoro SET sessionType = ?, duration = ?, completed = ?, startTime = ?, endTime = ?, pomodoroUserId = ? WHERE pomodoroId = ?";
    let params = [
      sessionType,
      duration,
      completed,
      startTime,
      endTime,
      pomodoroUserId,
      pomodoroId,
    ];

    connectionMySQL.query(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function deletePomodoro(id) {
  return new Promise((resolve, reject) => {
    let sql = "DELETE FROM pomodoro WHERE pomodoroId = ?";

    connectionMySQL.query(sql, [id], (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

module.exports = {
  getAllPomodoros,
  getPomodoroById,
  getPomodorosByUserId,
  createPomodoro,
  updatePomodoro,
  deletePomodoro,
};
