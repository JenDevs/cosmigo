const express = require('express');
const router = express.Router();
const todoController = require('../controllers/todoController');

router.post('/todos', todoController.createTodo);
router.get('/todos/user/:userId', todoController.getTodosByUser);
router.put('/todos/:todoId', todoController.updateTodo);
router.delete('/todos/:todoId', todoController.deleteTodo);
router.get('/todos/:userId', todoController.getAllTodos); // For debugging purposes?

module.exports = router;