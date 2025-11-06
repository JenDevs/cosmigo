import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { useCosmigoStore } from "@/stores/useCosmigoStore";

export const useUserStore = defineStore("user", () => {
  const userId = 1;
  const username = ref("");
  const xp = ref(0);
  const level = ref(1);

  const XP_REWARD = {
    todo: 50,
    pomodoro: 20,
    pomodoroStreak: 100,
    quiz: 50,
  };

  const LEVELS = {
    1: 0,
    2: 300,
    3: 1200,
    4: 3000,
    5: 6600,
    6: 13800,
    7: 28200,
    8: 57000,
  };

  const xpToNextLevel = computed(() => {
    const nextLevel = level.value + 1;
    if (!LEVELS[nextLevel]) return null;
    return Math.max(LEVELS[nextLevel] - xp.value, 0);
  });

  const progress = computed(() => {
    const currentLevel = LEVELS[level.value];
    const nextLevel = LEVELS[level.value + 1];
    if (!nextLevel) return 100;
    const levelProgress = xp.value - currentLevel;
    const levelRange = nextLevel - currentLevel;
    const ratio = levelProgress / levelRange;
    return Math.round(Math.min(Math.max(ratio * 100, 0), 100));
  });

  function loadFromLocalStorage() {
    const savedXp = localStorage.getItem("xp");
    const savedLevel = localStorage.getItem("level");
    if (savedXp) {
      const parsed = Number(savedXp);
      if (Number.isFinite(parsed) && parsed >= 0) xp.value = parsed;
    }
    if (savedLevel) {
      const parsed = Number(savedLevel);
      if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 8) {
        level.value = parsed;
      }
    }
  }

  watch([xp, level], () => {
    localStorage.setItem("xp", xp.value);
    localStorage.setItem("level", level.value);
  });

  async function fetchUser() {
    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user");
      const savedData = await response.json();
      if (savedData.success && savedData.user) {
        username.value = savedData.user.userName;
        level.value = savedData.user.userLevel;
        xp.value = savedData.user.userExperience;
      } else {
        console.warn("Unexpected response", savedData);
      }
    } catch (err) {
      console.error("Could not fetch user", err);
    }
  }

  async function addXP(activity) {
    if (!XP_REWARD[activity]) {
      console.warn(
        `Invalid activity "${activity}". Must be one of: ${Object.keys(
          XP_REWARD
        ).join(", ")}`
      );
      return { success: false, error: "Invalid activity" };
    }

    const xpGained = XP_REWARD[activity];
    const prevLevel = level.value;

    try {
      const res = await fetch(
        `http://localhost:3000/api/users/${userId}/addxp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ xpGained }),
        }
      );
      if (!res.ok) throw new Error("Failed to add XP");

      const savedData = await res.json();
      xp.value = savedData.userExperience;
      level.value = savedData.userLevel;

      const leveledUp = level.value > prevLevel;

      if (leveledUp) {
        const cosmigo = useCosmigoStore();
        for (let lv = prevLevel + 1; lv <= level.value; lv++) {
          await cosmigo.grantLevelRewards(lv);
        }
        cosmigo.onLevelUp();
      }

      return { success: true, leveledUp, newLevel: level.value };
    } catch (err) {
      console.error("Failed to add XP:", err);
      return { success: false, error: err.message };
    }
  }

  return {
    userId,
    username,
    xp,
    level,
    XP_REWARD,
    LEVELS,
    xpToNextLevel,
    progress,
    loadFromLocalStorage,
    fetchUser,
    addXP,
  };
});
