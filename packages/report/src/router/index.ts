import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/order',
      name: 'OrderReport',
      component: () => import('@/views/OrderReport.vue'),
    },
    {
      path: '/finance',
      name: 'FinanceReport',
      component: () => import('@/views/FinanceReport.vue'),
    },
    {
      path: '/project',
      name: 'ProjectReport',
      component: () => import('@/views/ProjectReport.vue'),
    },
  ],
})

export default router
