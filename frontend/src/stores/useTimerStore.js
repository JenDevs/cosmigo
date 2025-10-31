import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/useUserStore";

export const useTimerStore = defineStore("timer", () => {
  const state = ref("Idle");
  const sessionCount = ref(0);
  const isRunning = ref(false);
  let timerInterval = null;
  const isCritical = ref(false);

  const selectedWorkTime = ref(25 * 60);
  const remainingTime = ref(selectedWorkTime.value);
  const shortBreak = ref(5 * 60);
  const longBreak = ref(8 * 60);

  const userWorkTime = ref(25);
  const userLongBreak = ref(60);
  const userShortBreak = ref(5);
  const longBreakEvery = ref(4);

  const error = ref(null);
  const pomodoroList = ref([]);
  const loading = ref(false);
  const data = ref(null);

  let currentSessionStart = null;
  let currentSessionEnd = null;

  const showSettings = ref(false);

  const formattedTime = computed(() => {
    let remaining = remainingTime.value;
    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    return `${minutes}:${seconds}`;
  });

  const TIMER_STATES = {
    IDLE: "Idle",
    WORK: "Work",
    SHORT_BREAK: "Short break",
    LONG_BREAK: "Long break",
  };

  const userStore = useUserStore();

  function initTimer() {
    loadFromLocalStorage();
    fetchPomodoro();
  }

  function userSettings(values) {
    userWorkTime.value = values.work;
    userShortBreak.value = values.short;
    userLongBreak.value = values.long;
    longBreakEvery.value = values.every;
    selectedWorkTime.value = userWorkTime.value * 60;
    shortBreak.value = userShortBreak.value * 60;
    longBreak.value = userLongBreak.value * 60;
    remainingTime.value = selectedWorkTime.value;
    saveToLocalStorage();
    showSettings.value = false;
  }

  function startTimer() {
    if (isRunning.value) return;
    if (state.value === TIMER_STATES.IDLE) {
      state.value = TIMER_STATES.WORK;
      currentSessionStart = new Date();
    }

    if (remainingTime.value === 0 && state.value === TIMER_STATES.IDLE) {
      remainingTime.value = selectedWorkTime.value;
      state.value = TIMER_STATES.WORK;
    }

    isRunning.value = true;
    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
  }

  function pauseTimer() {
    if (!isRunning.value) return;
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning.value = false;
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning.value = false;

    if (state.value === TIMER_STATES.WORK)
      remainingTime.value = selectedWorkTime.value;
    else if (state.value === TIMER_STATES.SHORT_BREAK)
      remainingTime.value = shortBreak.value;
    else if (state.value === TIMER_STATES.LONG_BREAK)
      remainingTime.value = longBreak.value;

    criticalState();
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning.value = false;
    isCritical.value = false;
    state.value = TIMER_STATES.IDLE;
    sessionCount.value = 0;
    localStorage.removeItem("savedPomodoroData");
    resetUserSettings();
    saveToLocalStorage();
  }

  function resetUserSettings() {
    userWorkTime.value = 25;
    userShortBreak.value = 5;
    userLongBreak.value = 60;
    longBreakEvery.value = 4;
    selectedWorkTime.value = userWorkTime.value * 60;
    shortBreak.value = userShortBreak.value * 60;
    longBreak.value = userLongBreak.value * 60;
    remainingTime.value = selectedWorkTime.value;
  }

  function tick() {
    if (!isRunning.value) return;
    remainingTime.value -= 1;
    if (remainingTime.value % 10 === 0 || remainingTime.value === 0) {
      saveToLocalStorage();
    }

    if (remainingTime.value <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning.value = false;
      handleTimerFinish();
      return;
    }

    criticalState();
  }

  function criticalState() {
    isCritical.value =
      isRunning.value && remainingTime.value <= 10 && remainingTime.value > 0;
  }

  function handleTimerFinish() {
    clearInterval(timerInterval);
    timerInterval = null;
    isCritical.value = false;
    currentSessionEnd = new Date();

    if (state.value === TIMER_STATES.WORK) {
      sessionCount.value++;
      createPomodoro().catch((err) =>
        console.warn("Could not save pomodoro", err)
      );

      if (sessionCount.value % 3 === 0) {
        userStore.addXP("pomodoroStreak");
      } else {
        userStore.addXP("pomodoro");
      }

      if (sessionCount.value % longBreakEvery.value === 0) {
        state.value = TIMER_STATES.LONG_BREAK;
        remainingTime.value = longBreak.value;
      } else {
        state.value = TIMER_STATES.SHORT_BREAK;
        remainingTime.value = shortBreak.value;
      }
    } else {
      state.value = TIMER_STATES.WORK;
      remainingTime.value = selectedWorkTime.value;
      currentSessionStart = new Date();
    }

    isRunning.value = true;
    timerInterval = setInterval(tick, 1000);
    criticalState();
  }

  function saveToLocalStorage() {
    const saveData = {
      statetype: state.value,
      time: remainingTime.value,
      sessions: sessionCount.value,
      userWorkTime: userWorkTime.value,
      userShortBreak: userShortBreak.value,
      userLongBreak: userLongBreak.value,
      longBreakEvery: longBreakEvery.value,
    };

    localStorage.setItem("savedPomodoroData", JSON.stringify(saveData));
  }

  function loadFromLocalStorage() {
    const data = localStorage.getItem("savedPomodoroData");

    if (!data) return;
    const saved = JSON.parse(data);
    userWorkTime.value = saved.userWorkTime ?? 25;
    userShortBreak.value = saved.userShortBreak ?? 5;
    userLongBreak.value = saved.userLongBreak ?? 60;
    longBreakEvery.value = saved.longBreakEvery ?? 4;
    selectedWorkTime.value = userWorkTime.value * 60;
    shortBreak.value = userShortBreak.value * 60;
    longBreak.value = userLongBreak.value * 60;
    state.value = saved.statetype || TIMER_STATES.IDLE;
    sessionCount.value = saved.sessions ?? 0;
    remainingTime.value = saved.time ?? selectedWorkTime.value;
    criticalState();
  }

  async function createPomodoro() {
    if (!currentSessionStart || !currentSessionEnd) return;

    const startTime = currentSessionStart
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    const endTime = currentSessionEnd
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    const durationInSeconds = Math.max(
      0,
      Math.round((currentSessionEnd - currentSessionStart) / 1000)
    );

    try {
      const res = await fetch("http://localhost:3000/api/pomodoro/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionType: state.value,
          duration: durationInSeconds,
          completed: 1,
          startTime,
          endTime,
          pomodoroUserId: 1,
        }),
      });
      if (!res.ok) throw new Error("Could not add pomodoro");
      data.value = await res.json();
      await fetchPomodoro();
    } catch (err) {
      error.value = err.message;
    }
  }

  async function fetchPomodoro() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch("http://localhost:3000/api/pomodoro");
      if (!res.ok) throw new Error("Could not fetch pomodoros");
      data.value = await res.json();
      pomodoroList.value = data.value.pomodoros;
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  return {
    state,
    sessionCount,
    isCritical,
    formattedTime,
    showSettings,
    userWorkTime,
    userShortBreak,
    userLongBreak,
    longBreakEvery,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    userSettings,
    createPomodoro,
    fetchPomodoro,
    initTimer,
    saveToLocalStorage,
  };
});
