import { createRouter, createWebHistory } from "vue-router";

import TodoList from "@/components/TodoList.vue";
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
    path: "/todos",
    name: "todos",
    component: TodoList,
  },
  {
    path: "/home",
    redirect: "/workspace", 
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
