import { defineStore } from "pinia";
import { Quizzes } from "@/api/quizzes";

export const useQuizStore = defineStore("quiz", {
  state: () => ({
    /** @type {Array<{id:string,title:string}>} */
    list: [],
    /** @type {null | {id:string,title:string}} */
    current: null,
    loading: false,
    error: "",
  }),

  getters: {
    hasError: (s) => !!s.error,
    isEmpty: (s) => s.list.length === 0,
  },

  actions: {
async load() {
  this.loading = true; this.error = "";
  try {
    const data = await Quizzes.list();

    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.rows)
        ? data.rows
        : [];

    if (!Array.isArray(data)) {
      console.warn("Quizzes.list() returned non-array:", data);
    }

    // filtrera bort skräp (saknar titel)
    this.list = items.filter(q => q && q.title && String(q.title).trim());
  } catch (e) {
    this.error = "Could not get quizzes";
    console.error(e);
  } finally {
    this.loading = false;
  }
},

    setCurrentById(id) {
      const q = this.list.find(x => x.id === id);
      this.current = q ? { id: q.id, title: q.title } : null;
    },

    clearCurrent() { this.current = null; },

    /**
     * Hämta fullständigt quiz (inkl frågor/svar) från API
     * @param {string} id
     */
    async getFull(id) {
      return Quizzes.get(id);
    },

    /**
     * Skapa eller uppdatera ett quiz.
     * Skapar alltid när id saknas.
     * @param {{id?:string,title?:string,questions?:Array<{text?:string,answer?:string,position?:number}>}} quiz
     */
    async save(quiz) {
      // sanering/validering
      const title = (quiz.title || "").trim();
      const questions = (quiz.questions || [])
        .map((q, i) => ({
          text: (q.text || "").trim(),
          answer: (q.answer || "").trim() || null,
          position: Number.isFinite(q.position) ? q.position : i
        }))
        .filter(q => q.text); // ta bort tomma

      if (!title || questions.length === 0) {
        throw new Error("Title + at least 1 question is required.");
      }

      if (!quiz.id) {
        // skapa nytt
        const res = await Quizzes.create({ title, questions });
        // optimistiskt: lägg till i listan om backend gav id
        if (res?.id) this.list.unshift({ id: res.id, title });
        return res;
      } else {
        // uppdatera befintligt
        await Quizzes.update(quiz.id, { title, questions });
        const idx = this.list.findIndex(x => x.id === quiz.id);
        if (idx !== -1) this.list[idx] = { ...this.list[idx], title };
        return { id: quiz.id };
      }
    },

    async remove(id) {
      await Quizzes.remove(id);
      this.list = this.list.filter(q => q.id !== id);
      if (this.current?.id === id) this.current = null;
    },

    // valfri helper för nytt, tomt quiz i editorn
    newBlank() {
      this.clearCurrent();
      return { id: undefined, title: "", questions: [{ text: "", answer: "" }] };
    }
  }
});
