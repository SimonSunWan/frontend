import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'
import { getNavigationMenusApi } from '@/api/menu'
import { registerDynamicRoutes } from './registerRoutes'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

export function setupGuard(router) {
  router.beforeEach((to) => {
    NProgress.start()
    const authStore = useAuthStore()
    const menuStore = useMenuStore()

    if (!authStore.token) {
      return to.path.startsWith('/auth/') ? true : '/auth/login'
    }

    if (to.path === '/auth/login') {
      return menuStore.homePath || '/'
    }

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
          const target = to.path === '/' ? menuStore.homePath || '/auth/login' : to.path
          return { path: target, query: to.query, replace: true }
        })
        .catch(() => {
          authStore.logout()
          return '/auth/login'
        })
    }

    if (to.path === '/') {
      return menuStore.homePath || '/auth/login'
    }

    return true
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
