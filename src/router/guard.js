import { useUserStore } from '@/stores/user'
import { useMenuStore } from '@/stores/menu'
import { getNavigationMenusApi } from '@/api/menu'
import { registerDynamicRoutes } from './registerRoutes'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false, trickleSpeed: 200 })

const PUBLIC_PATHS = ['/login', '/register', '/forget']

export function setupGuard(router) {
  router.beforeEach((to) => {
    NProgress.start()
    const userStore = useUserStore()
    const menuStore = useMenuStore()

    if (!userStore.token) {
      return PUBLIC_PATHS.includes(to.path) ? true : '/login'
    }

    if (to.path === '/login') {
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
          const target = to.path === '/' ? menuStore.homePath || '/login' : to.path
          return { path: target, query: to.query, replace: true }
        })
        .catch(() => {
          userStore.logout()
          return '/login'
        })
    }

    if (to.path === '/') {
      return menuStore.homePath || '/login'
    }

    return true
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
