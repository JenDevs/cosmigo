<script setup>
import { ref } from 'vue';
import PomodoroTimer from './components/PomodoroTimer.vue'

const showTimer = ref(false);

</script>

<template>
  <header>
    <h1>Cosmigo</h1>
    <!-- Profile with name, level, and cosmigo mascot -->
    <!-- ToDo -->
    <!-- Notes -->
  </header>
  

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

  <PomodoroTimer v-if="showTimer" />

</template>

<style>
html, body {
  background-color: black;
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


button {
  background-color: white;
  border-radius: 50%;
  width: 45px;
  height: 45px;
}

.floatingClockButton {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: white;
  border: 2px solid black;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.clockIcon {
  width: 28px;
  height: 28px;
}

.floatingClockButton img {
  width: 60%;
  height: auto;
}

</style>
