<script setup>
import NoteItem from "./NoteItem.vue";

const props = defineProps({
  notes: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["delete"]);

const deleteNote = (id) => {
  emit("delete", id);
};
</script>

<template>
  <div class="note-list">
    <ul>
      <NoteItem
        v-for="note in notes"
        :key="note.id"
        :note="note"
        @delete="deleteNote"
      />
    </ul>
  </div>
</template>

<style scoped>
.note-list {
  background-color: rgba(255, 255, 255, 0.12);
  padding: 12px;
  border-radius: 8px;
  color: white;
}
.note-list ul {
  width: 100%;
  padding: 0;
  margin: 0;
}
</style>
