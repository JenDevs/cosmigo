<script setup>
import { ref, onMounted } from "vue";
import ProfileCard from "./ProfileCard.vue";
//import TodoList from "./TodoList.vue";
import NoteList from "./NoteList.vue";
import QuizList from "./QuizList.vue";
import { useQuizStore } from "@/stores/useQuizStore";

const notes = ref([
  { id: 1, title: "Note 1", content: "Content for Note 1" },
  { id: 2, title: "Note 2", content: "Content for Note 2" },
  { id: 3, title: "Note 3", content: "Content for Note 3" },
]);

const deleteNote = (id) => {
  notes.value = notes.value.filter((note) => note.id !== id);
};

// QUIZZES

//Pinia store
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
</script>

<template>
  <aside class="sidebar">
    <ProfileCard />
    <!-- <TodoList /> -->
    <NoteList :notes="notes" @delete="deleteNote" />

    <div class="quizzes-panel">
      <QuizList
        v-if="store.list.length > 0"
        :quizzes="store.list"
        @select="selectQuiz"
        @delete="deleteQuiz"
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
  height: 100vh;
  background-color: rgb(63, 63, 70);
  padding: 12px;
  display: flex;
  gap: 12px;
}

.note-list {
  margin-top: auto;
}
</style>
