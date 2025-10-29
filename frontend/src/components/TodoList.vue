<!-- HTML -->

<template>
  <div class="todoList">
    <h2>My To-Dos <img src="../assets/images/notepad.png" width="100%" height="100%" /></h2>
    <div class="row">
      <input type="text" id="inputBox" placeholder="Write a new task here" v-model="newTask" @keyup.enter="addTask" />
      <button @click="addTask">Add</button>
    </div>
<ul id="listContainer">
  <li v-for="(t, i) in tasks" :key="t.id" :class="{ checked: t.done }">
    <span @click="completeTask(i)" class="todo-text">{{ t.text }}</span>
    <img src="../assets/images/xpix.svg" alt="" width="10%" height="1%" @click.stop="removeTask(i)" />

  </li>
</ul>
<p v-if="!loading && tasks.length === 0">No tasks found</p>
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
.todoList h2 {
  background-color: rgb(92, 0, 0);
  padding: 8px 16px;
  border-radius: 8px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
  font-size: 1.5rem;
}
.todoList h2 img {
  height: 2em;
  width: auto;
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
  background-color: rgba(0, 0, 0, 0.1);
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
  content: "•";
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
  content: "✓";
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
import { ref, onMounted } from 'vue'
import { useCosmigoStore } from "@/stores/useCosmigoStore";
const cosmigo = useCosmigoStore();

const newTask = ref('')
const tasks = ref([])
const loading = ref(false)

const mapTodo = r => ({
  id: r.todoId ?? Date.now() + Math.random(),
  text: r.todoTitle ?? r.title ?? r.text ?? '',
  done: !!(r.todoIsCompleted ?? r.completed ?? r.done),
  todoId: r.todoId ?? r.id ?? null
})

function pickList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.todos)) return payload.todos
  return []
}

async function loadTasks() {
  loading.value = true
  try {
    const res = await fetch('/api/todos/1')
    if (!res.ok) throw new Error(await res.text())
    const payload = await res.json()
    const rows = pickList(payload)
    tasks.value = rows.map(mapTodo)
    console.log('loaded', { payload, rows, tasks: tasks.value })
  } catch (e) {
    console.error('load failed', e)
    tasks.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadTasks)

async function addTask() {
  const text = newTask.value.trim()
  if (!text) return
  newTask.value = ''
  const payload = { userId: 1, todoTitle: text, todoDescription: text, todoIsCompleted: false }
  try {
    const res = await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("Failed to create todo", await res.text());
      return;
    }
    const data = await res.json()
    tasks.value.push({
      id: data.todoId ?? Date.now() + Math.random(),
      text,
      done: false,
      todoId: data.todoId ?? null
    })
  } catch (err) {
    console.error(err);
  }
}

async function removeTask(i) {
  const t = tasks.value[i];
  try {
    const res = await fetch(`/api/todos/${t.todoId}`, { method: "DELETE" });
    if (!res.ok && res.status !== 404) {
      console.error("Failed to delete todo", await res.text());
      return;
    }
    tasks.value.splice(i, 1);
  } catch (err) {
    console.error("Error deleting todo:", err);
  }
}

async function completeTask(i) {
  const t = tasks.value[i];
  if (!t || !t.todoId) return;

  const prev = t.done;
  t.done = !t.done;

  try {
    const res = await fetch(`/api/todos/${t.todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todoTitle: t.text,
        todoDescription: t.text,
        todoIsCompleted: t.done,
      }),
    });

    if (!res.ok) {
      console.error("Failed to update todo completion", await res.text());
      t.done = prev;
      return;
    }
    // When task is completed cosmigo spins
    if (t.done && typeof cosmigo?.onCompletion === "function") {
      try {
        cosmigo.onCompletion("cosmigo_completion_rolling", 850);
      } catch (e) {
        console.error("onCompletion failed:", e);
      }
    }
  } catch (err) {
    console.error("Error updating todo completion:", err);
    t.done = prev;
  }
}

</script>
