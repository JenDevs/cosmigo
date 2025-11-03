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
  (props.quizzes || []).filter(q => q && q.id && q.title && q.title.trim())
);
</script>

<template>
  <!-- Visa lista om det finns quiz -->
  <ul class="quiz-list" v-if="items.length">
    <QuizItem
      v-for="q in items"
      :key="Number(q.id)"
      :quiz="q"
      @select="emit('select', $event)"
      @delete="emit('delete', $event)"
    />
  </ul>

  <!-- Om ingenting finns -->
  <p v-else class="empty-text">
    Quiz does not exist yet. Create one?
  </p>
</template>

<style scoped>
.quiz-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.empty-text {
  opacity: 0.7;
  font-size: 0.95rem;
  color: #ddd;
  margin: 6px 0;
}
</style>