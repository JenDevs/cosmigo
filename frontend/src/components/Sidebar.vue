<script setup>
import { ref, nextTick } from "vue";
import ProfileCard from "./ProfileCard.vue";
import TodoList from "./TodoList.vue";
import NoteList from "./NoteList.vue";

import { useNotesStore } from "../stores/useNotesStore";
import { storeToRefs } from "pinia";

const notesStore = useNotesStore();
const { notes } = storeToRefs(notesStore);
const { selectNote, createNote, deleteNote, getFirstMatchIdByTitle } =
  notesStore;

const noteListRef = ref(null);
const searchQuery = ref("");

async function searchAndScroll() {
  const id = getFirstMatchIdByTitle(searchQuery.value);
  if (!id) return;
  await nextTick();
  noteListRef.value?.scrollToNoteId(id);
}
</script>

<template>
  <aside class="sidebar" role="complementary" aria-label="Notes sidebar">
    <ProfileCard />
    <TodoList />

    <!-- Notes -->
    <div class="note-list-container">
      <div class="note-list-header" role="search">
        <input
          class="note-search"
          v-model="searchQuery"
          @keyup.enter="searchAndScroll"
          type="search"
          placeholder="Search titles…"
          aria-label="Search note titles"
        />
        <button class="new-note-btn" @click="createNote" title="New note">
          New
        </button>
      </div>

      <NoteList
        ref="noteListRef"
        :notes="notes"
        @select="selectNote"
        @delete="deleteNote"
      />
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  flex: 0 0 360px;
  min-width: 360px;
  width: 360px;
  background-image:url('/src/assets/images/skyhor3.png');
  background-position: right;
  height: 100%;
  background-color:rgba(13, 9, 27, 0.9);
  padding: 12px;
  gap: 8px;
  min-height: 0;
}

.note-list-container {
  background-color: rgba(255, 255, 255, 0.12);
  padding: 12px;
  border-radius: 8px;
  color: white;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  background-size: cover;
  background-position: right;
  background-repeat: no-repeat;
  filter: brightness(1.2);
}

.note-list-header {
  display: flex;
  margin-bottom: 10px;
  gap: 6px;
}

.new-note-btn {
  background-color: rgb(37, 18, 73);
  color: white;
  flex-grow: 1;
  height: 30px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
}
.new.note-btn:hover {
  background-color: rgb(48, 23, 94);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}
.new-note-btn:active {
  background-color: rgb(61, 31, 117);
  box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.3);
  transition: all 0.1s ease;
}

.note-search {
  flex: 5;
  height: 30px;
  padding: 0 10px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #f2f2f2;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
.note-search::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
.note-search:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.15);
}

@media (max-width: 768px) {
  .sidebar {
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 15px; 
  }
}
</style>
