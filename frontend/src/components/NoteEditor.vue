<script setup>
import { ref, watch } from "vue";
import { useNotesStore } from "../stores/useNotesStore";
import { computed } from "vue";

const notesStore = useNotesStore();
const activeNote = computed(() => notesStore.activeNote);

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

const props = defineProps({
  note: {
    type: Object,
    default: null,
  },
});
//_______________________________________________________________________
import { onBeforeUnmount } from "vue";
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
    // watch title/content of the current note
    stopContentWatch = watch(
      () => [newNote.title, newNote.content],
      () => {
        if (saveTimer) clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
          // pass copy to avoid mutating during save
          notesStore.updateNote({ ...newNote });
        }, 1000);
      },
      { deep: false }
    );
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  stopCurrentNoteWatch();
});
</script>

<template>
  <div v-if="activeNote" class="note-editor">
    <input
      class="title-input"
      type="text"
      v-model="activeNote.title"
      placeholder="Untitled"
    />
    <textarea class="content-area" v-model="activeNote.content" />
    <p class="last-saved">Last saved at: {{ savedAtText }}</p>
  </div>

  <!-- <div v-else class="no-note">
    <p>Select or create a note to begin.</p>
  </div> -->
</template>

<style scoped>
.note-editor {
  display: flex;
  flex-direction: column;
  background-color: rgb(86, 86, 92);
  border-radius: 8px;
  gap: 10px;
  margin: 120px 0 0 0;
  padding: 16px;
  width: 80%;
  height: 80%;
}

.title-input {
  font-size: 1.2rem;
  padding: 8px;
  border: none;
  border-bottom: 2px solid #ccc;
  background: transparent;
  color: white;
}

.content-area {
  flex: 1;
  resize: none;
  padding: 10px;
  background-color: rgb(63, 63, 70);
  color: white;
  border-radius: 6px;
  border: none;
  font-family: inherit;
}

.last-saved {
  font-size: 0.85rem;
  color: #ccc;
  text-align: right;
}
</style>
