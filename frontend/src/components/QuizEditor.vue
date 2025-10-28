<script setup>
import { ref, computed, watch } from "vue";
import { useQuizStore } from "@/stores/useQuizStore";

// event upp till föräldern
const emit = defineEmits(["start", "saved"]);

// valt quiz att redigera
const props = defineProps({
  quiz: { type: Object, default: null },
});

// Pinia-store
const store = useQuizStore();

// skapa fråga med unikt ID för v-for
let _uid = 0;
const mkQ = (q = {}) => ({
  _uid: _uid++,
  text: q.text || "",
  answer: q.answer || "",
});

// lokalt state
const quiz = ref({ id: undefined, title: "", questions: [mkQ()] });

// visa valideringsfel först efter Save/Start
const triedSubmit = ref(false);

// återställ editor
function resetQuiz() {
  quiz.value = { id: undefined, title: "", questions: [mkQ()] };
  triedSubmit.value = false;
}
defineExpose({ resetQuiz, getCurrentQuizData });

// synka in nytt props.quiz
watch(
  () => props.quiz,
  (q) => {
    if (!q) return resetQuiz();
    quiz.value = {
      id: q.id,
      title: q.title || "",
      questions: (q.questions?.length ? q.questions : [mkQ()]).map(mkQ),
    };
    triedSubmit.value = false;
  },
  { immediate: true }
);

// redigering
function addQuestion() {
  quiz.value.questions.push(mkQ());
}
function removeQuestion(i) {
  if (!confirm("Are you sure you want to delete this question?")) return;
  quiz.value.questions.splice(i, 1);
  if (quiz.value.questions.length === 0) quiz.value.questions.push(mkQ());
}
function move(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= quiz.value.questions.length) return;
  [quiz.value.questions[i], quiz.value.questions[j]] = [
    quiz.value.questions[j],
    quiz.value.questions[i],
  ];
}

// validering
const titleMissing = computed(() => !quiz.value.title?.trim());
const missingQuestions = computed(() =>
  quiz.value.questions.filter((q) => !q.text?.trim())
);
const hasValidQuestion = computed(() =>
  quiz.value.questions.some((q) => q.text && q.text.trim())
);
const isValid = computed(() => !titleMissing.value && hasValidQuestion.value);

// generera valideringsmeddelande
const validationMessage = computed(() => {
  if (!triedSubmit.value) return "";
  if (titleMissing.value && missingQuestions.value.length > 0)
    return "Please enter a title and at least one question.";
  if (titleMissing.value) return "You forgot the quiz title.";
  if (missingQuestions.value.length > 0)
    return "You forgot at least one question.";
  return "";
});

// starta quiz
function startQuiz() {
  triedSubmit.value = true;
  const cleaned = quiz.value.questions.filter((q) => q.text && q.text.trim());
  if (!quiz.value.title?.trim() || cleaned.length === 0) {
    alert(validationMessage.value);
    return;
  }
  emit("start", {
    title: quiz.value.title.trim(),
    questions: cleaned.map((q) => ({
      text: q.text.trim(),
      answer: (q.answer || "").trim(),
    })),
  });
}

// exponerad helper: hämta aktuellt editor-draft
function getCurrentQuizData() {
  return {
    id: quiz.value.id,
    title: (quiz.value.title || "").trim(),
    questions: (quiz.value.questions || [])
      .map((q, i) => ({
        text: (q.text || "").trim(),
        answer: (q.answer || "").trim() || null,
        position: Number.isFinite(q.position) ? q.position : i,
      }))
      .filter((q) => q.text),
  };
}

// spara quiz (skapa/uppdatera via store)
async function save() {
  triedSubmit.value = true;
  if (!isValid.value) {
    alert(validationMessage.value);
    return;
  }

  const payload = getCurrentQuizData();

  try {
    const res = await store.save(payload);
    if (!quiz.value.id && res?.id) quiz.value.id = res.id;
    emit("saved", { id: quiz.value.id, title: quiz.value.title });
    alert("Saved! ✅");
  } catch (e) {
    console.error(e);
    alert("Save failed. Please try again.");
  }
}
</script>

<template>
  <div class="quiz-editor">
    <!-- Titel -->
    <input v-model="quiz.title" placeholder="Quiz title" class="title-input" />

    <!-- Titel-fel -->
    <p v-if="triedSubmit && titleMissing" class="err">
      You forgot the quiz title.
    </p>

    <!-- Frågor -->
    <div v-for="(q, i) in quiz.questions" :key="q._uid" class="question-card">
      <div class="row">
        <strong>#{{ i + 1 }}</strong>
        <div class="row-actions">
          <button @click="move(i, -1)" :disabled="i === 0">▲</button>
          <button @click="move(i, 1)" :disabled="i === quiz.questions.length - 1">▼</button>
          <button class="danger" @click="removeQuestion(i)">✖</button>
        </div>
      </div>

      <input v-model="q.text" placeholder="Write your question..." class="q-input" />
      <input v-model="q.answer" placeholder="(Optional) Answer" class="a-input" />

      <p v-if="triedSubmit && !q.text.trim()" class="err">
        You forgot a question.
      </p>
    </div>

    <!-- Gemensamt fel -->
    <p v-if="triedSubmit && titleMissing && missingQuestions.length > 0" class="err">
      Please enter a title and at least one question.
    </p>

    <!-- Bottenknappar -->
    <div class="actions">
      <div class="left-actions">
        <button class="add" @click="addQuestion">Add Question</button>
        <button
          type="button"
          class="save"
          :disabled="!isValid"
          :title="!isValid ? 'Title + at least 1 question required' : 'Save quiz'"
          @click="save"
        >
          Save
        </button>
      </div>

      <button class="start" @click="startQuiz">Start Quiz</button>
    </div>
  </div>
</template>

<style scoped>
.quiz-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #56565c;
  border-radius: 8px;
  padding: 16px;
  width: 50%;
  margin: 120px 0 0 0;
  color: #fff;
}

/* lite mindre text i fälten (inte knappar) */
.title-input { font-size: 1.05rem; }
.q-input     { font-size: 1rem; }
.a-input     { font-size: 0.95rem; }

.title-input,
.q-input,
.a-input {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 6px;
  background: #3f3f46;
  color: #fff;
}

.question-card {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 10px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.row-actions {
  display: flex;
  gap: 6px;
}

/* knappar (standard) */
button {
  background: #555;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button.danger { background: #a33; }

/* add/save/start layout & färger */
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}
.left-actions { 
  display: flex; 
  gap: 8px; }

button.add  { 
  background-color: #4caf50; 
  color: white; }
button.save { 
  background: #007bff; 
  color: white; }
button.start { 
  background: #555; 
  color: #fff; }

.err {
  color: #ffb3b3;
  margin: 6px 0 0;
  font-size: 0.9rem;
}
</style>
