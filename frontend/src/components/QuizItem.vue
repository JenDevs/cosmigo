<script setup>
const props = defineProps({
  quiz: { type: Object, required: true },
});
const emit = defineEmits(["select", "delete"]);

function handleDelete() {
  emit("delete", props.quiz.id);
}
function handleSelect() {
  emit("select", Number(props.quiz.id));
}
</script>

<template>
  <li class="quiz-item" @click="handleSelect">
    {{ quiz.title }} 
    <button class="delete-quiz-btn" @click.stop="handleDelete">x</button>
  </li>
</template>

<style scoped>
/* quizlistan */
.quiz-item {
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
  cursor: pointer;
}

/* titel */
.title {
  flex: 1;
  text-align: left;
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.quiz-item:hover {
  background-color: rgba(0, 0, 0, 0.4);
}

.delete-quiz-btn {
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