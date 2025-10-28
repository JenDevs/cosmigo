<!-- HTML -->

<template>
  <div class="todoList">
    <h2>Todo List <img src="" /></h2>
    <div class="row">
      <input type="text" id="inputBox" placeholder="Add new task" v-model="newTask" @keyup.enter="addTask" />
      <button @click="addTask">Add</button>
    </div>
<ul id="listContainer">
  <li v-for="(t, i) in tasks" :key="t.id" :class="{ checked: t.done }">
    <span @click="completeTask(i)" class="todo-text">{{ t.text }}</span>
    <button @click.stop="removeTask(i)">Delete</button>
  </li>
</ul>
  </div>
</template>

<!-- CSS -->

<style scoped>
.todoList {
  background-color: rgb(255, 180, 180);
  padding: 16px;
  border-radius: 8px;
  color: white;
  margin-top: 16px;
}
.todoList h2{
  background-color: rgb(92, 0, 0);
  padding: 16px;
  border-radius: 8px;
  color: white;
}
.todoList .row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 16px;
}
.todoList input[type="text"] {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  outline: none;
}
button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: pink;
  color: black;
  cursor: pointer;
}
ul li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  list-style: none;
  user-select: none;
  cursor: pointer;
  position: relative;
}
ul li::before {
  content: '•';
  color: white;
  display: inline-block;
  width: 1em;
  margin-left: -1em;
  background-size: cover;
  background-position: center;
}
ul li.checked {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: line-through;
}
ul li.checked::before {
  content: '✓';
  color: rgb(0, 179, 45);
}
ul li span {
  flex: 1;
  margin-left: 8px;
  color: #555555;
  line-height: 40px;
  text-align: left;
  border-radius: 0;
}
/* hover on tasks text*/
ul li span:hover {
  background-color: transparent;
  color: #222222;
}
</style>


<!-- Script -->
<script setup>
import { ref, watch, onMounted } from 'vue'

const newTask = ref('')
const tasks = ref([])

onMounted(() => {
  const raw = localStorage.getItem('tasks')
  try {
    const arr = raw ? JSON.parse(raw) : []
    tasks.value = arr
      .filter(t => t && typeof t === 'object')
      .map(t => ({
        id: t.id ?? crypto.randomUUID(),
        text: t.text ?? String(t),
        done: Boolean(t.done)
      }))
  } catch {
    tasks.value = []
  }
})

function toggle(i) {
  const t = tasks.value[i]
  if (!t) return
  t.done = !t.done
}

async function addTask() {
  const text = newTask.value.trim()
  if (!text) return
  const localId = Date.now()
  const item = { id: localId, todoId: null, text, done: false }

  newTask.value = ''
  const payload = { userId: 1, todoTitle: text, todoDescription: text, todoIsCompleted: false }
  try {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      console.error('Failed to create todo', await res.text())
      return
    }
  
    const data = await res.json()
    console.log('Response data:', data)
    const idx = tasks.value.findIndex(x => x.id === localId)
    if (idx !== -1) tasks.value[idx].todoId = data.todoId
    item.todoId = data.todoId
    console.log('Created todo with ID:', data.todoId)
      tasks.value.push(item)
  } catch (err) {
    console.error(err)
  }
}

async function removeTask(i) {
  const t = tasks.value[i]
  try {
    const res = await fetch(`/api/todos/${t.todoId}`, { method: 'DELETE' })
    if (!res.ok && res.status !== 404) {
      console.error('Failed to delete todo', await res.text())
      return
    }
    tasks.value.splice(i, 1)
  } catch (err) {
    console.error('Error deleting todo:', err)
  }
}

async function completeTask(i) {
  const t = tasks.value[i]
  if (!t || !t.todoId) return
  const prev = t.done
  t.done = !t.done
  try {
    const res = await fetch(`/api/todos/${t.todoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        todoTitle: t.text,
        todoDescription: t.text,
        todoIsCompleted: t.done
      })
    })
    if (!res.ok) {
      console.error('Failed to update todo completion', await res.text())
      t.done = prev
    }
  } catch (err) {
    console.error('Error updating todo completion:', err)
    t.done = prev
  }
}


watch(tasks, () => {
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}, { deep: true })
</script>