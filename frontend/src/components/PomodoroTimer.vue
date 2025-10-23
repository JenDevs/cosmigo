<script setup>
import TimerDisplay from './TimerDisplay.vue'
import TimerControls from './TimerControls.vue'
import TimerSettings from './TimerSettings.vue'
import { useTimerStore } from '../stores/useTimerStore.js'

const timer = useTimerStore()
</script>

<template>
  <div class="timeWrapper">
    <div class="timerCard">
      
      <template v-if="!timer.showSettings">
        <TimerDisplay
          :formatted-time="timer.formattedTime"
          :state="timer.state"
          :session-count="timer.sessionCount"
          :is-critical="timer.isCritical"
        />
        <TimerControls
          @start="timer.startTimer"
          @pause="timer.pauseTimer"
          @stop="timer.stopTimer"
          @reset="timer.resetTimer"
          @open-settings="timer.showSettings = true"
        />
      </template>

      
      <TimerSettings
        v-else
        :user-work-time="timer.userWorkTime"
        :user-short-break="timer.userShortBreak"
        :user-long-break="timer.userLongBreak"
        :long-break-every="timer.longBreakEvery"
        @apply="timer.userSettings"
        @close="timer.showSettings = false"
      />
    </div>
  </div>
</template>

<style scoped>
.timeWrapper {
  display: block;
  margin: 0;
  padding: 0;
  min-height: auto;
  position: static;
}

.timerCard {
  width: 260px;
  height: 200px;
  background: #EEECE8;
  color: #4A3F3A;
  border-radius: 1.2rem;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.8rem;
  text-align: center;
  transition: all 0.3s ease;
}

.timer-critical {
  color: #d32f2f !important;
  animation: blink 1s infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}
</style>
