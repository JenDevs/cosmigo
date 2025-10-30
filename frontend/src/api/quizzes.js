import axios from "axios";

export const Quizzes = {
  list(userId, opts = {}) {
    return axios
      .get(`/api/users/${userId}/quizzes`, {
        params: opts.status ? { status: opts.status } : {},
      })
      .then((r) => r.data);
  },

  listArchived(userId) {
    return this.list(userId, { status: "archived" });
  },

  get(userId, id) {
    return axios
      .get(`/api/users/${userId}/quizzes/${id}`)
      .then((r) => r.data);
  },

  create(userId, payload) {
    return axios
      .post(`/api/users/${userId}/quizzes`, payload)
      .then((r) => r.data);
  },

  update(userId, id, payload) {
    return axios
      .put(`/api/users/${userId}/quizzes/${id}`, payload)
      .then((r) => r.data);
  },

  remove(userId, id) {
    return axios
      .delete(`/api/users/${userId}/quizzes/${id}`)
      .then((r) => r.data);
  },

  archive(userId, id) {
    return axios
      .post(`/api/users/${userId}/quizzes/${id}/archive`, {})
      .then((r) => r.data);
  },
};
