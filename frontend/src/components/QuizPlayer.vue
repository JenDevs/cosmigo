<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import { useUserStore } from "@/stores/useUserStore";

// Props
const emit = defineEmits(["close", "archive", "restart"]);
const props = defineProps({
  open: { type: Boolean, default: false },
  questions: { type: Array, default: () => [] },
  title: { type: String, default: "Quiz" },
  // Användaren väljer att slumpa (inte automatiskt)
  randomize: { type: Boolean, default: false },
  // Om användaren har slumpat en gång, ska vi slumpa igen vid "Kör igen"?
  reshuffleOnRestart: { type: Boolean, default: true },
});

// Stores
const userStore = useUserStore();

// Internt state
const idx = ref(0);
const order = ref([]);
const showAnswer = ref(false);
const showEndPrompt = ref(false);
const lastShuffled = ref(false); // minns om användaren valde att slumpa

// Härledd state
const hasQuestions = computed(() => (props.questions?.length || 0) > 0);
const total = computed(() => order.value.length);

const current = computed(() => {
  if (!hasQuestions.value) return { text: "", answer: "" };
  const qIdx = order.value[idx.value] ?? 0;
  return props.questions[qIdx] || { text: "", answer: "" };
});

const isLast = computed(() => hasQuestions.value && idx.value >= total.value - 1);
const canPrev = computed(() => idx.value > 0);
const canNext = computed(() => hasQuestions.value && idx.value < total.value - 1);

// Shuffle
function fyShuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}

function buildOrder({ shuffle = false } = {}) {
  const n = props.questions?.length || 0;
  const arr = Array.from({ length: n }, (_, i) => i);
  if (shuffle && n > 1) fyShuffle(arr);
  order.value = arr;
}

function resetView() {
  idx.value = 0;
  showAnswer.value = false;
  showEndPrompt.value = false;
}

function reshuffle() {
  buildOrder({ shuffle: true });
  resetView();
  lastShuffled.value = true;
}

// Livscykel — bygg alltid rak ordning när man öppnar, ingen auto-slump
watch(
  () => props.open,
  (o) => {
    if (o) {
      buildOrder({ shuffle: false });
      lastShuffled.value = false;
      resetView();
    }
  }
);

// Om frågelistan byts ut dynamiskt: återställ rak ordning
watch(
  () => props.questions,
  () => {
    buildOrder({ shuffle: false });
    resetView();
    lastShuffled.value = false;
  },
  { deep: true }
);

// Tangentbordsgenvägar
function onKey(e) {
  if (!props.open) return;

  // Om slutrutan visas: bara Esc ska fungera
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
  if (e.key.toLowerCase() === "f" || e.key === " ") { e.preventDefault(); flip(); }
  if (e.key.toLowerCase() === "r") { e.preventDefault(); reshuffle(); } 
}

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));

// Navigation
function prev() {
  if (canPrev.value) { idx.value--; showAnswer.value = false; }
}
function next() {
  if (!hasQuestions.value) return;
  if (idx.value < total.value - 1) {
    idx.value++; showAnswer.value = false;
  } else {
    showEndPrompt.value = true;
  }
}
function flip() { showAnswer.value = !showAnswer.value; }

// Slutprompt-knappar
function doAgain() {
  // Slumpa endast om användaren tidigare valt att slumpa och det är tillåtet
  if (props.reshuffleOnRestart && lastShuffled.value) buildOrder({ shuffle: true });
  idx.value = 0;
  showAnswer.value = false;
  showEndPrompt.value = false;
  emit("restart");
}

function justClose() { showEndPrompt.value = false; emit("close"); }

async function markDone() {
  showEndPrompt.value = false;
  emit("archive");
  try { await userStore.addXP("quiz"); }
  catch (e) { console.error("Failed to add XP for quiz:", e); }
}
</script>

<template>
  <!-- overlay -->
  <div v-if="open" class="overlay" @click.self="emit('close')">
    <div class="card">
      <div class="header">
        <h3>{{ title }}</h3>
        <div class="header-actions">
          <button class="close" @click="emit('close')" title="Stäng (Esc)">✖</button>
        </div>
      </div>

      <div class="counter">{{ hasQuestions ? idx + 1 : 0 }} / {{ total }}</div>

      <div class="flashcard" @click="flip" title="Vänd kort (Space/F)">
        <p class="question" v-if="!showAnswer">{{ current.text }}</p>
        <p class="answer" v-else>{{ current.answer || "—" }}</p>
      </div>

      <div class="actions">
        <button @click="prev" :disabled="!canPrev" title="Previous (<)">◀</button>
        <button @click="flip" title="Flip for answer (Space/F)">↻</button>
        <button class="shuffle" @click="reshuffle" title="Shuffle cards (R)">🔀</button>
        <button @click="next" :disabled="!hasQuestions" title="Next (>)">{{ isLast ? "Avsluta" : "▶" }}</button>
      </div>
    </div>

    <!-- Slut-prompt -->
    <div v-if="showEndPrompt" class="modal-backdrop">
      <div class="modal">
        <h4>Finished?</h4>
        <p>Vill du arkivera, köra igen eller bara avsluta?</p>
        <div class="modal-actions">
          <button @click="doAgain">Do it again!</button>
          <button class="primary" @click="markDone">Done and archive the quiz</button>
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
.header-actions { display:flex; gap:8px; align-items:center; }
.close, .shuffle {
  background:#555;
  color:#fff;
  border:none;
  padding:6px 10px;
  border-radius:8px;
  cursor:pointer;
}
.close { background:#a33; }
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
.answer { color:#b4f0c8; }
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
