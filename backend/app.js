const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_, res) => res.json({ ok: true }));

// USERS
const userRoutes = require("./routes/userRoutes");
const todoRoutes = require("./routes/todoRoutes");

//för annas routes crud todo
app.use('/api', todoRoutes)

//app.use(todoRoutes);
app.use("/api/users", userRoutes);

// QUIZZES
const quizRoutes = require("./routes/quizRoutes");
app.use("/api/quizzes", quizRoutes); 
app.use(userRoutes);
const noteRoutes = require("./routes/noteRoutes");
app.use(noteRoutes);

const pomodoroRoutes = require("./routes/pomodoroRoutes");
app.use("/api/pomodoro", pomodoroRoutes)

// app.use(express.static('public'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
