import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMenuStore } from '@/stores/menu'

const tabs = ref([])
let initialized = false

export function useTabs() {
  const router = useRouter()
  const route = useRoute()
  const menuStore = useMenuStore()

  const addTab = (path) => {
    const matched = router.resolve(path)
    const title = matched?.meta?.title || path
    if (!tabs.value.find((t) => t.path === path)) {
      tabs.value.push({ path, title })
    }
  }

  const removeTab = (path) => {
    const idx = tabs.value.findIndex((t) => t.path === path)
    if (idx === -1) return
    tabs.value.splice(idx, 1)
    if (route.path === path) {
      const next = tabs.value[tabs.value.length - 1]
      router.push(next ? next.path : menuStore.homePath || '/')
    }
  }

  const closeOthers = (keepPath) => {
    const keep = keepPath || route.path
    tabs.value = tabs.value.filter((t) => t.path === keep)
  }

  const closeAll = () => {
    const home = menuStore.homePath || '/'
    tabs.value = []
    router.push(home).catch(() => {})
    addTab(home)
  }

  const switchTab = (path) => {
    router.push(path)
  }

  if (!initialized) {
    addTab(route.path)
    initialized = true
  }

  return { tabs, addTab, removeTab, closeOthers, closeAll, switchTab }
}
