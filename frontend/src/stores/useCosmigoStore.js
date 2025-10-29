import { defineStore } from "pinia";
import { ref } from "vue";

export const useCosmigoStore = defineStore("cosmigo", () => {
  const mockUserId = 1;
  const unlocked = ref([]);
  const equippedKey = ref(null);

  // Temp animation state
  let tempTimer = null;
  const tempActive = ref(false);
  const baseKey = ref(null);
  let lastTempAt = 0;
  const DEFAULT_COOLDOWN = 800;

  function endTemp() {
    if (tempTimer) {
      clearTimeout(tempTimer);
      tempTimer = null;
    }
    if (tempActive.value) {
      equippedKey.value = baseKey.value;
      tempActive.value = false;
      baseKey.value = null;
    }
  }

  async function fetchProfile() {
    try {
      const res = await fetch(`/api/users/${mockUserId}/cosmigo`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      unlocked.value = data.unlocked ?? [];
      equippedKey.value = data.equippedKey ?? null;
    } catch (err) {
      console.error("Failed to fetch Cosmigo profile:", err);
    }
  }

  async function unlock(key) {
    // skip if already unlocked
    if (unlocked.value.includes(key)) return;

    // optimistic update
    unlocked.value.push(key);

    try {
      const res = await fetch(`/api/users/${mockUserId}/cosmigo/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      unlocked.value = data.unlocked ?? [];
    } catch (err) {
      console.error("Unlock failed:", err);
      // rollback
      unlocked.value = unlocked.value.filter((k) => k !== key);
    }
  }

  async function equip(key) {
    const previous = equippedKey.value;
    equippedKey.value = key;
    try {
      const res = await fetch(`/api/users/${mockUserId}/cosmigo/equip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Equip failed:", err);
      equippedKey.value = previous; // rollback
    }
  }

  function hasKey(key) {
    return unlocked.value.includes(key);
  }

  function onCompletion(
    tempKey,
    duration = 850,
    { cooldownMs = DEFAULT_COOLDOWN, restart = false } = {}
  ) {
    const now = Date.now();

    // Cooldown to avoid spam
    if (!tempActive.value && now - lastTempAt < cooldownMs) return;

    if (tempActive.value) {
      // Already showing: either ignore, or restart the ONE timer
      if (restart) {
        if (tempTimer) clearTimeout(tempTimer);
        tempTimer = setTimeout(endTemp, duration);
      }
      return; // don't create new timers
    }

    baseKey.value = equippedKey.value;
    equippedKey.value = tempKey;
    tempActive.value = true;
    lastTempAt = now;

    tempTimer = setTimeout(endTemp, duration);
  }

  // Cancel gif animation on task untick
  function cancelTemp() {
    endTemp();
  }

  return {
    unlocked,
    equippedKey,
    fetchProfile,
    unlock,
    equip,
    hasKey,
    onCompletion,
    cancelTemp,
  };
});
