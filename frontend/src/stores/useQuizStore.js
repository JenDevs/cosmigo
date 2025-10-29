import { defineStore } from "pinia";
import axios from "axios";

// /api/users/:userId/quizzes
const Quizzes = {
  list(userId, opts = {}) {
    return axios
      .get(`/api/users/${userId}/quizzes`, { params: { ...(opts.status ? { status: opts.status } : {}) } })
      .then(r => r.data);
  },
  listArchived(userId) {
    return Quizzes.list(userId, { status: "archived" });
  },
  get(userId, id) {
    return axios.get(`/api/users/${userId}/quizzes/${id}`).then(r => r.data);
  },
  create(userId, payload) {
    return axios.post(`/api/users/${userId}/quizzes`, payload).then(r => r.data);
  },
  update(userId, id, payload) {
    return axios.put(`/api/users/${userId}/quizzes/${id}`, payload).then(r => r.data);
  },
  remove(userId, id) {
    return axios.delete(`/api/users/${userId}/quizzes/${id}`).then(r => r.data);
  },
  archive(userId, id) {
    return axios.post(`/api/users/${userId}/quizzes/${id}/archive`, {}).then(r => r.data);
  },
};

export const useQuizStore = defineStore("quiz", {
  state: () => ({
    list: [],
    archived: [],
    current: null,
    loading: false,
    error: "",
  }),

  getters: {
    hasError: s => !!s.error,
    isEmpty: s => s.list.length === 0,
  },

  actions: {
    // Hämta alla (ej arkiverade) quiz
    async load(userId) {
      this.loading = true; this.error = "";
      try {
        const data = await Quizzes.list(userId);
        const items = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
        this.list = items
          .filter(q => q && q.title && String(q.title).trim())
          .filter(q => q.status !== "archived");
      } catch (e) {
        console.error(e);
        this.error = "Could not get quizzes";
        this.list = [];
      } finally {
        this.loading = false;
      }
    },

    // Hämta arkiverade
    async loadArchived(userId) {
      try {
        const data = await Quizzes.listArchived(userId);
        const items = Array.isArray(data) ? data : Array.isArray(data?.rows) ? data.rows : [];
        this.archived = items.filter(q => q && q.title && String(q.title).trim());
      } catch (e) {
        console.error(e);
        this.archived = [];
      }
    },

    // Hämta ett quiz inkl. frågor
    async getFull(userId, id) {
      if (!id) throw new Error("Missing id");
      const data = await Quizzes.get(userId, id);

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

    clearCurrent() { this.current = null; },

    // Skapa/uppdatera quiz
    async save(userId, quiz) {
      const title = (quiz.title || "").trim();
      const questions = (quiz.questions || [])
        .map((q, i) => ({
          text: (q.text || "").trim(),
          answer: (q.answer || "").trim() || null,
          position: Number.isFinite(q.position) ? q.position : i,
        }))
        .filter(q => q.text);

      if (!title || questions.length === 0) {
        throw new Error("Title + at least 1 question is required.");
      }

      if (!quiz.id) {
        const res = await Quizzes.create(userId, { title, questions });
        if (res?.id) this.list.unshift({ id: res.id, title, status: "draft" });
        return res;
      } else {
        await Quizzes.update(userId, quiz.id, { title, questions });
        const idx = this.list.findIndex(x => x.id === quiz.id);
        if (idx !== -1) this.list[idx] = { ...this.list[idx], title };
        return { id: quiz.id };
      }
    },

    // Ta bort
    async remove(userId, id) {
      await Quizzes.remove(userId, id);
      this.list = this.list.filter(q => q.id !== id);
      if (this.current?.id === id) this.current = null;
    },

    // Nytt tomt
    newBlank() {
      this.clearCurrent();
      return { id: undefined, title: "", questions: [{ text: "", answer: "" }] };
    },

    // Arkivera
    async archive(userId, id) {
      await Quizzes.archive(userId, id);

      // flytta från aktiva -> arkiverade
      const i = this.list.findIndex(q => q.id === id);
      if (i !== -1) {
        const [q] = this.list.splice(i, 1);
        this.archived.unshift({ ...q, status: "archived" });
      } else {
        await this.loadArchived(userId);
      }
      if (this.current?.id === id) this.current = null;
    },
  },
});
