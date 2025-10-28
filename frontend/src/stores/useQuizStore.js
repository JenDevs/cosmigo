import { defineStore } from "pinia";
import { Quizzes } from "@/api/quizzes";

export const useQuizStore = defineStore("quiz", {
  state: () => ({
    list: [],
    archived: [],
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
        const items = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
        this.list = items.filter(q => q && q.title && String(q.title).trim() && q.status !== "archived"); // filtrera bort archived om du vill
      } catch (e) {
        this.error = "Could not get quizzes";
        console.error(e);
      } finally { this.loading = false; }
    },

    async loadArchived() {
      try {
        const data = await Quizzes.listArchived();
        const items = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
        this.archived = items.filter(q => q && q.title && String(q.title).trim());
      } catch (e) {
        console.error(e);
      }
    },

    async getFull(id) {
  if (!id) throw new Error("Missing id");

  const data = await Quizzes.get(id);

  const questions = Array.isArray(data?.questions)
    ? data.questions.map((q, i) => ({
        id: q.id,
        text: String(q.text || "").trim(),
        answer: String(q.answer || "").trim() || null,
        position: Number.isFinite(q.position) ? q.position : i,
      }))
    : [];

  return {
    id: data.id,
    title: String(data.title || "").trim(),
    questions,
  };
},
    setCurrentById(id) {
      const q = this.list.find(x => x.id === id);
      this.current = q ? { id: q.id, title: q.title } : null;
    },

    clearCurrent() {
      this.current = null;
    },

    async save(quiz) {
      const title = (quiz.title || "").trim();
      const questions = (quiz.questions || [])
        .map((q, i) => ({
          text: (q.text || "").trim(),
          answer: (q.answer || "").trim() || null,
          position: Number.isFinite(q.position) ? q.position : i
        }))
        .filter(q => q.text);

      if (!title || questions.length === 0) {
        throw new Error("Title + at least 1 question is required.");
      }

      if (!quiz.id) {
        const res = await Quizzes.create({ title, questions });
        if (res?.id) this.list.unshift({ id: res.id, title });
        return res;
      } else {
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

    newBlank() {
      this.clearCurrent();
      return { id: undefined, title: "", questions: [{ text: "", answer: "" }] };
    },

    // arkivera quiz
    async archive(id) {
      await fetch(`/api/quizzes/${encodeURIComponent(id)}/archive`, {
        method: "POST",
        credentials: "include",
      }).then(r => r.json()).then(d => {
        if (d?.success === false) throw new Error(d.error || "Archive failed");
      });

      // flytta objektet från list -> archived
      const i = this.list.findIndex(q => q.id === id);
      if (i !== -1) {
        const [q] = this.list.splice(i, 1);
        this.archived.unshift({ ...q, status: "archived" });
      } else {
        // om vi inte hittar den i listan, hämta om archived
        await this.loadArchived();
      }
      if (this.current?.id === id) this.current = null;
    },
  }
});
