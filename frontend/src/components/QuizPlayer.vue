<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";

// props från föräldern
const props = defineProps({
  open: { type: Boolean, default: false },         
  questions: { type: Array, default: () => [] },  
  title: { type: String, default: "Quiz" },        
});

// event upp till föräldern 
const emit = defineEmits(["close"]);

// internt state
const idx = ref(0);           
const showAnswer = ref(false); 

// nollställ när spelaren öppnas
watch(
  () => props.open,
  (o) => {
    if (o) {
      idx.value = 0;
      showAnswer.value = false;
    }
  }
);

// tangentbordsgenvägar
function onKey(e) {
  if (!props.open) return;
  if (e.key === "Escape") emit("close");
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
  if (e.key.toLowerCase() === "f" || e.key === " ") { // space or 'f' = flip
    e.preventDefault();
    flip();
  }
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

// härledda värden 
const current = computed(() => props.questions[idx.value] || { text: "", answer: "" });
const canPrev  = computed(() => idx.value > 0);
const canNext  = computed(() => idx.value < props.questions.length - 1);

// navigation + flip 
function prev() {
  if (canPrev.value) { idx.value--; showAnswer.value = false; }
}
function next() {
  if (canNext.value) { idx.value++; showAnswer.value = false; }
}
function flip() {
  showAnswer.value = !showAnswer.value;
}
</script>

<template>
  <!-- overlay -->
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="card">
      <!-- topp: titel + stängknapp -->
      <div class="header">
        <h3>{{ title }}</h3>
        <button class="close" @click="emit('close')" title="Stäng (Esc)">✖</button>
      </div>

      <!-- framsteg: nuvarande/antal -->
      <div class="counter">{{ idx + 1 }} / {{ questions.length }}</div>

      <!-- flashcard (klick = flip) -->
      <div class="flashcard" @click="flip" title="Klicka för att vända (Space/F)">
        <p class="question" v-if="!showAnswer">{{ current.text }}</p>
        <p class="answer" v-else>{{ current.answer || "—" }}</p>
      </div>

      <!-- controller  -->
      <div class="actions">
        <button @click="prev" :disabled="!canPrev" title="Föregående (←)">◀</button>
        <button @click="flip" title="Vänd kort (Space/F)">↻</button>
        <button @click="next" :disabled="!canNext" title="Nästa (→)">▶</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* helskärms-overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

/* kortets container */
.card {
  width: min(720px, 92vw);
  background: #2b2b2f;
  color: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
}

/* header med titel + stäng */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close {
  background: #a33;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 8px;
  cursor: pointer;
}

/* hur många frågor/kort */
.counter {
  opacity: 0.8;
  margin: 6px 0 12px;
}

/* flashcard */
.flashcard {
  background: #3a3a40;
  border-radius: 12px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 16px;
  text-align: center;
}
.question,
.answer {
  font-size: 3rem;
  line-height: 1.5;
}
.answer {
  color: #b4f0c8;
}
.hint {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  opacity: 0.6;
  font-size: 0.85rem;
}

/* knappar under kortet */
.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px;
}
.actions button {
  background: #555;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
.actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
