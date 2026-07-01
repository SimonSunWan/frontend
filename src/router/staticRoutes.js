// 静态路由：无需权限即可访问
export const staticRoutes = [
  {
    path: '/auth/login',
    name: 'Login',
    component: () => import('@/views/auth/login.vue'),
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: () => import('@/views/auth/register.vue'),
  },
  {
    path: '/auth/forget-password',
    name: 'ForgetPassword',
    component: () => import('@/views/auth/forget-password.vue'),
  },
]
