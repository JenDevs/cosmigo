<script setup>
import ProfileCard from "./ProfileCard.vue";
//import TodoList from "./TodoList.vue";
//import NoteList from "./NoteList.vue";
</script>

<template>
  <aside class="sidebar">
    <ProfileCard />
    <!-- <TodoList /> -->
    <!-- <NoteList /> -->
  </aside>
</template>

<style scoped>
.sidebar {
  display: flex;
  width: 300px;
  height: 100vh;
  background-color: rgb(63, 63, 70);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
