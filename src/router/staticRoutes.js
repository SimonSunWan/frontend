// 静态路由：无需权限即可访问
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
]
