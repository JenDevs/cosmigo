<script setup>
import { ref, onMounted, inject } from "vue";
import ProfileCard from "./ProfileCard.vue";
import TodoList from "./TodoList.vue";
import NoteList from "./NoteList.vue";
import QuizList from "./QuizList.vue";
import { useQuizStore } from "@/stores/useQuizStore";
import { useNotesStore } from "../stores/useNotesStore";
import { storeToRefs } from "pinia";

// QUIZZES

//Pinia s
const store = useQuizStore();

// Ladda listan från backend via store
const loading = ref(false);
const error = ref("");

async function loadQuizzes() {
  loading.value = true;
  error.value = "";
  try {
    await store.load();
  } catch (e) {
    error.value = "Could not get quizzes";
    console.error(e);
  } finally {
    loading.value = false;
  }
}

// välj quiz
function selectQuiz(id) {
  store.setCurrentById(id);
}

// ta bort quiz
async function deleteQuiz(id) {
  if (!confirm("Do you want to delete this quiz?")) return;
  try {
    await store.remove(id);
  } catch (e) {
    alert("Could not delete quiz.");
    console.error(e);
  }
}

// ladda quiz
onMounted(loadQuizzes);

const notesStore = useNotesStore();
const { notes } = storeToRefs(notesStore);
const { selectNote, createNote, deleteNote } = notesStore;
</script>

<template>
  <aside class="sidebar">
    <ProfileCard />
  <TodoList/>
  
<!-- QUIZZES -->
<section class="quizzes-container">
  <header class="quizzes-header">
    <h3 class="quizzes-title">My Quizzes</h3>
  </header>

  <div class="quizzes-body">
    <p v-if="loading" class="q-muted">Loading…</p>
    <p v-else-if="error" class="q-error">{{ error }}</p>
    <p v-else-if="store.list.length === 0" class="q-muted">
      You have no saved quizzes yet.
    </p>

    <QuizList
      v-else
      :quizzes="store.list"
      @select="selectQuiz"
      @delete="deleteQuiz"
    />
  </div>
</section>

  <!-- <NoteList :notes="notes" @delete="deleteNote" /> -->
    <div class="note-list-container">
      <button class="new-note-btn" @click="createNote">New Note</button>
      <NoteList
        :notes="notes"
        @select="selectNote"
        @new-note="createNote"
        @delete="deleteNote"
      />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
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

.note-list-container {
  background-color: rgba(255, 255, 255, 0.12);
  padding: 12px;
  border-radius: 8px;
  color: white;
}

/* ---- QUIZZES panel ---- */
.quizzes-container {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 12px;
  color: white;
}

.quizzes-header {
  background-color: rgba(148, 148, 148, 0.317);
  border-radius: 6px;
  padding: 6px 10px;      
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  width: calc(100% - 2px);
  box-sizing: border-box;
}

.quizzes-title {
  margin: 0;
  font-size: 1.05rem;  
  font-weight: 600;
  color: white;
  text-align: left;
}

.quiz-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.quiz-item {
  margin: 6px 0;
}

.q-error { 
  color: #ffb3b3; 
  font-size: 0.95rem; 
  margin: 6px 2px; 
}
</style>
