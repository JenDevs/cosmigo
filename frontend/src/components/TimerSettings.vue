<script setup>
import { reactive } from 'vue'

const props = defineProps({
  userWorkTime: Number,
  userShortBreak: Number,
  userLongBreak: Number,
  longBreakEvery: Number
})

const emit = defineEmits(['apply', 'close'])

const tempValues = reactive ( {
  work: props.userWorkTime,
  short: props.userShortBreak,
  long: props.userLongBreak,
  every: props.longBreakEvery
})

function applySettings() {
  const isValid =
    tempValues.work >= 1 && tempValues.work <= 120 &&
    tempValues.short >= 1 && tempValues.short <= 120 &&
    tempValues.long >= 1 && tempValues.long <= 120 &&
    tempValues.every >= 1 && tempValues.every <= 10

  if(!isValid) {
    alert('Please enter valid values(work/breaks: 1-120 min, session: 1-10)')
  }
  
  emit('apply', tempValues
  )
}
</script>

<template>
  <div class="settingsFields">
    <h3>Settings</h3>
    <label>Work: <input type="number" v-model.number="tempValues.work" min="1" /></label>
    <label>Short break: <input type="number" v-model.number="tempValues.short" min="1" /></label>
    <label>Long break: <input type="number" v-model.number="tempValues.long" min="1" /></label>
    <label>Long break every: <input type="number" v-model.number="tempValues.every" min="1" /></label>
    <div class="settingsButtons">
      <button @click="applySettings">Apply</button>
      <button @click="emit('close')">Back</button>
    </div>
  </div>
</template>

<style scoped>
.settingsFields {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  width: 100%;
  height: 100%;
  font-size: 1rem;
  padding: 0.4rem 0.6rem;
  box-sizing: border-box;
}

.settingsFields h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #4A3F3A;
}

.settingsFields label {
  display: flex;
  justify-content: space-between;
  width: 95%;
  font-size: 1rem;
  color: #4A3F3A;
}

.settingsFields input {
  width: 60px;
  font-size: 1rem;
  text-align: center;
  border: 2px solid #B8A79C;
  border-radius: 6px;
  background: #f7f6f3;
  color: #000000;
}

.settingsButtons {
  display: flex;
  justify-content: center;
  gap: 0.6rem;
  margin-top: 0.4rem;
}

.settingsButtons button {
  background: white;
  border: 2px solid #4A3F3A;
  border-radius: 6px;
  font-size: 0.9rem;
  padding: 0.15rem 0.8rem;
  cursor: pointer;
  color: #4A3F3A;
  min-width: 70px;
  height: 30px;
}

.settingsButtons button:hover {
  background: #B8A79C;
}
</style>

