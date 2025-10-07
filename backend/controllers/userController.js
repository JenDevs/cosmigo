const userService = require("./../services/userService");

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

exports.createUser = async (req, res) => {
  const { userName, userEmail, userLevel, userExperience } = req.body;

  if (!userName || userName.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: "Du måste ange ett användarnamn",
    });
  }

  if (!userEmail || userEmail.trim().length < 5) {
    return res.status(400).json({
      success: false,
      error: "Du måste ange en giltig e-postadress",
    });
  }

  try {
    await userService.createUser(
      userName,
      userEmail,
      userLevel,
      userExperience
    );

    return res.status(201).json({
      success: true,
      error: "",
      message: "Du har lagt till en ny användare!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
