<script setup>
import { ref, computed, watch } from "vue";
import { useQuizStore } from "@/stores/useQuizStore";

const emit = defineEmits(["start", "saved"]);

const props = defineProps({
  quiz: { type: Object, default: null },
});

const store = useQuizStore();

let _uid = 0;
const mkQ = (q = {}) => ({
  _uid: _uid++,
  text: q.text || "",
  answer: q.answer || "",
});

const quiz = ref({ id: undefined, title: "", questions: [mkQ()] });
const triedSubmit = ref(false);

function resetQuiz() {
  quiz.value = { id: undefined, title: "", questions: [mkQ()] };
  triedSubmit.value = false;
}

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

defineExpose({ resetQuiz, getCurrentQuizData });

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

const titleMissing = computed(() => !quiz.value.title?.trim());
const missingQuestions = computed(() =>
  quiz.value.questions.filter((q) => !q.text?.trim())
);
const hasValidQuestion = computed(() =>
  quiz.value.questions.some((q) => q.text && q.text.trim())
);
const isValid = computed(() => !titleMissing.value && hasValidQuestion.value);

const validationMessage = computed(() => {
  if (!triedSubmit.value) return "";
  if (titleMissing.value && missingQuestions.value.length > 0)
    return "Please enter a title and at least one question.";
  if (titleMissing.value) return "You forgot the quiz title.";
  if (missingQuestions.value.length > 0)
    return "You forgot at least one question.";
  return "";
});

async function startQuiz() {
  triedSubmit.value = true;
  let payload = getCurrentQuizData();

  if (!payload.title || payload.questions.length === 0) {
    // Om quizet är sparat → hämta full version
    if (payload.id) {
      try {
        const userId = 1;
        const full = await store.getFull(userId, payload.id);
        if (full?.questions?.length) {
          payload = {
            id: full.id,
            title: full.title,
            questions: full.questions,
          };
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Fortfarande ogiltigt? Visa fel & avbryt
    if (!payload.title || payload.questions.length === 0) {
      alert(validationMessage.value);
      return;
    }
  }
  emit("start", {
    title: payload.title,
    questions: payload.questions.map((q) => ({
      text: q.text,
      answer: q.answer ?? "",
    })),
  });
}

async function save() {
  triedSubmit.value = true;
  if (!isValid.value) {
    alert(validationMessage.value);
    return;
  }

  const payload = getCurrentQuizData();
  const userId = 1;
  const wasNew = !quiz.value.id;

  try {
    const res = await store.save(userId, payload);
    if (!quiz.value.id && res?.id) quiz.value.id = Number(res.id);
    emit("saved", { id: quiz.value.id, title: quiz.value.title });
    alert("Saved!");
    if (wasNew) {
      resetQuiz();
    }
  } catch (e) {
    console.error("Save failed:", e);
    alert("Save failed. Please try again.");
  }
}
</script>

<template>
  <div class="quiz-editor">
    <div class="editor-header">
      <input
        v-model="quiz.title"
        placeholder="Quiz title"
        class="title-input"
        aria-label="Quiz title"
      />
      <p v-if="triedSubmit && titleMissing" class="err">
        You forgot the quiz title.
      </p>
    </div>

    <div class="editor-content">
      <div v-for="(q, i) in quiz.questions" :key="q._uid" class="question-card">
        <div class="row">
          <strong class="index">#{{ i + 1 }}</strong>
          <div class="row-actions">
            <button
              @click="move(i, -1)"
              :disabled="i === 0"
              title="Move up"
              aria-label="Move question up"
            >
              ▲
            </button>
            <button
              @click="move(i, 1)"
              :disabled="i === quiz.questions.length - 1"
              title="Move down"
              aria-label="Move question down"
            >
              ▼
            </button>
            <button
              class="danger"
              @click="removeQuestion(i)"
              title="Delete question"
              aria-label="Delete question"
            >
              ✖
            </button>
          </div>
        </div>

        <input
          v-model="q.text"
          placeholder="Write your question..."
          class="q-input"
          aria-label="Question text"
        />
        <input
          v-model="q.answer"
          placeholder="(Optional) Answer"
          class="a-input"
          aria-label="Optional answer"
        />

        <p v-if="triedSubmit && !q.text.trim()" class="err">
          You forgot a question.
        </p>
      </div>

      <p
        v-if="triedSubmit && titleMissing && missingQuestions.length > 0"
        class="err"
      >
        Please enter a title and at least one question.
      </p>
    </div>

    <div class="actions">
      <div class="left-actions">
        <button class="add" @click="addQuestion">Add Question</button>
        <button
          type="button"
          class="save"
          :disabled="!isValid"
          :title="
            !isValid ? 'Title + at least 1 question required' : 'Save quiz'
          "
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
  gap: 12px;
  background: rgb(40, 35, 59);
  border-radius: 12px 0 0 12px;
  padding: 16px 16px 12px;
  width: 100%;
  min-height: 560px;
  height: 100%;
  color: #fff;
}

.editor-header {
  position: sticky;
  top: 0;
  z-index: 1;
  background: linear-gradient(#56565c, rgba(87, 86, 92, 0.95));
  padding-bottom: none;
  border-radius: 100%;
}

/* Scrollable work area */
.editor-content {
  flex: 1 1 auto;
  overflow: auto;
  padding-right: 4px;
}

.title-input {
  font-size: 1.2rem;
  font-weight: 600;
}
.q-input {
  font-size: 1rem;
}
.a-input {
  font-size: 0.95rem;
}

.title-input,
.q-input,
.a-input {
  width: 100%;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  background: #3f3f46;
  color: #fff;
}

.question-card {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}
.index {
  opacity: 0.9;
}
.row-actions {
  display: flex;
  gap: 6px;
}

/* Base button */
button {
  background: #4b4b51;
  color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: transform 0.05s ease, box-shadow 0.2s ease, background 0.2s ease;
}
button:hover {
  transform: translateY(-1px);
}
button:active {
  transform: translateY(0);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
button.danger {
  background: #a33;
}

/* Actions bar */
.actions {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding-top: 8px;
  background: transparent;
  backdrop-filter: blur(2px);
}
.left-actions {
  display: flex;
  gap: 8px;
}

/* Secondary buttons - Add and Save */
button.add {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.25);
}
button.add:hover {
  background: rgba(255, 255, 255, 0.06);
}

button.save {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.25);
}
button.save:hover {
  background: rgba(255, 255, 255, 0.06);
}

/* Primary button Start Quiz */
button.start {
  background: rgb(73, 49, 158);
  border-color: rgb(73, 49, 158);
  border-width: 2px;
  color: white;
  font-weight: 600;
  padding: 10px 18px;
}
button.start:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.25);
  color: black;
}
button.start:active {
  filter: brightness(0.98);
}

.err {
  color: #ffb3b3;
  margin: 6px 0 0;
  font-size: 0.9rem;
}

@media (max-width: 960px) {
  .actions {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  .left-actions {
    order: 2;
    justify-content: space-between;
  }
  button.start {
    order: 1;
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .editor-header {
    position: static;
    top: auto;
    background: none;
  }
}
</style>
