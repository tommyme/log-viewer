import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // { path: '/', name: 'home', component: ()=>{import('../views/HomeView.vue')} },
    { path: '/', name: 'home', component: HomeView },
    { path: '/telnet', name: 'telnet', component: () => import('../views/TelnetView.vue') },
  ]
})

export default router
