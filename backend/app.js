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

const userRoutes = require("./routes/userRoutes");
app.use(userRoutes);

const pomodoroRoutes = require("./routes/pomodoroRoutes");
app.use("/api/pomodoro", pomodoroRoutes)

// app.use(express.static('public'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
