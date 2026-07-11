import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { getNavigationMenusApi } from '@/api/menus'
import { registerDynamicRoutes } from './registerRoutes'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

/**
 * 设置路由全局前置守卫
 */
export function setupGuard(router) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start()
    const authStore = useAuthStore()
    const menuStore = useMenuStore()

    // 未登录：放行所有 /auth 下页面，其余跳登录
    if (!authStore.token) {
      return next(to.path.startsWith('/auth/') ? undefined : '/auth/login')
    }

    // 已登录访问登录页 → 跳转首页
    if (to.path === '/auth/login') {
      return next(menuStore.homePath || '/')
    }

    // 首次进入：注册动态路由
    if (!menuStore.isRouteRegistered) {
      return getNavigationMenusApi()
        .then((res) => {
          const menus = res?.data || []
          const removeFns = registerDynamicRoutes(router, menus)
          menuStore.setMenuList(menus)
          menuStore.addRemoveRouteFns(removeFns)
          menuStore.isRouteRegistered = true
        })
        .then(() => {
          // 注册完成后重新导航；根路径直接跳首页避免循环
          const target = to.path === '/' ? menuStore.homePath || '/auth/login' : to.path
          next({ path: target, query: to.query, replace: true })
        })
        .catch(() => {
          authStore.logout()
          next('/auth/login')
        })
    }

    // 根路径跳转首页（homePath 为空则回登录页，避免死循环）
    if (to.path === '/') {
      return next(menuStore.homePath || '/auth/login')
    }

    next()
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
