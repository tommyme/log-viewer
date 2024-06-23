import { createRouter, createWebHistory } from 'vue-router'

export const myroutes = [
  { path: '/', name: 'home', component: () => import("../layout/MainLayout.vue"),
    children: [
      { path: 'viewer', name: 'viewer', component: () => import('../views/HomeView.vue') },
      { path: 'telnet', name: 'telnet', component: () => import('../views/TelnetView.vue') },
      { path: 'reg64', name: 'reg64', component: () => import('../views/Reg64View.vue') },
      { path: 'editor', name: 'editor', component: () => import('../views/EditorView.vue') },
      { path: 'workflow', name: 'workflow', component: () => import('../views/WorkflowView.vue') },
    ]
  },
]
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: myroutes
})

export default router
