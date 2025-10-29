import { defineStore } from "pinia";
import { ref } from "vue";

export const useCosmigoStore = defineStore("cosmigo", () => {
  const mockUserId = 1;
  const unlocked = ref([]);
  const equippedKey = ref(null);
  let tempTimer = null;

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

  // Temporarily update cosmigo profile image to gif when completing task
  function onCompletion(tempKey, duration = 3000) {
    const original = equippedKey.value;

    if (tempTimer) clearTimeout(tempTimer);

    equippedKey.value = tempKey;

    tempTimer = setTimeout(() => {
      equippedKey.value = original;
      tempTimer = null;
    }, duration);
  }

  return {
    unlocked,
    equippedKey,
    fetchProfile,
    unlock,
    equip,
    hasKey,
    onCompletion,
  };
});
