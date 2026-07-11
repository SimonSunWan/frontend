import InsLayout from '@/components/InsLayout.vue'

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
 * 递归收集菜单树下所有可跳转的叶子路由（统一挂到顶层路由下）
 * @param {Array} nodes 当前层级的菜单节点
 * @param {string} topPath 顶层菜单 path，用于计算相对路径
 * @param {Array} result 收集结果
 */
function collectLeafRoutes(nodes, topPath, result = []) {
  nodes.forEach((node) => {
    if (node.meta?.isLink) return

    const component = loadComponent(node.path)
    if (component) {
      result.push({
        path: getRelativePath(topPath, node.path),
        name: node.name || node.path,
        component,
        meta: {
          title: node.meta?.title || node.name,
          icon: node.meta?.icon,
        },
      })
    }

    const childNodes = (node.children || []).filter((c) => !c.meta?.isLink && c.path)
    if (childNodes.length) {
      collectLeafRoutes(childNodes, topPath, result)
    }
  })
  return result
}

/**
 * 取第一个可跳转的菜单 path（优先直接子节点，其次递归其子树）
 * 用于顶层路由的 redirect
 */
function getFirstNavigablePath(nodes, topPath) {
  for (const node of nodes) {
    if (node.meta?.isLink) continue
    if (loadComponent(node.path)) {
      return topPath + '/' + getRelativePath(topPath, node.path)
    }
  }
  for (const node of nodes) {
    if (node.meta?.isLink) continue
    const childNodes = (node.children || []).filter((c) => !c.meta?.isLink && c.path)
    if (childNodes.length) {
      const p = getFirstNavigablePath(childNodes, node.path)
      if (p) return p
    }
  }
  return ''
}

/**
 * 将后端菜单数据转换为路由并注册到 router
 * @returns 返回用于移除动态路由的函数数组
 */
export function registerDynamicRoutes(router, menuList) {
  const removeFns = []

  menuList.forEach((menu) => {
    if (menu.meta?.isLink) return

    const childNodes = (menu.children || []).filter((c) => !c.meta?.isLink && c.path)
    const children = collectLeafRoutes(childNodes, menu.path)

    if (children.length) {
      // 父级菜单：使用 InsLayout 包裹所有子路由（含任意层级的叶子节点）
      const removeFn = router.addRoute({
        path: menu.path,
        name: menu.name,
        component: InsLayout,
        redirect: getFirstNavigablePath(childNodes, menu.path) || undefined,
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
          component: InsLayout,
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
