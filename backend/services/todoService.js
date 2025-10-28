// backend/services/todoService.js Create todo item, delete todo item, update todo item, get todo items (maybe not needed)
const connectionMySQL = require("./../connectionMySQL");

function createTodo(userId, todoTitle, todoDescription, todoIsCompleted) {
  return new Promise((resolve, reject) => {
    console.log(
      'Creating todo for user:',
      userId,
      'with title:',
      todoTitle,
      'description:',
      todoDescription,
      'isCompleted:',
      todoIsCompleted
    )
    const isCompleted = todoIsCompleted ?? false
    const sql = 'INSERT INTO Todo (userId, todoTitle, todoDescription, todoIsCompleted) VALUES (?, ?, ?, ?)'
    const params = [userId, todoTitle, todoDescription, isCompleted]

    connectionMySQL.query(sql, params, (err, result) => {
      if (err) reject(err)
        resolve({ success: true, todoId: result.insertId })
    })
  })
}

  function deleteTodo(todoId) {
  return new Promise((resolve, reject) => {
    console.log('Deleting todo with id:', todoId)
    const sql = 'DELETE FROM Todo WHERE todoId = ?'
    const params = [todoId]
    connectionMySQL.query(sql, params, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}


function getAllTodos(userId) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching all todos for user ${userId}`)
    const connectionMySQL = require('../connectionMySQL')
    const sql = 'SELECT * FROM Todo WHERE userId = ? ORDER BY todoCreatedAt DESC'
    const params = [userId]

    connectionMySQL.query(sql, params, (err, rows) => {
      if (err) reject(err)
      else resolve(rows)
    })
  })
}

function updateTodo(todoId, todo) {
  return new Promise((resolve, reject) => {
    console.log('Updating todo with id:', todoId, 'with data:', todo)
    const sql = 'UPDATE Todo SET todoTitle = ?, todoDescription = ?, todoIsCompleted = ? WHERE todoId = ?'
    const params = [todo.todoTitle, todo.todoDescription, todo.todoIsCompleted, todoId]

    connectionMySQL.query(sql, params, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}


module.exports = {
  createTodo,
  deleteTodo,
  updateTodo,
  getAllTodos
}