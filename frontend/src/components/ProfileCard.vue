<script setup>
import ProgressBar from "primevue/progressbar";
import Cosmigo from "./Cosmigo.vue";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import axios from "axios";

const userStore = useUserStore();
const { username, level, xp, xpToNextLevel, progress } = storeToRefs(userStore);
const { LEVELS, fetchUser } = userStore;

// popup (statestik)
const showStats = ref(false);
const stats = ref(null);
const loading = ref(false);
const error = ref(null);

onMounted(() => {
  fetchUser();
});

//hämta statestik från backend
async function fetchStats() {
  try {
    loading.value = true;
    error.value = null;
    const res = await axios.get(
      `http://localhost:3000/api/statistics/${userStore.userId}`
    );
    stats.value = res.data;
  } catch (err) {
    console.error(err);
    error.value = "Could not get stats";
  } finally {
    loading.value = false;
  }
}

function openStats() {
  showStats.value = true;
  fetchStats();
}
</script>

<template>
  <div id="profile-card">
    <Cosmigo />

    <div class="user-stats">
      <p id="username">@{{ username }}</p>
      <button @click="openStats" class="statButton">
        <img
          src="@/assets/icons/badge-info.svg"
          alt="Show stats"
          class="statsIcon"
        />
      </button>
    </div>

    <ProgressBar :value="progress" class="xp-bar" />

    <div class="stats-row">
      <small id="level">Level: {{ level }}</small>
      <small id="xp">{{ xp }} / {{ LEVELS[level + 1] || xp }} XP</small>
    </div>

    <!-- Popup -->
    <div v-if="showStats" class="overlay" @click.self="showStats = false">
      <div class="modal">
        <h3>My Stats</h3>

        <div v-if="loading">Loading...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="stats">
          <p><strong>Pomodoros:</strong> {{ stats.totalPomodoro }}</p>
          <p><strong>Todos:</strong> {{ stats.completedTodos }}</p>
          <p><strong>Quiz:</strong> {{ stats.completedQuizzes }}</p>
        </div>

        <button @click="showStats = false" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
#profile-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  color: white;
  user-select: none;
}

#avatar {
  width: 50%;
  margin-bottom: 10px;
}

.user-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 6px;
}

#username {
  align-self: flex-start;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  user-select: all;
}

/* statbutton */
.statButton {
  background-color: rgba(197, 187, 209, 0.9);
  border: 2px solid black;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.statButton:hover {
  transform: scale(1.035);
  background-color: rgb(204, 193, 216);
}

/* XP-bar */
.xp-bar {
  width: 100%;
  margin-bottom: 6px;
  background-color: rgba(0,0,0, 0.2);
}
.xp-bar:deep(.p-progressbar-value){ 
  background:#a782fd; 
}
.xp-bar:deep(.p-progressbar){ 
  background:rgba(255,255,255,.12); 
}
.xp-bar:deep(.p-progressbar-label){ 
  color:#fff; 
}


.stats-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.9em;
}

/* Modal overlay */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Modal box */
.modal {
  background: rgb(36, 28, 51);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 300px;
  text-align: center;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
  animation: fadeIn 0.3s ease;
}

.close-btn {
  margin-top: 1rem;
  background-color: rgb(37, 18, 73);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.close-btn:hover {
  background-color: rgb(55, 32, 97);
}

.error {
  color: #ff6b6b;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
