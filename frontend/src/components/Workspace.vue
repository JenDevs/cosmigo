<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";

import NoteEditor from "./NoteEditor.vue";
import QuizEditor from "./QuizEditor.vue";
import QuizPlayer from "./QuizPlayer.vue";

import { useNotesStore } from "@/stores/useNotesStore";
import { useQuizStore } from "@/stores/useQuizStore";

// Notes
const notesStore = useNotesStore();
const { activeNote } = storeToRefs(notesStore);

// Quiz
const store = useQuizStore();
const { current } = storeToRefs(store);

// UI-state
const isQuizEditor = ref(false);
const selectedQuiz = ref(null);
const quizEditorRef = ref(null);

const playerOpen = ref(false);
const playerTitle = ref("Quiz");
const playerQuestions = ref([]);

// Ladda quiz-listan
onMounted(() => store.load());

// När valt quiz ändras i storen → hämta full version
watch(
  () => current.value?.id,
  async (id) => {
    if (!id) return;
    try {
      const full = await store.getFull(id);
      selectedQuiz.value = full;
      isQuizEditor.value = true;
    } catch (e) {
      console.error(e);
      alert("Could not load quiz");
    }
  }
);

// Starta spelaren
function onStart({ title, questions }) {
  playerTitle.value = title;
  playerQuestions.value = questions;
  playerOpen.value = true;
}

// Efter save
function onSaved({ id }) {
  store.setCurrentById(id);
}

// Skapa nytt quiz
function newQuiz() {
  isQuizEditor.value = true;
  store.clearCurrent();
  selectedQuiz.value = null;
  quizEditorRef.value?.resetQuiz();
}

// Arkivera quiz
async function handleArchive() {
  const id = store.current?.id || selectedQuiz.value?.id;

  const draft = quizEditorRef.value?.getCurrentQuizData?.();
  const hasEditorData = !!(draft && draft.title && draft.questions?.length);

  let archived = false;
  try {
    if (!id) {
      if (confirm("Quiz is not saved. Would you like to save now?")) {
        const payload = hasEditorData
          ? draft
          : { title: playerTitle.value, questions: playerQuestions.value };
        const res = await store.save(payload);
        if (res?.id) {
          await store.archive(res.id);
          archived = true;
        }
      }
    } else {
      if (hasEditorData) {
        await store.save({ ...draft, id });
      }
      await store.archive(id);
      archived = true;
    }
  } catch (e) {
    console.error(e);
    alert(e?.message || "Kunde inte arkivera quizet.");
  } finally {
    if (archived) playerOpen.value = false;
  }
}

// Stäng spelaren – fråga om spara om det inte finns id
async function handleClose() {
  const id = store.current?.id || selectedQuiz.value?.id;
  const draft = quizEditorRef.value?.getCurrentQuizData?.();
  const hasEditorData = !!(draft && draft.title && draft.questions?.length);

  if (!id && hasEditorData) {
    if (confirm("Do you want to save before exit?")) {
      try {
        await store.save(draft);
      } catch (e) {
        alert(e?.message || "Could not save");
        return; // avbryt stängning om det failar
      }
    }
  }

  playerOpen.value = false;
}

// (valfritt) restart-handler så @restart inte pekar på ingenting
function handleRestart() {
  console.log("Quiz restarted");
}
</script>

<template>
  <div class="workspace-view">
    <div id="toggle-editor">
      <label class="switch">
        <input type="checkbox" v-model="isQuizEditor" />
        <span class="slider">
          <p id="slider-note" :class="{ inactive: isQuizEditor }">Note</p>
          <p id="slider-quiz" :class="{ inactive: !isQuizEditor }">Quiz</p>
        </span>
      </label>
    </div>

    <!-- Note -->
    <NoteEditor
      v-if="!isQuizEditor"
      :note="activeNote"
      @save="(note) => notesStore.updateNote(note)"
    />

    <!-- Quiz -->
    <QuizEditor
      v-else
      :quiz="selectedQuiz"
      ref="quizEditorRef"
      @start="onStart"
      @saved="onSaved"
    />

    <!-- Quizplayer -->
    <QuizPlayer
      :open="playerOpen"
      :title="playerTitle"
      :questions="playerQuestions"
      @close="handleClose"
      @archive="handleArchive"
      @restart="handleRestart"
    />
  </div>
</template>

<style scoped>
.workspace-view {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgb(42, 42, 48);
  padding: 1rem;
  min-height: 100%;
}

/* Toggle */
#toggle-editor {
  position: absolute;
  top: 60px;
  gap: 10px;
  width: 200px;
  height: 36px;
  justify-content: space-between;
}
.switch {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}
.slider {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  background-color: rgb(24, 24, 29);
  border-radius: 8px;
  overflow: hidden;
}
.slider::before {
  position: absolute;
  content: "";
  height: 100%;
  width: 50%;
  background-color: rgb(211, 211, 211);
  border-radius: 8px;
  transition: transform 0.4s;
  transform: translateX(0);
  z-index: 0;
}
input:checked + .slider {
  background-color: rgb(24, 24, 29);
}
input:checked + .slider:before {
  transform: translateX(100%);
}
.slider p {
  color: rgba(0, 0, 0, 1);
  font-weight: bold;
  text-transform: uppercase;
  transition: color 0.3s ease;
  z-index: 1;
}
.slider p.inactive {
  color: rgba(255, 255, 255, 0.3);
}
#slider-note {
  margin-left: 15%;
}
#slider-quiz {
  margin-right: 15%;
  margin-left: auto;
}
</style>
