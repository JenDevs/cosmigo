const connectionMySQL = require("./../connectionMySQL");

// function getAllUsers() {
// return db.query("SELECT * FROM User").then(([results]) => results);
// }

function getAllUsers() {
  return new Promise((resolve, reject) => {
    let sql = "SELECT * FROM User";
    connectionMySQL.query(sql, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/* function getUserById(db, userId) {
  return db
    .query("SELECT * FROM User WHERE userId = ?", [userId])
    .then(([results]) => results[0]);
} */

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

/* function createUser(db, userData) {
  return db
    .query(
      "INSERT INTO User (userName, userEmail, userLevel, userExperience) VALUES (?, ?, ?, ?)",
      [
        userData.userName,
        userData.userEmail,
        userData.userLevel || 1,
        userData.userExperience || 0,
      ]
    )
    .then(([result]) => ({ userId: result.insertId, ...userData }));
} */

/* function updateUser(db, userId, userData) {
  return db
    .query(
      "UPDATE User SET userName = ?, userEmail = ?, userLevel = ?, userExperience =? WHERE userId = ?",
      [
        userData.userName,
        userData.userEmail,
        userData.userLevel,
        userData.userExperience,
        userId,
      ]
    )
    .then(() => ({ userId, ...userData }));
} */

/* function deleteUser(db, userId) {
  return db
    .query("DELETE FROM User WHERE userId = ?", [userId])
    .then(() => ({ userId }));
} */

module.exports = {
  getAllUsers,
  // getUserById,
  createUser,
  // updateUser,
  // deleteUser,
};
