<script setup>
import { ref } from "vue";
import { defineProps, defineEmits } from "vue";
import ConfirmModal from "./ConfirmModal.vue";

const props = defineProps({
  note: { type: Object, required: true },
});

const emit = defineEmits(["delete", "select"]);

const showConfirm = ref(false);

const handleSelect = () => emit("select", props.note.id);
const handleDelete = () => (showConfirm.value = true);
const confirmDelete = () => {
  emit("delete", props.note.id);
  showConfirm.value = false;
};
</script>

<template>
  <li class="note-item" role="listitem">
    <div
      class="file-tile"
      role="button"
      tabindex="0"
      @click="handleSelect"
      @keyup.enter="handleSelect"
      aria-label="Open note"
    >
      <div class="file-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="icon">
          <path
            fill="currentColor"
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <path fill="currentColor" d="M14 2v6h6" />
        </svg>
      </div>

      <div
        class="file-title"
        :title="props.note.title"
        :aria-label="`Note title: ${props.note.title}`"
      >
        {{ props.note.title }}
      </div>

      <button
        class="delete-note-btn"
        @click.stop="handleDelete"
        aria-label="Delete note"
      >
        ×
      </button>
    </div>

    <ConfirmModal
      :visible="showConfirm"
      title="Delete note"
      :message="`Are you sure you want to delete '${props.note.title}'?`"
      @confirm="confirmDelete"
      @cancel="showConfirm = false"
    />
  </li>
</template>

<style scoped>
.note-item {
  list-style: none;
  display: flex;
  justify-content: center;
  padding: 4px;
  width: 120px;
}

.file-tile {
  position: relative;
  width: 120px;
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 8px 6px 6px;
  width: 120px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.08s ease, background-color 0.12s ease;
}

.file-tile:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
}

.file-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  color: #d0d4da;
}

.icon {
  width: 100%;
  height: 100%;
}

.file-title {
  text-align: center;
  font-size: 0.85rem;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.delete-note-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 1rem;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: rgba(255, 255, 255, 0);
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.file-tile:hover .delete-note-btn {
  background: #e74c3c;
  color: #fff;
  opacity: 1;
}

.delete-note-btn:hover {
  background: #c0392b;
}
</style>
