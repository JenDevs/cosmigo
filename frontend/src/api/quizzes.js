import axios from "axios";

// peka direkt på backenden
export const api = axios.create({ baseURL: "http://localhost:3000/api" });

export const Quizzes = {
  list()   { return api.get("/quizzes").then(r => r.data); },
  listArchived() { return api.get("/quizzes", { params: { status: "archived" }}).then(r => r.data); },
  get(id)  { return api.get(`/quizzes/${encodeURIComponent(id)}`).then(r => r.data); },
  create(payload) { return api.post("/quizzes", payload).then(r => r.data); },
  update(id, payload) { return api.put(`/quizzes/${encodeURIComponent(id)}`, payload).then(r => r.data); },
  remove(id) { return api.delete(`/quizzes/${encodeURIComponent(id)}`).then(r => r.data); },
};
