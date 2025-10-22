const express = require("express");
const {
  listQuizzes,
  getOne,
  createOne,
  updateOne,
  removeOne,
} = require("../controllers/quizController");

const r = express.Router();

r.get("/", listQuizzes);       // GET    /api/quizzes
r.get("/:id", getOne);         // GET    /api/quizzes/:id
r.post("/", createOne);        // POST   /api/quizzes
r.put("/:id", updateOne);      // PUT    /api/quizzes/:id
r.delete("/:id", removeOne);   // DELETE /api/quizzes/:id

module.exports = r;