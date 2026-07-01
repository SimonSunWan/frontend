import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMenuStore = defineStore('menu', () => {
  const menuList = ref([])
  const homePath = ref('')
  const removeRouteFns = ref([])
  const isRouteRegistered = ref(false)

  function getFirstPath(list) {
    for (const item of list) {
      if (item.children?.length) {
        const p = getFirstPath(item.children)
        if (p) return p
      } else if (item.path && !item.meta?.isLink) {
        return item.path
      }
    }
    return ''
  }

  function setMenuList(list) {
    menuList.value = list
    if (!homePath.value) homePath.value = getFirstPath(list)
  }

  function addRemoveRouteFns(fns) {
    removeRouteFns.value.push(...fns)
  }

  function removeAllDynamicRoutes() {
    removeRouteFns.value.forEach((fn) => fn())
    removeRouteFns.value = []
  }

  function resetMenu() {
    removeAllDynamicRoutes()
    menuList.value = []
    homePath.value = ''
    isRouteRegistered.value = false
  }

  return {
    menuList,
    homePath,
    isRouteRegistered,
    setMenuList,
    addRemoveRouteFns,
    removeAllDynamicRoutes,
    resetMenu,
  }
})
