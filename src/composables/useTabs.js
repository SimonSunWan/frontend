import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const tabs = ref([])
let initialized = false

export function useTabs() {
  const router = useRouter()
  const route = useRoute()

  const routeMap = {
    '/system/mine': '个人中心',
    '/system/user': '用户管理',
    '/system/role': '角色管理',
    '/system/dept': '部门管理',
    '/system/menu': '菜单管理',
    '/system/dict': '字典管理',
  }

  const addTab = (path) => {
    if (!tabs.value.find((t) => t.path === path)) {
      tabs.value.push({ path, title: routeMap[path] || path })
    }
  }

  const removeTab = (path) => {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx === -1) return
    tabs.value.splice(idx, 1)
    if (route.path === path) {
      const next = tabs.value[tabs.value.length - 1]
      router.push(next ? next.path : '/system/mine')
    }
  }

  const switchTab = (path) => {
    router.push(path)
  }

  if (!initialized) {
    addTab(route.path)
    initialized = true
  }

  return { tabs, addTab, removeTab, switchTab }
}
