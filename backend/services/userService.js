function getAllUsers(db) {
  return db.query("SELECT * FROM user").then((results) => results);
}

function getUserById(db, userId) {
  return db
    .query("SELECT * FROM user WHERE id = ?", [userId])
    .then((results) => results[0]);
}

function createUser(db, userData) {
  return db
    .query("INSERT INTO user (username, email) VALUES (?, ?)", [
      userData.username,
      userData.email,
    ])
    .then((result) => ({ id: result.insertId, ...userData }));
}

function updateUser(db, userId, userData) {
  return db
    .query("UPDATE user SET username = ?, email = ? WHERE id = ?", [
      userData.username,
      userData.email,
      userId,
    ])
    .then(() => ({ id: userId, ...userData }));
}

function deleteUser(db, userId) {
  return db
    .query("DELETE FROM user WHERE id = ?", [userId])
    .then(() => ({ id: userId }));
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
