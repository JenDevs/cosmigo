const todoService = require('../services/todoService');

exports.createTodo = async (req, res) => {
    console.log('Received request to create todo with data:', req.body);
  const { userId, todoTitle, todoDescription, todoIsCompleted } = req.body;
  console.log('Parsed fields - userId:', userId, 'todoTitle:', todoTitle, 
    'todoDescription:', todoDescription, 'todoIsCompleted:', todoIsCompleted);

    if (!userId || !todoTitle || !todoDescription) {
        console.error('Missing required fields in request body');
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: userId, todoTitle, todoDescription'
        });
    }
    try {
         const result = await todoService.createTodo(
            userId,
            todoTitle,
            todoDescription,
            todoIsCompleted
        );
        return res.status(201).json({
            success: true,
            message: 'Todo item created successfully',
            todoId: result.todoId
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getTodosByUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const todos = await todoService.getTodosByUser(req.db, userId);
        return res.status(200).json({
            success: true,
            todos,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.updateTodo = async (req, res) => {

    const todoId = req.params.todoId;

    const { todoTitle, todoDescription, todoIsCompleted } = req.body;
      if (!todoId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: todoId'
    });
  }
    try {

        console.log('Received update for todoId:', todoId, 'with data:', req.body);
        const result = await todoService.updateTodo(todoId, {
            todoTitle,
            todoDescription,
            todoIsCompleted
        });
        console.log('Update result:', result);
        if (!result || result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            error: 'Todo not found'
          });
        }
        return res.status(200).json({
            success: true,
            message: 'Todo item updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
exports.deleteTodo = async (req, res) => {
  const { todoId } = req.params;

  if (!todoId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required field: todoId'
    });
  }

  try {
    const result = await todoService.deleteTodo(todoId);
    console.log('Delete result:', result);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Todo not found'
      });
    }
    return res.status(200).json({
      success: true,
      message: 'Todo item deleted successfully'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};




exports.getAllTodos = async (req, res) => {
    console.log('Received request to get all todos');
    const userId = req.params.userId;

    if (!userId) {
        console.error('Missing userId in request parameters');
        return res.status(400).json({
            success: false,
            error: 'Missing required field: userId'
        });
    }
    try {
        const rows = await todoService.getAllTodos(userId);
        console.log('Fetched todos:', rows);
        return res.status(200).json({
            success: true,
            data: rows,
        });
    } catch (error) {
        console.error('Error fetching todos:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
