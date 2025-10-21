// backend/services/todoService.js Create todo item, delete todo item, update todo item, get todo items (maybe not needed)
const connectionMySQL = require("./../connectionMySQL");


async function createTodo(userId, todoTitle, todoDescription, todoIsCompleted) {
  console.log('Creating todo for user:', userId, 'with title:', todoTitle, 'description:', todoDescription, 'isCompleted:', todoIsCompleted);
  const isCompleted = todoIsCompleted ?? false

  const sql = 'INSERT INTO Todo (userId, todoTitle, todoDescription, todoIsCompleted) VALUES (?, ?, ?, ?)';
  const params = [userId, todoTitle, todoDescription, isCompleted];
  const [result] = await connectionMySQL.query(sql, params);
  return result;
}


async function deleteTodo(todoId) {
  console.log('Deleting todo with id:', todoId);
  const sql = 'DELETE FROM Todo WHERE todoId = ?';
  const params = [todoId];
  const [result] = await connectionMySQL.query(sql, params);
  return result;
}
//isn't reallt needed but keeping for consistency
function getTodoById(todoId) {
  return connectionMySQL
    .query('SELECT * FROM Todo WHERE todoId = ?', [todoId])
    .then(rows => rows[0] || null)
}
//do we really need to update todo? need to update experience points completing todo though
async function updateTodo(todoId, todo) {
  console.log('Updating todo with id:', todoId, 'with data:', todo);
  const sql = 'UPDATE Todo SET todoTitle = ?, todoDescription = ?, todoIsCompleted = ? WHERE todoId = ?';
  const params = [todo.todoTitle, todo.todoDescription, todo.todoIsCompleted, todoId];
  const [result] = await connectionMySQL.query(sql, params);
  return result;
}

function getTodosByUser(userId) {
  return connectionMySQL
    .query('SELECT * FROM Todo WHERE userId = ? ORDER BY todoCreatedAt DESC', [userId])
    .then(rows => rows)
}

//do i really need a getAllTodos function? Keep it for debugging purposes?
async function getAllTodos(userId) {

  console.log(`Fetching all todos for user ${userId}`);
  const connectionMySQL = require('../connectionMySQL');
  const [rows] = await connectionMySQL.query(
    'SELECT * FROM Todo WHERE userId = ? ORDER BY todoCreatedAt DESC',
     [userId]);
  return rows;
}

module.exports = {
  createTodo,
  deleteTodo,
  getTodoById,
  updateTodo,
  getTodosByUser,
  getAllTodos
}