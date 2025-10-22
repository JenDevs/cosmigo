

<script setup>
import Sidebar from "./components/Sidebar.vue";
import Workspace from "./components/Workspace.vue";
</script>

<template>
  <div class="layout">
    <Sidebar />
    <Workspace />
  </div>
</template>

<style>
html,
body {
  background-color: rgb(99, 99, 99);
  margin: 0;
  padding: 0;
  min-height: 100%;
  display: block;
}

.layout {
  display: flex;
  width: 100vw;
  height: 100%;
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
