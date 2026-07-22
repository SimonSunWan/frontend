// 静态路由
export const staticRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/index.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/user/index.vue'),
  },
  {
    path: '/forget',
    name: 'Forget',
    component: () => import('@/views/user/index.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/error/404.vue'),
  },
]
