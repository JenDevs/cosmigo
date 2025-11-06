<template>
  <div class="todoList">
    <div class="row">
      <input
        type="text"
        id="inputBox"
        placeholder="Write a new task here..."
        v-model="newTask"
        @keyup.enter="addTask"
      />
      <button @click="addTask">Add</button>
    </div>

    <div class="todo-scroll">
      <div class="edge-fade top" aria-hidden="true"></div>

      <ul id="listContainer" role="list" aria-label="To-do items">
        <li
          v-for="(t, i) in tasks"
          :key="t.id"
          :class="{ checked: t.done }"
          @click="completeTask(i)"
        >
          <span class="todo-text">{{ t.text }}</span>
          <img
            src="../assets/images/xpix.svg"
            alt="Delete"
            width="16"
            height="16"
            @click.stop="removeTask(i)"
          />
        </li>
        <p class="no-todos" v-if="!loading && tasks.length === 0">
          No tasks yet... 🦗
        </p>
      </ul>

      <div class="edge-fade bottom" aria-hidden="true"></div>
    </div>
  </div>
</template>

<style scoped>
.todoList {
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
  flex: 5;
  height: 30px;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #f2f2f2;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.no-todos {
  text-align: center;
  margin: 0;
  padding-bottom: 12px;
  padding-top: 12px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: rgb(37, 22, 65);
  color: rgb(232, 214, 252);
  cursor: pointer;
  transition: background 0.2s ease;
}

button:hover {
  background: rgb(48, 23, 94);
}

.todo-scroll {
  --row-h: 48px;
  --visible-rows: 3;
  --ul-pad: 4px;
  max-height: calc(var(--visible-rows) * var(--row-h) + 2 * var(--ul-pad));
  overflow: auto;
  scrollbar-width: none;
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.edge-fade {
  position: sticky;
  left: 0;
  right: 0;
  height: 20px;
  pointer-events: none;
  z-index: 2;
}

.edge-fade.top {
  top: 0;
  margin-bottom: -20px;
  background: radial-gradient(
    ellipse 80% 70% at 50% -40%,
    rgba(0, 0, 0, 0.45) 0%,
    rgba(0, 0, 0, 0.28) 45%,
    rgba(0, 0, 0, 0) 100%
  );
}

.edge-fade.bottom {
  bottom: 0;
  margin-top: -20px;
  background: radial-gradient(
    ellipse 80% 65% at 50% 140%,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.24) 40%,
    rgba(0, 0, 0, 0) 100%
  );
}

#listContainer {
  list-style: none;
  padding: var(--ul-pad);
  margin: 0;
}

#listContainer > li {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--row-h);
  line-height: var(--row-h);
  padding-left: 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  cursor: pointer;
  color: #222;
  background: transparent;
  user-select: none;
  transition: background 0.15s ease;
}

#listContainer > li:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

#listContainer > li.checked:hover {
  background-color: rgba(0, 179, 45, 0.1);
}

/* bullet / checkmark */
#listContainer > li::before {
  content: "•";
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.2rem;
  color: white;
  line-height: 1;
}

#listContainer > li.checked::before {
  content: "✓";
  color: rgb(0, 179, 45);
  font-weight: bold;
}

.todo-text {
  flex: 1;
  margin-left: 8px;
  text-align: left;
  color: rgb(232, 214, 252);
  transition: color 0.15s ease;
}

#listContainer > li.checked .todo-text {
  color: rgba(0, 0, 0, 0.45);
  text-decoration: line-through;
}

#listContainer > li img {
  width: 16px;
  height: 16px;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

#listContainer > li img:hover {
  opacity: 1;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { useCosmigoStore } from "@/stores/useCosmigoStore";
import { useUserStore } from "@/stores/useUserStore";
const cosmigo = useCosmigoStore();

const newTask = ref("");
const tasks = ref([]);
const loading = ref(false);

const mapTodo = (r) => ({
  id: r.todoId ?? Date.now() + Math.random(),
  text: r.todoTitle ?? r.title ?? r.text ?? "",
  done: !!(r.todoIsCompleted ?? r.completed ?? r.done),
  todoId: r.todoId ?? r.id ?? null,
  todoRewardedAt: r.todoRewardedAt ?? r.rewardedAt ?? null,
});

function pickList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.todos)) return payload.todos;
  return [];
}

async function loadTasks() {
  loading.value = true;
  try {
    const res = await fetch("/api/todos/1");
    if (!res.ok) throw new Error(await res.text());
    const payload = await res.json();
    const rows = pickList(payload);
    tasks.value = rows.map(mapTodo);
    console.log("loaded", { payload, rows, tasks: tasks.value });
  } catch (e) {
    console.error("load failed", e);
    tasks.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadTasks);

async function addTask() {
  const text = newTask.value.trim();
  if (!text) return;
  newTask.value = "";
  const payload = {
    userId: 1,
    todoTitle: text,
    todoDescription: text,
    todoIsCompleted: false,
  };
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
    const data = await res.json();
    tasks.value.push({
      id: data.todoId,
      text,
      done: false,
      todoId: data.todoId ?? null,
    });
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
  if (!t) return;

  const prev = t.done;
  t.done = !t.done;

  // If user unticks task, stops animation immediatly
  if (!t.done && typeof cosmigo?.cancelTemp === "function") {
    cosmigo.cancelTemp();
  }

  if (!t.todoId) {
    if (t.done && typeof cosmigo?.onCompletion === "function") {
      cosmigo.onCompletion("cosmigo_completion_rolling", 850, {
        restart: false,
      });
    }
    return;
  }

  try {
    const shoudSetRewardedAt = t.done && !t.todoRewardedAt;
    const rewardTime = shoudSetRewardedAt
      ? new Date().toISOString()
      : t.todoRewardedAt;
    const res = await fetch(`/api/todos/${t.todoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        todoTitle: t.text,
        todoDescription: t.text,
        todoIsCompleted: t.done,
        todoRewardedAt: rewardTime,
      }),
    });

    if (!res.ok) {
      console.error("Failed to update todo completion", await res.text());
      t.done = prev;
      return;
    }

    if (shoudSetRewardedAt) {
      useUserStore().addXP("todo");
      t.todoRewardedAt = rewardTime;
    }

    // When user ticks task, cosmigo spins
    if (t.done && typeof cosmigo?.onCompletion === "function") {
      // ignore while active, or use restart:true to refresh one timer

      cosmigo.onCompletion("cosmigo_completion_rolling", 850, {
        restart: false,
      });
    }
  } catch (err) {
    console.error("Error updating todo completion:", err);
    t.done = prev;
  }
}
</script>
