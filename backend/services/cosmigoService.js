const connectionMySQL = require("./../connectionMySQL");

function ensureRow(userId) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Cosmigo (userId, unlocked)
      VALUES (?, JSON_ARRAY())
      ON DUPLICATE KEY UPDATE userId = userId
    `;
    connectionMySQL.query(sql, [userId], (err, result) => {
      if (err) {
        console.error("ensureRow insert failed:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
}

function normalizeUnlocked(val) {
  try {
    if (Array.isArray(val)) return val;
    if (val && typeof val === "object") return val;

    if (typeof val === "string") {
      const s = val.trim();
      if (s.startsWith("[") || s.startsWith("{") || s.startsWith('"')) {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      return s ? [s] : [];
    }
  } catch (_) {}
  return [];
}

function getProfile(userId) {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureRow(userId);
      const sql = `SELECT userId, unlocked, equippedKey, updatedAt FROM Cosmigo WHERE userId = ?`;
      connectionMySQL.query(sql, [userId], (err, rows) => {
        if (err) return reject(err);
        const row = rows && rows[0];
        if (!row) {
          return resolve({
            userId,
            unlocked: [],
            equippedKey: null,
            updatedAt: null,
          });
        }
        resolve({
          userId: row.userId,
          unlocked: normalizeUnlocked(row.unlocked),
          equippedKey: row.equippedKey,
          updatedAt: row.updatedAt,
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}

function unlockKey(userId, key) {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureRow(userId);
      const sql = `
        UPDATE Cosmigo
        SET unlocked = IF(
          JSON_SEARCH(unlocked, 'one', ?) IS NOT NULL,
          unlocked,
          JSON_ARRAY_APPEND(unlocked, '$', ?)
        )
        WHERE userId = ?;
      `;
      connectionMySQL.query(sql, [key, key, userId], async (err) => {
        if (err) return reject(err);
        const updated = await getProfile(userId);
        resolve(updated);
      });
    } catch (e) {
      reject(e);
    }
  });
}

function equipKey(userId, key) {
  return new Promise(async (resolve, reject) => {
    try {
      const sql = `UPDATE Cosmigo SET equippedKey = ? WHERE userId = ?`;
      connectionMySQL.query(sql, [key, userId], async (err) => {
        if (err) return reject(err);
        const updated = await getProfile(userId);
        resolve(updated);
      });
    } catch (e) {
      reject(e);
    }
  });
}

module.exports = { getProfile, unlockKey, equipKey };
