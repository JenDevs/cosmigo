//WHAT IS THIS
import { createRouter, createWebHistory } from "vue-router";
import workspace from "../views/WorkSpaceView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
  ],
});

export default router;
