import { createRouter, createWebHistory } from "vue-router";
import workspace from "../views/WorkSpaceView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/WorkSpaceView.vue"),
  },
  {
    path: "/workspace",
    name: "workspace",
    component: () => import("../views/WorkSpaceView.vue"),
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

