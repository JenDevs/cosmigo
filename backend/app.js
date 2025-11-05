const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/userRoutes");
app.use(userRoutes);

const noteRoutes = require("./routes/noteRoutes");
app.use(noteRoutes);

const quizRoutes = require("./routes/quizRoutes");
app.use("/api", quizRoutes);

const todoRoutes = require("./routes/todoRoutes");
app.use("/api", todoRoutes);

const pomodoroRoutes = require("./routes/pomodoroRoutes");
app.use("/api/pomodoro", pomodoroRoutes);

const cosmigoRoutes = require("./routes/cosmigoRoutes");
app.use(cosmigoRoutes);

const statisticRoutes = require("./routes/statisticRoutes");
app.use(statisticRoutes);

// felhanterare
app.use((req, res, next) => {
  console.log(` ${req.method} ${req.url}`);
  next();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
