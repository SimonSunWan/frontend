import request from '@/utils/request'

export function loginApi(data) {
  return request.post('/api/user/login', data)
}

export function getUserInfoApi() {
  return request.get('/api/user/me')
}

export function updateUserInfoApi(data) {
  return request.put('/api/user/me', data)
}

export function changePasswordApi(data) {
  return request.put('/api/user/me/change', data)
}

export function getUserListApi(params) {
  return request.get('/api/user/', { params })
}

export function createUserApi(data) {
  return request.post('/api/user/', data)
}

export function updateUserApi(id, data) {
  return request.put(`/api/user/${id}`, data)
}

export function deleteUserApi(id) {
  return request.delete(`/api/user/${id}`)
}

export function registerApi(data) {
  return request.post('/api/user/register', data)
}

export function forgetPasswordApi(data) {
  return request.post('/api/user/forget', data)
}
