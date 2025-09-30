const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend fungerar!");
});

app.listen(3000, () => {
  console.log("Server kör på http://localhost:3000");
});
