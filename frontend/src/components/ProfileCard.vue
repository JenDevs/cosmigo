<script setup>
import ProgressBar from "primevue/progressbar";
import Cosmigo from "./Cosmigo.vue";
</script>

<template>
  <div id="profile-card">
    <Cosmigo />
    <!-- Old hardcoded avatar
    <img
      id="avatar"
      src="../assets/images/cosmigo_happiness.png"
      alt="Avatar"
    /> -->
    <p id="username">@Username</p>

    <ProgressBar :value="50" class="xp-bar" />

    <div class="stats-row">
      <small id="level">Level: 3</small>
      <small id="xp">50 / 100 XP</small>
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
