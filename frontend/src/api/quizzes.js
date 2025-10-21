import axios from "axios";

// Vite-proxy: /api -> http://localhost:3000
export const api = axios.create({ baseURL: "/api" });

export const Quizzes = {
   async list() {
    const r = await api.get("/quizzes");
    return Array.isArray(r.data) ? r.data
         : Array.isArray(r.data?.rows) ? r.data.rows
         : [];
  },
  
  list()   { return api.get("/quizzes").then(r => r.data); },
  get(id)  { return api.get(`/quizzes/${id}`).then(r => r.data); },
  create(payload) { return api.post("/quizzes", payload).then(r => r.data); },
  update(id, payload) { return api.put(`/quizzes/${id}`, payload).then(r => r.data); },
  remove(id) { return api.delete(`/quizzes/${id}`).then(r => r.data); },
};