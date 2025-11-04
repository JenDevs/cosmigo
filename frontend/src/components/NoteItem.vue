<script setup>
import { computed, ref } from "vue";
import ConfirmModal from "./ConfirmModal.vue";
import { useNotesStore } from "@/stores/useNotesStore";
import { storeToRefs } from "pinia";

const props = defineProps({
  note: { type: Object, required: true },
});

const notesStore = useNotesStore();
const { activeNote } = storeToRefs(notesStore);
const isSelected = computed(() => activeNote.value?.id === props.note.id);

const emit = defineEmits(["delete", "select"]);

const showConfirm = ref(false);

const handleSelect = () => emit("select", props.note.id);
const handleDelete = () => (showConfirm.value = true);
const confirmDelete = () => {
  emit("delete", props.note.id);
  showConfirm.value = false;
};

const rootEl = ref(null);
defineExpose({ rootEl });
</script>

<template>
  <li
    ref="rootEl"
    class="note-item"
    role="option"
    :aria-selected="isSelected ? 'true' : 'false'"
  >
    <div
      class="file-tile"
      :class="{ selected: isSelected }"
      role="option"
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
  width: 100px;
  border-radius: 8px;
}

.file-tile {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 6px;
  padding: 10px 4px 4px;
  width: 120px;
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.08s ease, background-color 0.12s ease;
}

.file-tile:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-1px);
}

.file-tile:active {
  background: rgba(0, 174, 255, 0.2);
  transform: translateY(1px);
}

.file-tile.selected {
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.2);
}

.file-icon {
  width: 48px;
  height: 48px;
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
  margin: 5px;
  color: #fff;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  hyphens: auto;
  -webkit-hyphens: auto;
  word-break: normal;
  overflow-wrap: anywhere;
}

.delete-note-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  font-size: 0.9rem;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 6px;
  background: #e74c3c;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
}

.file-tile:hover .delete-note-btn {
  color: #fff;
  opacity: 1;
}

.delete-note-btn:hover {
  background: #c71704;
}
</style>
