<script setup>
import { useNotesStore } from "../stores/useNotesStore";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import NoteEditor from "./NoteEditor.vue";
//import QuizEditor from './QuizEditor.vue';

const notesStore = useNotesStore();
const { activeNote } = storeToRefs(notesStore);

const isQuizEditor = ref(false);
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
      :note="activeNote"
      @save="(note) => notesStore.updateNote(note)"
    />
    <!-- <QuizEditor v-else /> -->
  </div>
</template>

<style scoped>
.workspace-view {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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
