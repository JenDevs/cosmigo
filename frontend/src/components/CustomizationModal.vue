<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCosmigoStore } from "@/stores/useCosmigoStore";
import { COSMIGO_REWARDS } from "@/constants/cosmigoRewards";

const cosmigo = useCosmigoStore();
const { unlocked, equippedKey } = storeToRefs(cosmigo);

onMounted(() => {
  cosmigo.fetchProfile().catch(() => {});
});

const selectedKey = ref(null);
watch(equippedKey, (v) => (selectedKey.value = v), { immediate: true });

const unlockedItems = computed(() =>
  (unlocked.value || [])
    .map((key) => ({ key, ...(COSMIGO_REWARDS[key] || {}) }))
    .filter((x) => x.src)
);

async function onEquip() {
  if (!selectedKey.value) return;
  await cosmigo.equip(selectedKey.value);
  // or auto close -> emit("close");
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

const emit = defineEmits(["close"]);
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
        <h2 id="customize-title">Choose your look...</h2>
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
  background: rgb(229, 224, 253);
  min-width: 320px;
  max-width: 720px;
  width: 90%;
  border-radius: 14px;
  padding: 0 1.5rem 1.5rem 1.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}
.modal-header {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif, "Lucida Sans",
    Arial, sans-serif;
  word-spacing: 5px;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  background-color: rgb(35, 21, 63);
  border-radius: 12px 12px 0 0;
  margin: 0 -1.5rem 24px;
  color: rgb(255, 255, 255);
  cursor: default;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  align-items: center;
  gap: 12px;
  margin: 12px 0;
  user-select: none;
}
.tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 12px;
  margin: auto;
  background: rgba(255, 255, 255, 0);
  cursor: pointer;
}
.tile:hover {
  transform: translateY(-3px);
  transition: 120ms ease;
}
.tile.selected:hover {
  transform: none;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
}
.tile.selected {
  border-color: rgb(18, 185, 124);
  scale: 1.2;
  background: rgba(212, 231, 224, 1);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.4);
  transition: all 85ms;
}
.tile:hover img {
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.6));
}
.tile.selected img,
.tile:focus-visible img {
  filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.4));
}
.tile img {
  width: 80px;
  height: 80px;
  padding: 0;
  margin: 0;
  object-fit: contain;
  transition: filter 120ms ease;
}
.label {
  color: rgb(65, 65, 65);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  font-weight: 600;
  margin-top: 6px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 24px;
}
.primary {
  background: rgb(66, 34, 124);
  color: #fff;
  border: 0;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4px 0px rgb(37, 18, 73);
}
.primary:hover {
  background-color: rgb(85, 45, 158);
}
.primary:active {
  transform: translateY(2px);
  transition: 100ms;
  background-color: rgb(85, 45, 158);
  box-shadow: 0 2px 0px rgb(37, 18, 73);
}
.secondary {
  background: #d13838;
  border: 0;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 4px 0px #801e1e;
}
.secondary:hover {
  background-color: #e04646;
}
.secondary:active {
  transform: translateY(2px);
  transition: 100ms;
  background-color: #e04646;
  box-shadow: 0 2px 0px #801e1e;
}
.no-rewards {
  color: #666;
  font-style: italic;
}
</style>
