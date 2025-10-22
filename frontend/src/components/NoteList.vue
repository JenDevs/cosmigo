<script setup>
import { defineProps, defineEmits, onMounted } from "vue";
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
        :note="note"
        @select="emit('select', $event)"
        @delete="emit('delete', $event)"
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
