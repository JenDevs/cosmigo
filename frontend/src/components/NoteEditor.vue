<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["save"]);

const title = ref(props.note.title);
const content = ref(props.note.content);

watch(
  () => props.note,
  (newNote) => {
    title.value = newNote.title;
    content.value = newNote.content;
  }
);

const saveNote = () => {
  emit("save", {
    id: props.note.id,
    title: title.value,
    content: content.value,
  });
};
</script>

<template>
  <div class="note-editor">
    <input v-model="title" placeholder="Title" class="title-input" />
    <textarea
      v-model="content"
      placeholder="Write your note here..."
      class="content-area"
    />
    <button @click="saveNote">💾 Save</button>
  </div>
</template>

<style scoped>
.note-editor {
  display: flex;
  flex-direction: column;
  background-color: rgb(86, 86, 92);
  border-radius: 8px;
  gap: 10px;
  margin: 120px 0 0 0;
  padding: 16px;
  width: 80%;
  height: 80%;
}

.title-input {
  font-size: 1.2rem;
  padding: 8px;
  border: none;
  border-bottom: 2px solid #ccc;
  background: transparent;
  color: white;
}

.content-area {
  flex: 1;
  resize: none;
  padding: 10px;
  background-color: rgb(63, 63, 70);
  color: white;
  border-radius: 6px;
  border: none;
  font-family: inherit;
}

button {
  align-self: flex-start;
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background-color: #005dc0;
}
</style>
