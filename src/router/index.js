import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/auth/login',
    },
    {
      path: '/auth/login',
      name: 'Login',
      component: () => import('@/views/auth/login.vue'),
    },
    {
      path: '/system',
      component: () => import('@/components/Layout.vue'),
      redirect: '/system/mine',
      children: [
        {
          path: 'mine',
          name: 'Mine',
          component: () => import('@/views/system/mine.vue'),
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('@/views/system/user.vue'),
        },
        {
          path: 'role',
          name: 'Role',
          component: () => import('@/views/system/role.vue'),
        },
        {
          path: 'dept',
          name: 'Dept',
          component: () => import('@/views/system/dept.vue'),
        },
        {
          path: 'menu',
          name: 'Menu',
          component: () => import('@/views/system/menu.vue'),
        },
        {
          path: 'dict',
          name: 'Dict',
          component: () => import('@/views/system/dict.vue'),
        },
      ],
    },
  ],
})

export default router
