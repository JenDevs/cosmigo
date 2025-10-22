<script setup>
import { computed } from "vue";
import QuizItem from "./QuizItem.vue";

// tar emot lista med quiz från föräldern
const props = defineProps({
  quizzes: { type: Array, required: true },
});

// skickar event upp till föräldern (när quiz väljs eller tas bort)
const emit = defineEmits(["select", "delete"]);

// skapar en reaktiv lista med giltiga quiz (ta bort tomma/titellösa)
const items = computed(() =>
  (props.quizzes || []).filter(q => q && q.title && q.title.trim())
);
</script>

<template>
  <!-- Visa lista om det finns quiz -->
  <ul class="quiz-list" v-if="items.length">
    <!-- Loopar igenom alla giltiga quiz -->
    <QuizItem
      v-for="q in items"
      :key="q.id || q.title"
      :quiz="q"
      @select="emit('select', $event)"
      @delete="emit('delete', $event)"
    />
  </ul>

  <!-- Om ingenting finns (jag vet, lite sorgligt) -->
  <p v-else class="empty-text">Inga quiz ännu. Kanske dags att skapa ett? 🙂</p>
</template>

<style scoped>
/* Lista utan punkter och marginal, rent och fint */
.quiz-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Text som visas om listan är tom */
.empty-text {
  opacity: 0.7;
  font-size: 0.95rem;
  color: #ddd;
  margin: 6px 0;
}
</style>
