<script setup>
import { ref, computed, watch } from "vue";
import { useQuizStore } from "@/stores/useQuizStore";

// event upp till föräldern
const emit = defineEmits(["start", "saved"]);

// props (valt quiz att redigera)
const props = defineProps({
  quiz: { type: Object, default: null },
});

// hämta Pinia-store
const store = useQuizStore();

// skapa fråga med unikt ID
let _uid = 0;
const mkQ = (q = {}) => ({
  _uid: _uid++,
  text: q.text || "",
  answer: q.answer || "",
});

// lokalt state
const quiz = ref({ id: undefined, title: "", questions: [mkQ()] });

// flagga: visa fel först efter Save/Start
const triedSubmit = ref(false);

// återställ quiz
function resetQuiz() {
  quiz.value = { id: undefined, title: "", questions: [mkQ()] };
  triedSubmit.value = false;
}
defineExpose({ resetQuiz });

// uppdatera quiz när props ändras
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

// redigeringsfunktioner
function addQuestion() {
  quiz.value.questions.push(mkQ());
}
function removeQuestion(i) {
  if (!confirm("Are you sure you want to delete this question? Really? REALLY!? Okey =)")) return;
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

// valideringsstatus
const titleMissing = computed(() => !quiz.value.title?.trim());
const missingQuestions = computed(() =>
  quiz.value.questions.filter((q) => !q.text?.trim())
);
const hasValidQuestion = computed(() =>
  quiz.value.questions.some((q) => q.text && q.text.trim())
);
const isValid = computed(() => !titleMissing.value && hasValidQuestion.value);

// Generera meddelande beroende på feltyp
const validationMessage = computed(() => {
  if (!triedSubmit.value) return ""; // visa inget innan försök
  if (titleMissing.value && missingQuestions.value.length > 0)
    return "Heeeeey Sweetieheart, you need BOTH a title and ATLEAST one question.";
  if (titleMissing.value)
    return "Did you forgot something? Perhaps the title?";
  if (missingQuestions.value.length > 0)
    return "Did you forgot something? Maybe a question?";
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

// spara quiz
async function save() {
  triedSubmit.value = true;
  if (!isValid.value) {
    alert(validationMessage.value);
    return;
  }

  const payload = {
    id: quiz.value.id,
    title: quiz.value.title.trim(),
    questions: quiz.value.questions.map((q, i) => ({
      text: q.text.trim(),
      answer: q.answer || null,
      position: i,
    })),
  };

  try {
    // byt till Pinia-store
    const res = await store.save(payload);
    if (!quiz.value.id && res?.id) quiz.value.id = res.id;
    emit("saved", { id: quiz.value.id, title: quiz.value.title });
    alert("Yay! You saved your quiz! You are such a smart cookie!");
  } catch (e) {
    console.error(e);
    alert("Fiddlesticks! Someone (not me) stole your quiz, please try again!");
  }
}
</script>

<template>
  <!-- Huvudcontainer -->
  <div class="quiz-editor">
    <!-- Titel -->
    <input
      v-model="quiz.title"
      placeholder="Quiz title"
      class="title-input"
    />

    <!-- Glömt titel -->
    <p v-if="triedSubmit && titleMissing" class="err">
      Did you forgot something? Perhaps a title?
    </p>

    <!-- Frågor -->
    <div v-for="(q, i) in quiz.questions" :key="q._uid" class="question-card">
      <!-- Rad: # och knappar -->
      <div class="row">
        <strong>#{{ i + 1 }}</strong>
        <div class="row-actions">
          <button @click="move(i, -1)" :disabled="i === 0">▲</button>
          <button
            @click="move(i, 1)"
            :disabled="i === quiz.questions.length - 1"
          >
            ▼
          </button>
          <button class="danger" @click="removeQuestion(i)">✖</button>
        </div>
      </div>

      <!-- Frågetext -->
      <input
        v-model="q.text"
        placeholder="Please write your question here..."
        class="q-input"
      />

      <!-- Svar (valfritt) -->
      <input
        v-model="q.answer"
        placeholder="(Optional) Answer"
        class="a-input"
      />

      <!-- Glömt titel -->
      <p v-if="triedSubmit && !q.text.trim()" class="err">
        Did you forgot something? Maybe a question?
      </p>
    </div>

    <!-- Om båda saknas -->
    <p
      v-if="
        triedSubmit &&
        titleMissing &&
        missingQuestions.length > 0
      "
      class="err"
    >
      Heeeeey Sweetieheart, you need BOTH a title and ATLEAST one question.
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

  <!-- flyttad hit -->
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
button.danger {
  background: #a33;
}

button.add {
  background-color: #4caf50;
  color: white;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.left-actions {
  display: flex;
  gap: 8px; 
}

.save {
  background: #007bff;
  color: white;
}

.start {
  background: #555;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
}

.err {
  color: #ffb3b3;
  margin: 6px 0 0;
  font-size: 0.9rem;
}
</style>
