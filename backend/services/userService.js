const connectionMySQL = require("./../connectionMySQL");

function getAllUsers() {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM User";
    connectionMySQL.query(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function getUserById(userId) {
  return new Promise((resolve, reject) => {
    connectionMySQL.query(
      "SELECT * FROM User WHERE userId = ?",
      [userId],
      (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      }
    );
  });
}

function createUser(userName, userEmail, userLevel, userExperience) {
  return new Promise((resolve, reject) => {
    let sql =
      "INSERT INTO User (userName, userEmail, userLevel, userExperience) VALUES (?, ?, ?, ?)";
    let params = [userName, userEmail, userLevel, userExperience];

    connectionMySQL.query(sql, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function updateUser(userId, userData) {
  return new Promise((resolve, reject) => {
    connectionMySQL.query(
      "UPDATE User SET userName = ?, userEmail = ?, userLevel = ?, userExperience =? WHERE userId = ?",
      [
        userData.userName,
        userData.userEmail,
        userData.userLevel,
        userData.userExperience,
        userId,
      ],
      (err) => {
        if (err) reject(err);
        else resolve({ userId, ...userData });
      }
    );
  });
}

/* function deleteUser(db, userId) {
  return db
    .query("DELETE FROM User WHERE userId = ?", [userId])
    .then(() => ({ userId }));
} */

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  // deleteUser,
};
