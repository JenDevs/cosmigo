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

function calcLevelFromXp(totalXp) {
  if (totalXp < 300) return 1;
  if (totalXp < 1200) return 2;
  if (totalXp < 3000) return 3;
  if (totalXp < 6600) return 4;
  if (totalXp < 13800) return 5;
  if (totalXp < 28200) return 6;
  if (totalXp < 57000) return 7;
  return 8;
}

function addXp(userId, xpGained) {
  return new Promise((resolve, reject) => {
    connectionMySQL.query(
      "UPDATE User SET userExperience = userExperience + ? WHERE userId = ?",
      [xpGained, userId],
      (err, results) => {
        if (err) return reject(err);
        if (results.affectedRows === 0)
          return reject(new Error("User not found"));

        connectionMySQL.query(
          "SELECT userExperience FROM User WHERE userId = ?",
          [userId],
          (err2, rows) => {
            if (err2) return reject(err2);

            const newXp = rows[0].userExperience;
            const newLevel = calcLevelFromXp(newXp);

            connectionMySQL.query(
              "UPDATE User SET userLevel = ? WHERE userId = ?",
              [newLevel, userId],
              (err3) => {
                if (err3) return reject(err3);
                resolve({ newXp, newLevel });
              }
            );
          }
        );
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
  calcLevelFromXp,
  addXp,
  // deleteUser,
};
