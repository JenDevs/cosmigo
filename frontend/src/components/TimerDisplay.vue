<script setup>
const props = defineProps({
  formattedTime: String,
  state: String,
  sessionCount: Number,
  isCritical: Boolean
})
</script>

<template>
  <div class="timerDisplay">
    <h1 :class="{ 'timer-critical': isCritical }">{{ formattedTime }}</h1>
    <p class="stateLabel">{{ state }}</p>
    <p class="sessionLabel">Sessions: {{ sessionCount }}</p>
  </div>
</template>

<style scoped>
.timerDisplay {
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
}

.timerDisplay h1 {
  font-size: 2.6rem;
  margin: 0.1rem 0 0.3rem;
  font-weight: 700;
  color: #000;
}

.stateLabel {
  font-size: 1.1rem;
  margin: 0.1rem 0 0;
}

.sessionLabel {
  font-size: 1rem;
  opacity: 0.8;
  margin: 0;
}
</style>
