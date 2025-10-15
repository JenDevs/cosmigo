<script setup>
import Sidebar from "./components/Sidebar.vue";
import WorkspaceView from "./components/Workspace.vue";
</script>

<template>
  <div class="layout">
    <Sidebar />
    <WorkspaceView />
  </div>
</template>

<style>
html,
body {
  background-color: rgb(99, 99, 99);
  margin: 0;
  padding: 0;
  max-height: 100vh;
}

.layout {
  display: flex;
  height: 100vh;
  width: 100vw;
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
