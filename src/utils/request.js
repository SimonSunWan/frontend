import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '',
  timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const { status } = error.response
    if (status === 401 || status === 422) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      window.location.href = '/auth/login'
      return Promise.reject(error)
    }
    const message = error.response?.data?.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  },
)

export default request
