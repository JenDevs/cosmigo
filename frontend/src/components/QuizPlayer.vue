<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/useUserStore";

const userStore = useUserStore();
const emit = defineEmits(["close", "archive", "restart"]);
const props = defineProps({
  open: { type: Boolean, default: false },
  questions: { type: Array, default: () => [] },
  title: { type: String, default: "Quiz" },
});

// internt state 
const idx = ref(0);
const showAnswer = ref(false);
const showEndPrompt = ref(false);
const hasQuestions = computed(() => (props.questions?.length || 0) > 0);
const isLast = computed(() => hasQuestions.value && idx.value >= props.questions.length - 1);

// nollställ varje gång spelaren öppnas
watch(() => props.open, (o) => {
    if (o) {
      idx.value = 0;
      showAnswer.value = false;
      showEndPrompt.value = false; 
    }
  });

// tangentbordsgenvägar
function onKey(e) {
  if (!props.open) return;

  // Om slutrutan visas: låt bara Esc stänga och blockera övriga tangenter
  if (showEndPrompt.value) {
    if (e.key === "Escape") {
      e.preventDefault();
      emit("close");
    }
    return;
  }

  if (e.key === "Escape") emit("close");
  if (e.key === "ArrowRight") { e.preventDefault(); next(); }
  if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
  if (e.key.toLowerCase() === "f" || e.key === " ") {
    e.preventDefault();
    flip();
  }
}
onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

// härledda
const current = computed(() => props.questions[idx.value] || { text: "", answer: "" });
const canPrev  = computed(() => idx.value > 0);
const canNext  = computed(() => hasQuestions.value && idx.value < props.questions.length - 1);

// navigation 
function prev() {
  if (canPrev.value) { idx.value--; showAnswer.value = false; }
}

function next() {
  if (!hasQuestions.value) return;
  if (idx.value < props.questions.length - 1) {
    idx.value++; showAnswer.value = false;
  } else {
    showEndPrompt.value = true;
  }
}

function flip() { 
  showAnswer.value = !showAnswer.value; 
}

// slutprompt-knappar 
function doAgain() {
  idx.value = 0; 
  showAnswer.value = false;
  showEndPrompt.value = false;
  emit("restart");
}

function justClose() {
  showEndPrompt.value = false;
  emit("close");
}

async function markDone() {
  showEndPrompt.value = false;
  emit("archive");

  try {
    await userStore.addXP("quiz");
  } catch (e) {
    console.error("Failed to add XP for quiz:", e);
  }
}
</script>

<template>
  <!-- overlay -->
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="card">
      <div class="header">
        <h3>{{ title }}</h3>
        <button class="close" @click="emit('close')" title="Close (Esc)">✖</button>
      </div>

      <div class="counter">{{ hasQuestions ? idx + 1 : 0 }} / {{ questions.length }}</div>
      <div class="flashcard" @click="flip" title="Click to flip card (Space/F)">
        <p class="question" v-if="!showAnswer">{{ current.text }}</p>
        <p class="answer" v-else>{{ current.answer || "—" }}</p>
      </div>

      <div class="actions">
        <button @click="prev" :disabled="!canPrev" title="Previous">◀</button>
        <button @click="flip" title="Flip card (Space/F)">↻</button>
        <button @click="next" :disabled="!hasQuestions">{{ isLast ? "Finish" : "Next ▶" }}</button>
      </div>
    </div>

    <!-- Slut-prompt -->
    <div v-if="showEndPrompt" class="modal-backdrop">
      <div class="modal">
        <h4>Are you done with your quiz?</h4>
        <p>Would you like to archive it, do it again or just exit?</p>
        <div class="modal-actions">
          <button @click="doAgain">Do it again</button>
          <button class="primary" @click="markDone">Done and archive it</button>
          <button class="ghost" @click="justClose">Exit</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* overlay/kort */
.overlay { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.6); 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  z-index: 50; 
}
.card { 
  width: min(720px, 92vw); 
  background:#2b2b2f; 
  color:#fff; 
  border-radius:12px; 
  padding:16px; 
  box-shadow: 0 8px 40px rgba(0,0,0,0.4); 
}
.header { 
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
}
.close { 
  background:#a33; 
  color:#fff; 
  border:none; 
  padding:6px 10px; 
  border-radius:8px; 
  cursor:pointer; 
}
.counter { 
  opacity:.8; 
  margin:6px 0 12px; 
}
.flashcard { 
  background:#3a3a40; 
  border-radius:12px; 
  min-height:220px; 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  padding:16px; 
  text-align:center; 
}
.question, .answer { 
  font-size:3rem; 
  line-height:1.5; 
}
.answer { 
  color:#b4f0c8; 
}
.actions { 
  display:flex; 
  gap:10px; 
  justify-content:center; 
  margin-top:12px; 
}
.actions button { 
  background:#555; 
  color:#fff; 
  border:none; 
  border-radius:8px; 
  padding:8px 14px; 
  cursor:pointer; 
}
.actions button:disabled { 
  opacity:.5; 
  cursor:not-allowed; 
}

/* modal */
.modal-backdrop { 
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.5); 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  z-index: 60; 
}
.modal { 
  background:#2b2b2f; 
  color:#fff; 
  border-radius:12px; 
  padding:16px; 
  width:min(420px, 92vw); 
  box-shadow: 0 8px 40px rgba(0,0,0,0.45); 
}
.modal-actions { 
  display:flex; 
  gap:10px; 
  justify-content:flex-end; 
  margin-top:14px; 
}
.modal-actions .primary { 
  background:#007bff; 
  color:#fff; 
}
.modal-actions .ghost { 
  background:transparent; 
  border:1px solid #777; 
  color:#fff; 
}
.modal-actions button { 
  background:#555; 
  color:#fff; 
  border:none; 
  border-radius:8px; 
  padding:8px 12px; 
  cursor:pointer; 
  }
</style>