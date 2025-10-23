<script setup>
import { ref, watch } from "vue";
import { useNotesStore } from "../stores/useNotesStore";
import { computed } from "vue";

const notesStore = useNotesStore();
const activeNote = computed(() => notesStore.activeNote);

const props = defineProps({
  note: {
    type: Object,
    default: null,
  },
});

const title = ref();
const content = ref();
const savedAt = ref(null);

watch(
  () => props.note,
  (newNote) => {
    if (newNote) {
      title.value = newNote.title;
      content.value = newNote.content;
      savedAt.value = new Date();
    } else {
      title.value = "";
      content.value = "";
      savedAt.value = null;
    }
  },
  { immediate: true }
);
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
    <button @click="$emit('save', activeNote)">Save</button>
    <p>Last saved at: {{ savedAt }}</p>
  </div>

  <div v-else class="no-note">
    <p>Select or create a note to begin.</p>
  </div>
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

button {
  align-self: flex-start;
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #005dc0;
}
</style>
