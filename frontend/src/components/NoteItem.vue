<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["delete"]);

const handleDelete = () => {
  emit("delete", props.note.id);
};
</script>

<template>
  <li class="note-item">
    {{ props.note.title }}
    <button class="delete-note-btn" @click.stop="handleDelete">×</button>
  </li>
</template>

<style scoped>
.note-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin: 8px 0;
  width: 100%;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  color: white;
  border-radius: 4px;
  list-style: none;
}

.note-item:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

.delete-note-btn {
  float: right;
  font-size: 1rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}
</style>
