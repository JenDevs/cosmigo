

<script setup>
import { ref } from 'vue';
import PomodoroTimer from './components/PomodoroTimer.vue'
import Sidebar from "./components/Sidebar.vue";
import Workspace from "./components/Workspace.vue";

const showTimer = ref(false);

</script>

<template>

  <div class="layout">
    <Sidebar />
    <Workspace />
  </div>

  <div v-if="showTimer" class="timer-wrapper">
    <PomodoroTimer />
  </div>
  
  
    <button @click="showTimer = !showTimer" class="floatingClockButton">
    <img
      v-if="!showTimer"
      src="@/assets/icons/alarm-clock.svg"
      alt="Show timer"
      class="clockIcon"
    />
    <img
      v-else
      src="@/assets/icons/alarm-clock-off.svg"
      alt="Hide timer"
      class="clockIcon"
    />
  </button>

  

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
  overflow: visible;
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


button {
  background-color: white;
}

.floatingClockButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border: 2px solid black;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clockIcon {
  width: 35px;
  height: 35px;
}

.floatingClockButton img {
  width: 70%;
  height: auto;
}

.timer-wrapper {
  position: fixed;
  top: 16px;       
  right: 16px;    
  z-index: 999999; 
  background: none;
  padding: 0;
  margin: 0;
  pointer-events: auto;
  display: inline-block;
}

</style>
