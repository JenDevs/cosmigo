const e = require("express");
const userService = require("./../services/userService");
const connectionMySQL = require("../connectionMySQL");

function deriveInitialKeysForLevel(level = 1) {
  const byLevel = {
    1: ["cosmigo_lvl_1"],
    2: ["cosmigo_lvl_2_smize", "cosmigo_lvl_2_shock"],
    3: ["cosmigo_lvl_3_love", "cosmigo_lvl_3_sad"],
  };
  const keys = [];
  for (let i = 1; i <= level; i++) if (byLevel[i]) keys.push(...byLevel[i]);
  return JSON.stringify([...new Set(keys)]); // produces a valid JSON array string
}

//Todo: Can we move the transaction logic to service layer?
exports.createUser = (req, res) => {
  const { userName, userEmail, userLevel, userExperience } = req.body;

  connectionMySQL.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: "Transaction start failed" });

    // 1: insert user
    const insertUserSQL =
      "INSERT INTO `User` (userName, userEmail) VALUES (?, ?)";
    connectionMySQL.query(
      insertUserSQL,
      [userName, userEmail, userLevel, userExperience],
      (err, result) => {
        if (err) {
          return connectionMySQL.rollback(() =>
            res.status(400).json({
              error: "User insert failed",
              detail: String(err.code || err),
            })
          );
        }

        const newUserId = result.insertId;

        // 2: insert Cosmigo row linked to that user
        const initialUnlocked = deriveInitialKeysForLevel(1); // JSON array string
        const insertCosmigoSQL =
          "INSERT INTO Cosmigo (userId, unlocked) VALUES (?, ?)";

        connectionMySQL.query(
          insertCosmigoSQL,
          [newUserId, initialUnlocked],
          (err2) => {
            if (err2) {
              return connectionMySQL.rollback(() =>
                res.status(500).json({
                  error: "Cosmigo insert failed",
                  detail: String(err2.code || err2),
                })
              );
            }

            // 3: commit both inserts
            connectionMySQL.commit((err3) => {
              if (err3) {
                return connectionMySQL.rollback(() =>
                  res.status(500).json({ error: "Transaction commit failed" })
                );
              }

              res.status(201).json({
                message: "User and Cosmigo profile created successfully",
                userId: newUserId,
                userName,
                userEmail,
                userLevel,
                userExperience,
                cosmigo: {
                  unlocked: initialUnlocked,
                },
              });
            });
          }
        );
      }
    );
  });
};

exports.getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUserById(Number(id));
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { userName, userEmail, userLevel, userExperience } = req.body;
  try {
    const updatedUser = await userService.updateUser(Number(id), {
      userName,
      userEmail,
      userLevel,
      userExperience,
    });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.addXp = async (req, res) => {
  const { id } = req.params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ success: false, error: "Invalid user ID" });
  }

  const { xpGained } = req.body;
  const parsedXp = Number(xpGained);

  if (!Number.isFinite(parsedXp) || parsedXp <= 0) {
    return res.status(400).json({ success: false, error: "Invalid XP value" });
  }

  try {
    const result = await userService.addXp(userId, parsedXp);
    res.json({
      success: true,
      userExperience: result.newXp,
      userLevel: result.newLevel,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
