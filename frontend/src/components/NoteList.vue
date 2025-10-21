<script setup>
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
    <ul>
      <NoteItem
        v-for="note in notes"
        v-bind:key="note.id"
        v-bind:note="note"
        v-on:select="emit('select', note.id)"
        v-on:delete="emit('delete', note.id)"
      />
    </ul>
  </div>
</template>

<style scoped>
.note-list ul {
  width: 100%;
  padding: 0;
  margin: 0;
}
</style>
