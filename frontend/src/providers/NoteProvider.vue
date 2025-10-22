<script setup>
import { ref, provide } from "vue";
const notes = ref([
  { id: 1, title: "Note 1", content: "Content for Note 1" },
  { id: 2, title: "Note 2", content: "Content for Note 2" },
  { id: 3, title: "Note 3", content: "Content for Note 3" },
]);
const activeNote = ref(null);

const selectNote = (id) => {
  activeNote.value = notes.value.find((note) => note.id === id);
};

provide("activeNote", activeNote);
provide("selectNote", selectNote);
</script>

<template>
  <slot />
</template>
