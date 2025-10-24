const pomodoroService = require("./../services/pomodoroService");

exports.getAllPomodoros = async (req, res) => {
  console.log('getAll ok');
  try {
    const pomodoros = await pomodoroService.getAllPomodoros();
    res.json({ pomodoros });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
}; 

exports.getPomodoroById = async (req, res) => {
  const { id } = req.params;
  console.log("param" + id);

  try {
    const pomodoroById = await pomodoroService.getPomodoroById(id);
    res.json({ pomodoroById });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.getPomodorosByUserId = async (req, res) => {
  const { pomodoroUserId } = req.params;
  console.log("param" + pomodoroUserId);

  try {
    const pomodorosByUser = await pomodoroService.getPomodorosByUserId(
      pomodoroUserId
    );
    res.json({ pomodorosByUser });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};

exports.createPomodoro = async (req, res) => {
  const {
    sessionType,
    duration,
    completed,
    startTime,
    endTime,
    pomodoroUserId,
  } = req.body;

  if (!sessionType || sessionType.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: "You must specify a session type for the pomodoro.",
    });
  }

  try {
    await pomodoroService.createPomodoro(
      sessionType,
      duration,
      completed,
      startTime,
      endTime,
      pomodoroUserId
    );
    return res.status(201).json({
      success: true,
      error: "",
      message: "A new pomodoro has been added.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.updatePomodoro = async (req, res) => {
  const {
    sessionType,
    duration,
    completed,
    startTime,
    endTime,
    pomodoroUserId,
    pomodoroId,
  } = req.body;

  if (!sessionType || sessionType.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: "You must specify a session type for the pomodoro.",
    });
  }

  if (!pomodoroId) {
    return res.status(400).json({
      success: false,
      error: "You must include the ID of the pomodoro you want to update.",
    });
  }

  try {
    await pomodoroService.updatePomodoro(
      sessionType,
      duration,
      completed,
      startTime,
      endTime,
      pomodoroUserId,
      pomodoroId
    );
    return res.status(200).json({
      success: true,
      error: "",
      message: "The pomodoro has been updated.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

exports.deletePomodoro = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: "You must include the ID of the pomodoro you want to delete.",
    });
  }

  try {
    await pomodoroService.deletePomodoro(id);
    return res.status(200).json({
      success: true,
      error: "",
      message: "The pomodoro has been deleted.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

