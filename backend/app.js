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

// app.use(express.static('public'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
