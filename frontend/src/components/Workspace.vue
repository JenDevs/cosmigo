<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";

import NoteEditor from "./NoteEditor.vue";
import QuizEditor from "./QuizEditor.vue";
import QuizPlayer from "./QuizPlayer.vue";
import QuizList from "./QuizList.vue";

import { useNotesStore } from "@/stores/useNotesStore";
import { useQuizStore } from "@/stores/useQuizStore";

const USER_ID = 1;

// Notes
const notesStore = useNotesStore();
const { activeNote } = storeToRefs(notesStore);

// Quiz
const quizStore = useQuizStore();
const { current, list } = storeToRefs(quizStore);

const isQuizEditor = ref(false);
const selectedQuiz = ref(null);
const quizEditorRef = ref(null);

// Player state
const playerOpen = ref(false);
const playerTitle = ref("Quiz");
const playerQuestions = ref([]);

// Ladda quiz-listan
onMounted(() => store.load(userId));

// När Sidebar klickar "New Quiz"
/*
watch(() => store.createSignal, () => {
  store.clearCurrent();
  selectedQuiz.value = null;
  isQuizEditor.value = true;
  quizEditorRef.value?.resetQuiz?.();
});*/

//________________________
/*
const loading = ref(false);
const error = ref("");

const currentId = computed(
  () => current.value?.id || selectedQuiz.value?.id || null
);

function getDraftFromEditor() {
  const draft = quizEditorRef.value?.getCurrentQuizData?.();
  const hasEditorData = !!(draft && draft.title && draft.questions?.length);
  return { draft: hasEditorData ? draft : null, hasEditorData };
}

function resetView() {
  selectedQuiz.value = null;
  playerOpen.value = false;
}

async function loadQuizzes() {
  loading.value = true;
  error.value = "";
  try {
    await quizStore.load(USER_ID);
  } catch (e) {
    console.error(e);
    error.value = "Could not get quizzes";
  } finally {
    loading.value = false;
  }
}

onMounted(loadQuizzes);
 */




// När valt quiz ändras i storen → hämta full version
watch(
  () => current.value?.id,
  async (id) => {
    if (!id) return;
    try {
      const full = await quizStore.getFull(USER_ID, id);
      selectedQuiz.value = full;
      isQuizEditor.value = true;
      //console.log("Loaded quiz:", full.id, full.title, full.questions?.length);
    } catch (e) {
      console.error(e);
      window.alert("Could not load quiz");
    }
  }
);

function onStart({ title, questions }) {
  playerTitle.value = title;
  playerQuestions.value = questions;
  playerOpen.value = true;
}

// Efter save: sidan uppdateras direkt
function onSaved({ id }) {
  quizStore.setCurrentById(Number(id));
}

function newQuiz() {
  isQuizEditor.value = true;
  quizStore.clearCurrent();
  selectedQuiz.value = null;
  quizEditorRef.value?.resetQuiz?.();
}

async function handleArchive() {
  let archived = false;
  try {
    if (!currentId.value) {
      const { draft } = getDraftFromEditor();
      if (draft) {
        if (window.confirm("Quiz is not saved. Would you like to save now?")) {
          const saved = await quizStore.save(USER_ID, draft);
          if (saved?.id) {
            await quizStore.archive(USER_ID, saved.id);
            archived = true;
          }
        }
      } else if (playerQuestions.value?.length) {
        if (window.confirm("Archive a copy of the running quiz?")) {
          const saved = await quizStore.save(USER_ID, {
            title: playerTitle.value,
            questions: playerQuestions.value,
          });
          if (saved?.id) {
            await quizStore.archive(USER_ID, saved.id);
            archived = true;
          }
        }
      }
    } else {
      const { draft } = getDraftFromEditor();
      if (draft)
        await quizStore.save(USER_ID, { ...draft, id: currentId.value });
      await quizStore.archive(USER_ID, currentId.value);
      archived = true;
    }
  } catch (e) {
    console.error(e);
    window.alert(e?.message || "Could not archive the quiz.");
  } finally {
    if (archived) {
      resetView();
      await loadQuizzes();
    }
  }
}

async function handleClose() {
  const { draft } = getDraftFromEditor();
  if (!currentId.value && draft) {
    if (window.confirm("Do you want to save before exit?")) {
      try {
        await quizStore.save(USER_ID, draft);
      } catch (e) {
        window.alert(e?.message || "Could not save");
        return;
      }
    }
  }
  playerOpen.value = false;
}

function handleRestart() {
  console.log("Quiz restarted");
}

function selectQuiz(id) {
  quizStore.setCurrentById(id);
}

async function deleteQuiz(id) {
  if (!id) return;
  if (!window.confirm("Delete this quiz? This can’t be undone.")) return;
  try {
    if (typeof quizStore.remove === "function") {
      await quizStore.remove(USER_ID, id);
    } else if (typeof quizStore.delete === "function") {
      await quizStore.delete(USER_ID, id);
    } else {
      await quizStore.archive(USER_ID, id);
    }
    if (currentId.value === id) resetView();
    await loadQuizzes();
  } catch (e) {
    console.error(e);
    window.alert(e?.message || "Could not delete quiz");
  }
}
</script>

<template>
  <div class="workspace-view">
    <!-- Toggle: Notes vs Quiz -->
    <div id="toggle-editor">
      <label class="switch">
        <input type="checkbox" v-model="isQuizEditor" />
        <span class="slider">
          <p id="slider-note" :class="{ inactive: isQuizEditor }">Note</p>
          <p id="slider-quiz" :class="{ inactive: !isQuizEditor }">Quiz</p>
        </span>
      </label>
    </div>

    <!-- Note Mode -->
    <NoteEditor
      v-if="!isQuizEditor"
      :note="activeNote"
      @save="(note) => notesStore.updateNote(note)"
    />

    <!-- Quiz Mode -->
    <div v-else class="quiz-layout">
      <section class="editor-panel">
        <QuizEditor
          :quiz="selectedQuiz"
          ref="quizEditorRef"
          @start="onStart"
          @saved="onSaved"
        />
      </section>
      <aside class="quizzes-container">
        <div class="quizzes-header">
          <h3 class="quizzes-title">Your quizzes</h3>
          <button class="btn" type="button" @click="newQuiz">New quiz</button>
        </div>

        <div class="quizzes-body">
          <div class="edge-fade top" aria-hidden="true"></div>

          <template v-if="!loading && !error">
            <QuizList
              :quizzes="list"
              @select="selectQuiz"
              @delete="deleteQuiz"
            />
          </template>
          <p v-else-if="loading" class="q-muted">Loading…</p>
          <p v-else class="q-error">{{ error }}</p>

          <div class="edge-fade bottom" aria-hidden="true"></div>
        </div>
      </aside>
    </div>
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
  justify-content: flex-start;
  align-items: center;
  background-color: rgb(42, 42, 48);
  padding-top: 124px;
  min-height: 100%;
}

/* Toggle */
#toggle-editor {
  position: absolute;
  top: 48px;
  width: 200px;
  height: 36px;
  justify-content: space-between;
  user-select: none;
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

/* QUIZ */
.quiz-layout {
  display: flex;
  width: 100%;
  max-width: 1400px;
  justify-content: center;
  align-items: flex-start;
  gap: 0;
  padding: 0;
  --editor-h: clamp(520px, calc(100vh - 180px), 680px);
}

.editor-panel {
  min-height: var(--editor-h);
  height: var(--editor-h);
  flex: 0 1 820px;
  max-width: 820px;
  background: rgba(255, 255, 255, 0.08);
  border-top-left-radius: 12px;
  border-bottom-left-radius: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
}

.quizzes-container {
  height: var(--editor-h);
  width: 300px;
  background: rgba(255, 255, 255, 0.08);
  border-top-right-radius: 12px;
  border-bottom-right-radius: 12px;
  display: flex;
  flex-direction: column;
  align-self: stretch;
  color: white;
}

.quizzes-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 10px;
}

.quizzes-body {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-gutter: stable both-edges;
  scrollbar-width: none; /* or thin */
}
.quizzes-body::-webkit-scrollbar {
  display: none;
}

.quizzes-body .edge-fade {
  position: sticky;
  left: 0;
  right: 0;
  height: 20px;
  pointer-events: none;
  z-index: 2;
}
.quizzes-body .edge-fade.top {
  top: 0;
  margin-bottom: -20px;
  background: radial-gradient(
    ellipse 80% 80% at 50% -40%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0) 100%
  );
}
.quizzes-body .edge-fade.bottom {
  bottom: 0;
  margin-top: -20px;
  background: radial-gradient(
    ellipse 80% 70% at 50% 140%,
    rgba(0, 0, 0, 0.6) 0%,
    rgba(0, 0, 0, 0.3) 30%,
    rgba(0, 0, 0, 0) 100%
  );
}

.btn {
  background: rgb(15, 137, 238);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-weight: 500;
  cursor: pointer;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.22);
}

@media (max-width: 960px) {
  .quiz-layout {
    flex-direction: column;
  }
  .editor-panel {
    max-width: 100%;
  }
  .quizzes-container {
    width: 100%;
    margin-left: 0;
  }
}
</style>
