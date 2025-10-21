const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const userRoutes = require("./routes/userRoutes");
const todoRoutes = require("./routes/todoRoutes");

//för annas routes crud todo
app.use('/api', todoRoutes)

//app.use(todoRoutes);
app.use(userRoutes);

// app.use(express.static('public'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
