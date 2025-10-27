<script setup>
import { defineProps, defineEmits } from "vue";
import NoteItem from "./NoteItem.vue";

const props = defineProps({
  notes: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["delete", "new-note", "select"]);
</script>

<template>
  <div class="note-list">
    <ul role="list" aria-label="List of notes">
      <NoteItem
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @select="emit('select', $event)"
        @delete="emit('delete', $event)"
      />
    </ul>
  </div>
</template>

<style scoped>
.note-list ul {
  display: grid;
  grid-template-columns: repeat(2, 120px);
  gap: 6px 6px;
  justify-content: center;
  justify-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
