import Layout from '@/components/Layout.vue'

// 动态加载 views 下所有 vue 组件
const modules = import.meta.glob('../views/**/*.vue')

/**
 * 根据菜单 path 加载对应组件
 * 菜单 path 如 "/system/user-center" -> ../views/system/user-center.vue
 */
function loadComponent(path) {
  if (!path) return null
  const key = `../views${path}.vue`
  return modules[key] || null
}

/**
 * 计算子路由相对路径（剥离父级前缀）
 */
function getRelativePath(parentPath, childPath) {
  if (childPath.startsWith(parentPath + '/')) {
    return childPath.slice(parentPath.length + 1)
  }
  return childPath
}

/**
 * 将后端菜单数据转换为路由并注册到 router
 * @returns 返回用于移除动态路由的函数数组
 */
export function registerDynamicRoutes(router, menuList) {
  const removeFns = []

  menuList.forEach((menu) => {
    if (menu.meta?.isLink) return

    const childMenus = (menu.children || []).filter(
      (c) => !c.meta?.isLink && c.path,
    )
    const children = childMenus
      .map((child) => {
        const component = loadComponent(child.path)
        if (!component) return null
        return {
          path: getRelativePath(menu.path, child.path),
          name: child.name || child.path,
          component,
          meta: {
            title: child.meta?.title || child.name,
            icon: child.meta?.icon,
          },
        }
      })
      .filter(Boolean)

    if (children.length) {
      // 父级菜单：使用 Layout 包裹子路由
      const removeFn = router.addRoute({
        path: menu.path,
        name: menu.name,
        component: Layout,
        redirect: menu.path + '/' + children[0].path,
        children,
      })
      removeFns.push(removeFn)
    } else {
      // 独立菜单（无子级）
      const component = loadComponent(menu.path)
      if (component) {
        const removeFn = router.addRoute({
          path: menu.path,
          name: menu.name,
          component: Layout,
          children: [
            {
              path: '',
              name: (menu.name || menu.path) + '_index',
              component,
              meta: { title: menu.meta?.title || menu.name },
            },
          ],
        })
        removeFns.push(removeFn)
      }
    }
  })

  return removeFns
}
