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
    if (Array.isArray(val)) return val; // already parsed somehow
    if (val && typeof val === "object") return val; // JSON already parsed to object

    if (typeof val === "string") {
      const s = val.trim();
      // If proper JSON array/object string, parse it
      if (s.startsWith("[") || s.startsWith("{") || s.startsWith('"')) {
        const parsed = JSON.parse(s);
        return Array.isArray(parsed) ? parsed : [parsed];
      }
      // Fallback: treat as a single key
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
          // last resort create (shouldn’t happen, but avoids 500)
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

// Add key only if not present
function unlockKey(userId, key) {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureRow(userId);
      const sql = `
        UPDATE Cosmigo
        SET unlocked = IF(
          JSON_CONTAINS(unlocked, JSON_QUOTE(?)),
          unlocked,
          JSON_ARRAY_APPEND(unlocked, '$', JSON_QUOTE(?))
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
