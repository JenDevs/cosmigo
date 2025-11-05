import { defineStore } from "pinia";
import { ref } from "vue";
import { COSMIGO_REWARDS, CR_BUNDLED } from "@/constants/cosmigoRewards";

function sanitizeKey(k) {
  if (typeof k !== "string") return k;
  if (k.length >= 2 && k[0] === '"' && k[k.length - 1] === '"') {
    try {
      return JSON.parse(k);
    } catch {
      return k.replace(/"/g, "");
    }
  }
  return k;
}

export const useCosmigoStore = defineStore("cosmigo", () => {
  const mockUserId = 1;
  const unlocked = ref([]);
  const equippedKey = ref(null);

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

      const safe = Array.isArray(data.unlocked)
        ? data.unlocked.map(sanitizeKey)
        : [];
      unlocked.value = safe;
      equippedKey.value = sanitizeKey(data.equippedKey ?? null);
    } catch (err) {
      console.error("Failed to fetch Cosmigo profile:", err);
    }
  }

  async function unlock(key) {
    const clean = sanitizeKey(key);

    if (unlocked.value.includes(clean)) return;

    unlocked.value = [...unlocked.value, clean];

    try {
      const res = await fetch(`/api/users/${mockUserId}/cosmigo/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: clean }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();

      const safe = Array.isArray(data.unlocked)
        ? data.unlocked.map(sanitizeKey)
        : [];
      unlocked.value = safe;
    } catch (err) {
      console.error("Unlock failed:", err);
      unlocked.value = unlocked.value.filter((k) => k !== clean);
    }
  }

  async function grantLevelRewards(level) {
    const bundle = CR_BUNDLED[level] ?? [];
    for (const key of bundle) {
      await unlock(key);
    }
  }

  async function equip(key) {
    const clean = sanitizeKey(key);
    const prev = equippedKey.value;
    equippedKey.value = clean;
    try {
      const res = await fetch(`/api/users/${mockUserId}/cosmigo/equip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: clean }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (err) {
      console.error("Equip failed:", err);
      equippedKey.value = prev;
    }
  }

  function hasKey(key) {
    return unlocked.value.includes(sanitizeKey(key));
  }

  function onCompletion(
    tempKey,
    duration = 850,
    { cooldownMs = DEFAULT_COOLDOWN, restart = false } = {}
  ) {
    const now = Date.now();

    if (!tempActive.value && now - lastTempAt < cooldownMs) return;

    if (tempActive.value) {
      if (restart) {
        if (tempTimer) clearTimeout(tempTimer);
        tempTimer = setTimeout(endTemp, duration);
      }
      return;
    }

    baseKey.value = equippedKey.value;
    equippedKey.value = tempKey;
    tempActive.value = true;
    lastTempAt = now;

    tempTimer = setTimeout(endTemp, duration);
  }

  function onLevelUp(duration = 1200, { interrupt = true } = {}) {
    const levelUpKey = Object.keys(COSMIGO_REWARDS).find(
      (k) => k === "cosmigo_levelup"
    );

    if (!levelUpKey) {
      console.warn("[Cosmigo] Missing cosmigo_levelup key in COSMIGO_REWARDS");
      return;
    }

    if (interrupt && tempActive.value) {
      endTemp();
    }

    onCompletion(levelUpKey, duration, { cooldownMs: 0, restart: false });
  }

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
    onLevelUp,
    cancelTemp,
    grantLevelRewards,
  };
});
