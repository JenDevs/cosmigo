<script setup>
import { onBeforeUnmount, watch, computed } from "vue";
import { useNotesStore } from "../stores/useNotesStore";
import Editor from "primevue/editor";

const notesStore = useNotesStore();
const activeNote = computed(() => notesStore.activeNote);
const closeNote = () => {
  notesStore.activeNote = null;
};
const formats = ["bold", "italic", "underline", "size", "align"];

const savedAt = computed(() =>
  activeNote.value ? activeNote.value.updatedAt : null
);
const savedAtText = computed(() => {
  if (!savedAt.value) return "—";
  const d =
    typeof savedAt.value === "number"
      ? new Date(savedAt.value)
      : new Date(String(savedAt.value));
  return d.toLocaleString();
});

let saveTimer = null;
let stopContentWatch = null;
const stopCurrentNoteWatch = () => {
  if (stopContentWatch) {
    stopContentWatch();
    stopContentWatch = null;
  }
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
};

watch(
  () => notesStore.activeNote,
  (newNote) => {
    stopCurrentNoteWatch();
    if (!newNote) return;
    stopContentWatch = watch(
      () => [newNote.title, newNote.content],
      () => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(
          () => notesStore.updateNote({ ...newNote }),
          1000
        );
      },
      { deep: false }
    );
  },
  { immediate: true }
);

onBeforeUnmount(stopCurrentNoteWatch);
</script>

<template>
  <div v-if="activeNote" class="note-editor">
    <div class="note-header">
      <input
        class="title-input"
        type="text"
        v-model="activeNote.title"
        placeholder="Untitled"
      />
      <button id="close-note-btn" @click="closeNote" aria-label="close note">
        ×
      </button>
    </div>
    <Editor v-model="activeNote.content" :formats="formats">
      <template #toolbar>
        <span class="ql-formats">
          <select class="ql-size" aria-label="Font size">
            <option value="small"></option>
            <option selected></option>
            <!-- default normal -->
            <option value="large"></option>
            <option value="huge"></option>
          </select>
          <button class="ql-bold" aria-label="Bold"></button>
          <button class="ql-italic" aria-label="Italic"></button>
          <button class="ql-underline" aria-label="Underline"></button>
          <select class="ql-align" aria-label="Text alignment">
            <option selected></option>
            <!-- default left -->
            <option value="center"></option>
            <option value="right"></option>
            <option value="justify"></option>
          </select>
        </span>
        <p class="last-saved">autosaved: {{ savedAtText }}</p>
      </template>
    </Editor>
  </div>

  <div v-else class="no-note">
    <p>Select or create a note to begin.</p>
  </div>
</template>

<style scoped>
/* :deep makes toolbar and editor override primeVue dark theme */
:deep(.p-editor) {
  height: 90%;
  border: none;
}
:deep(.p-editor .ql-toolbar) {
  display: flex;
  align-items: center;
  padding: 0 12px 0 12px;
  background: #f7f7f8;
  border-radius: 0;
}
:deep(.p-editor .ql-toolbar .ql-picker-label),
:deep(.p-editor .ql-toolbar button) {
  color: #a7a7a7;
  border-radius: 4px;
}
:deep(.p-editor .ql-toolbar button:hover),
:deep(.p-editor .ql-toolbar .ql-picker-label:hover) {
  background: rgba(0, 0, 0, 0.4);
}

:deep(.p-editor .ql-container) {
  background: #ffffff;
  border: 1px solid #d8d8dd;
  border-top: none;
  border-radius: 0 0 6px 6px;
}
:deep(.p-editor .ql-editor) {
  color: #2e2e2e;
  font-family: inherit;
  min-height: 280px;
}
:deep(.p-editor .ql-toolbar),
:deep(.p-editor .ql-container) {
  border: 0 !important;
  box-shadow: none;
  outline: none;
}

:deep(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="small"]::before) {
  content: "Small";
}
:deep(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="large"]::before) {
  content: "Large";
}
:deep(.ql-snow .ql-picker.ql-size .ql-picker-item[data-value="huge"]::before) {
  content: "Huge";
}
:deep(.ql-snow .ql-picker.ql-size .ql-picker-item::before) {
  content: "Normal";
}

.note-editor {
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  margin: 0;
  padding: 12px;
  width: 80%;
  max-width: 900px;
  height: 90%;
  max-height: 100vh;
  overflow: hidden;
}
.note-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: white;
  border-radius: 8px 8px 0 0;
}
.title-input {
  flex: 1;
  font-size: 1.2rem;
  padding: 8px 12px;
  border-radius: 8px 8px 0 0;
  background: white;
  color: rgb(104, 104, 104);
  border: none;
}
.title-input:focus {
  color: rgb(0, 0, 0);
  outline: none;
}
.title-input:hover {
  border: #222;
}

#close-note-btn {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  margin-right: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  background: rgba(0, 0, 0, 0.2);
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: background 150ms;
}
#close-note-btn:hover {
  background: rgb(255, 56, 56);
  color: white;
  transition: all 150ms;
  scale: 1.1;
}
#close-note-btn:active {
  scale: 0.95;
}
.last-saved {
  display: inline;
  margin-left: auto;
  user-select: none;
  padding-left: auto;
  font-size: 0.85rem;
  font-weight: 600;
  color: #969696;
  text-align: right;
}
</style>
