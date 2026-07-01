import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from './staticRoutes'
import { setupGuard } from './guard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
})

setupGuard(router)

export default router
