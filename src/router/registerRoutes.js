import InsLayout from '@/components/InsLayout.vue'

const modules = import.meta.glob('../views/**/*.vue')

function loadComponent(path) {
  if (!path) return null
  const key = `../views${path}.vue`
  return modules[key] || null
}

function getRelativePath(parentPath, childPath) {
  if (childPath.startsWith(parentPath + '/')) {
    return childPath.slice(parentPath.length + 1)
  }
  return childPath
}

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
          keepAlive: node.meta?.keepAlive,
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

export function registerDynamicRoutes(router, menuList) {
  const removeFns = []

  menuList.forEach((menu) => {
    if (menu.meta?.isLink) return

    const childNodes = (menu.children || []).filter((c) => !c.meta?.isLink && c.path)
    const children = collectLeafRoutes(childNodes, menu.path)

    if (children.length) {
      const removeFn = router.addRoute({
        path: menu.path,
        name: menu.name,
        component: InsLayout,
        redirect: getFirstNavigablePath(childNodes, menu.path) || undefined,
        children,
      })
      removeFns.push(removeFn)
    } else {
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
              meta: { title: menu.meta?.title || menu.name, keepAlive: menu.meta?.keepAlive },
            },
          ],
        })
        removeFns.push(removeFn)
      }
    }
  })

  return removeFns
}
