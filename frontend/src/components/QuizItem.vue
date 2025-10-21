<script setup>
// props + events, super-basic!
const props = defineProps({
  quiz: { type: Object, required: true },
});
const emit = defineEmits(["select", "delete"]);
</script>

<template>
  <li class="quiz-item">
    <!-- Klick på titeln = välj quiz (skicka id uppåt) -->
    <span class="title" @click="emit('select', quiz.id)">{{ quiz.title }}</span>
    
    <!-- Delete-knappen syns om ett quiz är sparat -->
    <button
      v-if="quiz?.id"
      class="delete"
      @click.stop="emit('delete', quiz.id)"
      title="Delete"
    >
      ✖
    </button>
  </li>
</template>

<style scoped>
/* en rad i quizlistan */
.quiz-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin: 4px 0;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
}

/* klickbar titel */
.title {
  flex: 1;
  text-align: left;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.95rem;
}

/* Röd knapp för att ta bort quiz */
.delete {
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 2px 8px;
  cursor: pointer;
}
</style>
