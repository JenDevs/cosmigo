const cosmigoService = require("../services/cosmigoService");

exports.getProfile = async (req, res) => {
  try {
    const profile = await cosmigoService.getProfile(+req.params.userId);
    res.json(profile);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load cosmigo profile" });
  }
};

exports.unlockKey = async (req, res) => {
  try {
    const userId = +req.params.userId;
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: "key is required" });
    const updated = await cosmigoService.unlockKey(userId, key);
    res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to unlock reward" });
  }
};

exports.equipKey = async (req, res) => {
  try {
    const userId = +req.params.userId;
    const { key } = req.body;
    if (!key) return res.status(400).json({ error: "key is required" });
    const updated = await cosmigoService.equipKey(userId, key);
    res.status(200).json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to equip reward" });
  }
};
