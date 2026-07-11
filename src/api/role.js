import request from '@/utils/request'

export function getRoleListApi(params) {
  return request.get('/api/role/', { params })
}

export function getAllRolesApi() {
  return request.get('/api/role/all')
}

export function createRoleApi(data) {
  return request.post('/api/role/', data)
}

export function updateRoleApi(id, data) {
  return request.put(`/api/role/${id}`, data)
}

export function deleteRoleApi(id) {
  return request.delete(`/api/role/${id}`)
}

export function getRoleMenusApi(id) {
  return request.get(`/api/role/${id}/menu`)
}

export function updateRoleMenusApi(id, menuIds) {
  return request.post(`/api/role/${id}/menu`, { menuIds })
}
