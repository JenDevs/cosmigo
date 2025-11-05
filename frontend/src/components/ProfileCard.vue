<script setup>
import ProgressBar from "primevue/progressbar";
import Cosmigo from "./Cosmigo.vue";
import { useUserStore } from "@/stores/useUserStore";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";

const userStore = useUserStore();
const { username, level, xp, xpToNextLevel, progress } = storeToRefs(userStore);
const { LEVELS, fetchUser } = userStore;

onMounted(() => {
  fetchUser();
});
</script>

<template>
  <div id="profile-card">
    <Cosmigo />

    <p id="username">@{{ username }}</p>

    <ProgressBar :value="progress" class="xp-bar" />

    <div class="stats-row">
      <small id="level">Level: {{ level }}</small>
      <small id="xp">{{ xp }} / {{ LEVELS[level + 1] || xp }} XP</small>
    </div>
  </div>
</template>

<style scoped>
#profile-card {
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

#username {
  align-self: flex-start;
  font-size: 1.2em;
  font-weight: bold;
  margin-bottom: 10px;
  user-select: all;
}

.xp-bar {
  width: 100%;
  margin-bottom: 6px;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.9em;
}
</style>
