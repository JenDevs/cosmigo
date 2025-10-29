<script setup>
import { ref, computed } from "vue";
import { useCosmigoStore } from "@/stores/useCosmigoStore";
import { COSMIGO_REWARDS } from "@/constants/cosmigoRewards";

const cosmigo = useCosmigoStore();
const emit = defineEmits(["close"]);

const selectedKey = ref(cosmigo.equippedKey); // preselect current
const unlockedItems = computed(() =>
  (cosmigo.unlocked || [])
    .map((key) => ({ key, ...COSMIGO_REWARDS[key] }))
    .filter((x) => x.src)
);

async function onEquip() {
  if (!selectedKey.value) return;
  await cosmigo.equip(selectedKey.value); // updates DB (equipped_key) + store
  emit("close");
}

function closeModal() {
  emit("close");
}

function onKeyDown(e, key) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    selectedKey.value = key;
  }
}
</script>

<template>
  <div
    class="modal-overlay"
    @click.self="closeModal"
    aria-modal="true"
    role="dialog"
    aria-label="Cosmigo customization"
  >
    <div class="modal-content">
      <header class="modal-header">
        <h2 id="customize-title">Choose your look</h2>
      </header>

      <div class="grid" v-if="unlockedItems.length">
        <button
          v-for="item in unlockedItems"
          :key="item.key"
          class="tile"
          :class="{ selected: selectedKey === item.key }"
          role="radio"
          :aria-checked="selectedKey === item.key"
          @click="selectedKey = item.key"
          @keydown="onKeyDown($event, item.key)"
        >
          <img :src="item.src" :alt="item.label" />
          <span class="label">{{ item.label }}</span>
        </button>
      </div>
      <p class="no-rewards" v-else style="margin: 12px 0">
        No rewards unlocked yet.
      </p>

      <footer class="actions">
        <button class="secondary" @click="closeModal">Cancel</button>
        <button
          class="primary"
          :disabled="selectedKey === cosmigo.equippedKey"
          @click="onEquip"
        >
          Equip
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}
.modal-content {
  background: #ffffff;
  min-width: 320px;
  max-width: 720px;
  width: 90%;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  color: black;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px;
  margin: 12px 0;
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 2px solid transparent;
  border-radius: 10px;
  padding: 8px;
  background: #f8f8f8;
  cursor: pointer;
}
.tile.selected {
  border-color: #4f46e5;
  background: #eef;
}
.tile img {
  width: 80px;
  height: 80px;
  object-fit: contain;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.primary {
  background: #4f46e5;
  color: #fff;
  border: 0;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.secondary {
  background: #b94a4a;
  border: 0;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.no-rewards {
  color: #666;
  font-style: italic;
}
</style>
