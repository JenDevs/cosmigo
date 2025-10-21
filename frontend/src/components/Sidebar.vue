<script setup>
import { ref } from "vue";
import ProfileCard from "./ProfileCard.vue";
import TodoList from "./TodoList.vue";
import NoteList from "./NoteList.vue";

const notes = ref([
  { id: 1, title: "Note 1", content: "Content for Note 1" },
  { id: 2, title: "Note 2", content: "Content for Note 2" },
  { id: 3, title: "Note 3", content: "Content for Note 3" },
]);

const deleteNote = (id) => {
  notes.value = notes.value.filter((note) => note.id !== id);
};
</script>

<template>
  <aside class="sidebar">
    <ProfileCard />
    <TodoList />
    <NoteList :notes="notes" @delete="deleteNote" />
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 300px;
  height: 100vh;
  background-color: rgb(63, 63, 70);
  padding: 12px;
  display: flex;
  gap: 12px;
}

.note-list {
  margin-top: auto;
}
</style>
