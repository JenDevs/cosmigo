import { createRouter, createWebHistory } from "vue-router";
//import NoteView from "@/views/NoteView.vue";
//import QuizView from "@/views/QuizView.vue";

const routes = [
  { path: "/", redirect: "/notes" },
  //{ path: "/notes", component: NoteView },
  //{ path: "/quiz", component: QuizView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
