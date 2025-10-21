import { createRouter, createWebHistory } from "vue-router";
import workspace from "../components/Workspace.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: workspace,
  },
  {
    path: "/workspace",
    name: "workspace",
    component: workspace,
  },
  {
    path: "/",
    redirect: "/notes",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
