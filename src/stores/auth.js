import { getUserInfoApi, loginApi } from '@/api/user'
import { useMenuStore } from '@/stores/menu'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  function setToken(val) {
    token.value = val
    localStorage.setItem('token', val)
  }

  function setUserInfo(val) {
    userInfo.value = val
    localStorage.setItem('userInfo', JSON.stringify(val))
  }

  function getUserInfo() {
    return getUserInfoApi().then((res) => {
      setUserInfo(res.data)
      return res.data
    })
  }

  function login(data) {
    return loginApi(data).then((res) => {
      setToken(res.data.accessToken)
      return getUserInfo()
    })
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    useMenuStore().resetMenu()
  }

  return { token, userInfo, setToken, setUserInfo, getUserInfo, login, logout }
})
