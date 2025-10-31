<script setup>
import { ref, inject, onMounted } from "vue";
import ProfileCard from "./ProfileCard.vue";
import TodoList from "./TodoList.vue";
import NoteList from "./NoteList.vue";
import QuizList from "./QuizList.vue";

import { useQuizStore } from "@/stores/useQuizStore";
import { useNotesStore } from "../stores/useNotesStore";
import { storeToRefs } from "pinia";

const notesStore = useNotesStore();
const { notes } = storeToRefs(notesStore);
const { selectNote, createNote, deleteNote } = notesStore;

// QUIZZES
const store = useQuizStore();
const { list } = storeToRefs(store); 
const loading = ref(false);
const error = ref("");
const userId = 1;

// ladda quiz
async function loadQuizzes() {
  const userId = 1;
  loading.value = true;
  error.value = "";
  try {
    await store.load(userId);
  } catch (e) {
    error.value = "Could not get quizzes";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// välj quiz
function selectQuiz(id) {
  store.setCurrentById(Number(id));
}

// ta bort quiz
async function deleteQuiz(id) {
  if (!confirm("Do you want to delete this quiz?")) return;
  try {
    await store.remove(userId, id);
  } catch (e) {
    alert("Could not delete quiz.");
    console.error(e);
  }
}

// ladda quiz vid mount
onMounted(loadQuizzes);
</script>

<template>
  <aside class="sidebar" role="complementary" aria-label="Notes sidebar">
    <ProfileCard />
    <TodoList />

    <!-- Quiz -->
    <div class="quizzes-container">
      <div class="quizzes-header">
        <h3 class="quizzes-title">My quizzes</h3>
        <button class="new-quiz-btn" @click="store.requestNew()">New Quiz</button>
      </div>

      <div class="quizzes-body">
        <template v-if="!loading && !error">
          <QuizList
            :quizzes="list"
            @select="selectQuiz"
            @delete="deleteQuiz"
          />
        </template>
        <p v-else-if="loading" class="q-muted">Loading…</p>
        <p v-else class="q-error">{{ error }}</p>
      </div>
    </div>

    <!-- Notes -->
    <div class="note-list-container">
      <button
        class="new-note-btn"
        @click="createNote"
        aria-label="Create new note"
      >
        New Note
      </button>
      <NoteList :notes="notes" @select="selectNote" @delete="deleteNote" />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px;
  height: 100%;
  background-color: rgb(63, 63, 70);
  padding: 12px;
  display: flex;
  gap: 12px;
}

/* Quiz */
.quizzes-container {
  background-color: rgba(255, 255, 255, 0.12);
  padding: 12px;
  border-radius: 8px;
  color: white;
}
.quizzes-header {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 10px;
}
.new-quiz-btn {
  background-color:#4caf50; 
  color:#fff; 
  border:none; 
  border-radius:6px;
  padding:6px 10px; 
  cursor:pointer; 
  font-size:.9rem;
 }
.quizzes-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.quizzes-body {
  max-height: 260px;
  overflow: auto;
  padding-right: 4px;
}
.q-muted { opacity: .7; font-size: .95rem; margin: 6px 2px; }
.q-error { color: #ffb3b3; font-size: .95rem; margin: 6px 2px; }

/* Notes */
.note-list {
  margin-top: auto;
}

.new-note-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.new-note-btn:active {
  background-color: #43a346;
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.1s ease;
}

.note-list-container {
  background-color: rgba(255, 255, 255, 0.12);
  padding: 12px;
  border-radius: 8px;
  color: white;
}
</style>
