<script setup>
const emit = defineEmits(['start', 'pause', 'stop', 'reset', 'open-settings'])
</script>

<template>
  <div class="buttonRow">
    <button @click="emit('start')"><img src="@/assets/icons/play.svg" alt="Start" /></button>
    <button @click="emit('pause')"><img src="@/assets/icons/pause.svg" alt="Pause" /></button>
    <button @click="emit('stop')"><img src="@/assets/icons/square.svg" alt="Stop" /></button>
    <button @click="emit('reset')"><img src="@/assets/icons/rotate-ccw.svg" alt="Reset" /></button>
  </div>
  <button class="settingsToggle" @click="emit('open-settings')">Settings</button>
</template>

<style scoped>
.buttonRow {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.buttonRow button {
  background: rgba(248, 247, 248, 0.973);
  border: 2px solid #4A3F3A;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  transition: 0.2s;
}

.buttonRow button:hover {
  background: #B8A79C;
}

.buttonRow img {
  width: 75%;
  height: auto;
}

.settingsToggle {
  font-size: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  margin-top: 0.6rem;
  display: block;
  width: 100%;
  text-align: center;
  color: #4A3F3A;
  font-weight: 500;
  transition: color 0.2s ease;
}
</style>

