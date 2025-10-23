const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

// loggar requests
app.use((req, res, next) => {
  console.log(` ${req.method} ${req.url}`);
  next();
});

// JSON och CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_, res) => res.json({ ok: true }));

// DEV: Fake user (för test innan auth finns)
app.use((req, res, next) => {
  if (!req.user) req.user = { id: 1 };
  next();
});

// === ROUTES ===

// USERS
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// TODOS
const todoRoutes = require("./routes/todoRoutes");
app.use("/api", todoRoutes); // routes bör börja med /todos i filen

// NOTES
const noteRoutes = require("./routes/noteRoutes");
app.use(noteRoutes); // noteRoutes har redan /api/notes i filen

// POMODORO
const pomodoroRoutes = require("./routes/pomodoroRoutes");
app.use("/api/pomodoro", pomodoroRoutes);

// QUIZZES
const quizRoutes = require("./routes/quizRoutes");
app.use("/api/quizzes", quizRoutes);

// === START SERVER ===
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);
