const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_, res) => res.json({ ok: true }));

// DEV: fake user 
app.use((req, res, next) => {
  if (!req.user) req.user = { id: 1 };
  next();
});

// USERS
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);

// QUIZZES
const quizRoutes = require("./routes/quizRoutes");
app.use("/api/quizzes", quizRoutes); 

// app.use(express.static('public'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
