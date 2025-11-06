<script setup>
import { computed } from "vue";
import QuizItem from "./QuizItem.vue";

// Tar emot lista med quiz från föräldern
const props = defineProps({
  quizzes: { type: Array, required: true },
});

// Skickar event upp till föräldern (när quiz väljs eller tas bort)
const emit = defineEmits(["select", "delete"]);

// Filtrerar bort ogiltiga quiz (utan id eller titel)
const items = computed(() =>
  (props.quizzes || []).filter((q) => q && q.id && q.title && q.title.trim())
);
</script>

<template>
  <ul
    class="quiz-list"
    v-if="items.length"
    role="listbox"
    aria-label="List of quizzes"
  >
    <QuizItem
      v-for="q in items"
      :key="Number(q.id)"
      :quiz="q"
      @select="emit('select', $event)"
      @delete="emit('delete', $event)"
    />
  </ul>

  <p v-else class="empty-text">No quizzes yet... 🦗</p>
</template>

<style scoped>
.quiz-list {
  list-style: none;
  padding: 0;
  padding-top: 12px;
  padding-bottom: 12px;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  align-items: baseline;
  justify-content: center;
}

.empty-text {
  font-size: 0.95rem;
  color: #ffffff;
  padding: 6px;
  text-align: center;
}
</style>
