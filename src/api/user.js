import request from '@/utils/request'

export function loginApi(data) {
  return request.post('/api/auth/login', data)
}

export function getUserInfoApi() {
  return request.get('/api/users/me')
}

export function updateUserInfoApi(data) {
  return request.put('/api/users/me', data)
}

export function changePasswordApi(data) {
  return request.put('/api/users/me/change-password', data)
}

export function getUserListApi(params) {
  return request.get('/api/users/', { params })
}

export function createUserApi(data) {
  return request.post('/api/users/', data)
}

export function updateUserApi(id, data) {
  return request.put(`/api/users/${id}`, data)
}

export function deleteUserApi(id) {
  return request.delete(`/api/users/${id}`)
}

export function registerApi(data) {
  return request.post('/api/users/register', data)
}

export function forgetPasswordApi(data) {
  return request.post('/api/users/forget-password', data)
}
