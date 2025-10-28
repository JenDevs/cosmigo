<template>
  <div
    v-if="visible"
    class="modal-overlay"
    role="dialog"
    :aria-labelledby="`${titleId}`"
    :aria-describedby="`${messageId}`"
    aria-modal="true"
    @click.self="cancel"
  >
    <div class="modal">
      <h3 class="modal-title" :id="titleId">{{ title }}</h3>
      <p class="modal-message" :id="messageId">{{ message }}</p>

      <div class="modal-actions">
        <button
          class="cancel-btn"
          type="button"
          @click="cancel"
          aria-label="Cancel deletion and close dialog"
        >
          Cancel
        </button>

        <button
          class="confirm-btn"
          type="button"
          @click="confirm"
          aria-label="Confirm deletion of note"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

const props = defineProps({
  visible: Boolean,
  title: { type: String, default: "Confirm" },
  message: { type: String, default: "Are you sure?" },
});

const emit = defineEmits(["confirm", "cancel"]);

const confirm = () => emit("confirm");
const cancel = () => emit("cancel");

const titleId = computed(
  () => `modal-title-${Math.random().toString(36).slice(2)}`
);
const messageId = computed(
  () => `modal-message-${Math.random().toString(36).slice(2)}`
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: #1e1e1e;
  color: white;
  border-radius: 10px;
  padding: 1.5rem;
  max-width: 320px;
  width: 90%;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.modal-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-message {
  font-size: 0.95rem;
  margin-bottom: 1.25rem;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.cancel-btn,
.confirm-btn {
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.cancel-btn {
  background: #555;
  color: white;
}

.cancel-btn:hover {
  background: #666;
}

.confirm-btn {
  background: #e74c3c;
  color: white;
}

.confirm-btn:hover {
  background: #c0392b;
}
</style>
