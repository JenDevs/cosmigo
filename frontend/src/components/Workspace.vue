<script setup>
import { onMounted, ref, watch } from "vue";
import NoteEditor from "./NoteEditor.vue";
import QuizEditor from "./QuizEditor.vue";
import QuizPlayer from "./QuizPlayer.vue";
import { useQuizStore } from "@/stores/useQuizStore";
import { storeToRefs } from "pinia";

// växla mellan Note/Quiz
const isQuizEditor = ref(false);

//Pinia-store för quiz
const store = useQuizStore();
const { current } = storeToRefs(store);

// quiz player state
const playerOpen = ref(false);
const playerTitle = ref("Quiz");
const playerQuestions = ref([]);

// ladda quiz när sidan öppnas
onMounted(() => store.load());

// reagera när quiz väljs i listan eller store
watch(
  () => useQuizStore.current?.id,
  async (id) => {
    if (!id) return;
    try {
      const full = await Quizzes.get(id);
      selectedQuiz.value = full;
      isQuizEditor.value = true;
    } catch (e) {
      console.error(e);
      alert("Could not load quiz");
    }
  }
);

// starta quiz spelaren
function onStart({ title, questions }) {
  playerTitle.value = title;
  playerQuestions.value = questions;
  playerOpen.value = true;
}

// efter att quiz sparats i editorn
function onSaved({ id, title }) {
  store.setCurrentById(id);
}

// skapa nytt quiz
function newQuiz() {
  isQuizEditor.value = true;
  useQuizStore.current = null;
  selectedQuiz.value = null;
  quizEditorRef.value?.resetQuiz();
}
</script>

<template>
  <div class="workspace-view">
    <div id="toggle-editor">
      <label class="switch">
        <input type="checkbox" v-model="isQuizEditor" />
        <span class="slider">
          <p id="slider-note" v-bind:class="{ inactive: isQuizEditor }">Note</p>
          <p id="slider-quiz" v-bind:class="{ inactive: !isQuizEditor }">
            Quiz
          </p>
        </span>
      </label>
    </div>

    <NoteEditor
      v-if="!isQuizEditor"
      :note="{ id: 1, title: 'Sample Note', content: 'This is a sample note.' }"
      @save="(note) => console.log('Save note:', note)"
    />

    <!-- Quizeditor -->
    <QuizEditor v-else 
    :quiz="selectedQuiz" 
    ref="quizEditorRef"
    @start="onStart"
    @saved="onSaved" 
    />

    <!-- Quizspelare -->
    <QuizPlayer
      :open="playerOpen"
      :title="playerTitle"
      :questions="playerQuestions"
      @close="playerOpen = false"
    />
  </div>
</template>

<style scoped>
.workspace-view {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(42, 42, 48);
  padding: 1rem;
  overflow: auto;
}

/*_____________Toggle Editor______________________*/

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
  align-content: center;
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
  font-family: "Trebuchet MS", "Lucida Sans Unicode", "Lucida Grande",
    "Lucida Sans", Arial, sans-serif;
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
