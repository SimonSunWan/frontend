import request from '@/utils/request'

export function getRoleListApi(params) {
  return request.get('/api/roles/', { params })
}

export function getAllRolesApi() {
  return request.get('/api/roles/all')
}

export function createRoleApi(data) {
  return request.post('/api/roles/', data)
}

export function updateRoleApi(id, data) {
  return request.put(`/api/roles/${id}`, data)
}

export function deleteRoleApi(id) {
  return request.delete(`/api/roles/${id}`)
}

export function getRoleMenusApi(id) {
  return request.get(`/api/roles/${id}/menus`)
}

export function updateRoleMenusApi(id, menuIds) {
  return request.post(`/api/roles/${id}/menus`, { menuIds })
}
