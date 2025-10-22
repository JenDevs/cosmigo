<script setup>
import { ref, inject } from "vue";
import ProfileCard from "./ProfileCard.vue";
//import TodoList from "./TodoList.vue";
import NoteList from "./NoteList.vue";
import { useNotesStore } from "../stores/useNotesStore";
import { storeToRefs } from "pinia";

const notesStore = useNotesStore();
const { notes } = storeToRefs(notesStore);

const { selectNote, createNote, deleteNote } = notesStore;
</script>

<template>
  <aside class="sidebar">
    <ProfileCard />
    <!-- <TodoList /> -->
    <div class="note-list-container">
      <button class="new-note-btn" @click="createNote">New Note</button>
      <NoteList
        :notes="notes"
        @select="selectNote"
        @new-note="createNote"
        @delete="deleteNote"
      />
    </div>
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

.new-note-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px 20px;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.note-list-container {
  background-color: rgba(255, 255, 255, 0.12);
  padding: 12px;
  border-radius: 8px;
  color: white;
}
</style>
