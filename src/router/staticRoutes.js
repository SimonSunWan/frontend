// 静态路由
export const staticRoutes = [
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/auth/index.vue'),
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/views/auth/index.vue'),
  },
  {
    path: '/auth/forget',
    name: 'Forget',
    component: () => import('@/views/auth/index.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
  },
]
