<!-- HTML -->

<template>
  <div class="todoList">
    <h2>Todo List <img src="" /></h2>
    <div class="row">
      <input type="text" id="inputBox" placeholder="Add new task" v-model="newTask" @keyup.enter="addTask" />
      <button @click="addTask">Add</button>
    </div>
    <ul id="listContainer">
      <li v-for="(t, i) in tasks" :key="i" :class="{ checked: t.done }" @click="toggle(i)">
        <span>{{ t.text }}</span>
        <button class="delete-button" @click.stop="removeTask(i)">Delete</button>
      </li>
    </ul>
  </div>
</template>

<!-- CSS -->

<style scoped>
.todoList {
  background-color: rgba(255, 255, 255, 0.12);
  padding: 16px;
  border-radius: 8px;
  color: white;
  margin-top: 16px;
}
.todoList h2{
  background-color: rgba(255, 255, 255, 0.12);
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
  background-color: #4caf50;
  color: rgb(255, 255, 255);
  cursor: pointer;
}

.delete-button  {
  background-color: #e74c3c;
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
  color: #ffffff;
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

async function addTask() {
  const text = newTask.value.trim()
  if (!text) return
  const item = { id: crypto.randomUUID(), text, done: false }
  tasks.value.push(item)
  newTask.value = ''
  const payload = {
    userId: 2,
    todoTitle: text,
    todoDescription: text,
    todoIsCompleted: false
  }
  try {
    const res = await fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) console.error('Failed to create todo', await res.text())
  } catch (err) {
    console.error(err)
  }
}

function toggle(i) {
  const t = tasks.value[i]
  if (!t) return
  t.done = !t.done
}

function removeTask(i) {
  tasks.value.splice(i, 1)
}

watch(tasks, () => {
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}, { deep: true })
</script>
