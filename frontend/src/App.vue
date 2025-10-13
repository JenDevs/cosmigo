<script setup>
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
  <Sidebar />
  <!-- <router-view /> -->
</template>

<style>
html,
body {
  background-color: rgb(99, 99, 99);
  margin: 0;
  padding: 0;
  max-height: 100vh;
}
h1 {
  color: white;
  text-align: center;
  font-size: 3rem;
  margin: 0;
  padding: 1rem;
}

header {
  line-height: 1.5;
}
</style>
