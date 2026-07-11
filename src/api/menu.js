import request from '@/utils/request'

export function getMenuListApi(params) {
  return request.get('/api/menus/', { params })
}

export function getMenuTreeApi() {
  return request.get('/api/menus/tree')
}

export function getNavigationMenusApi() {
  return request.get('/api/menus/navigation')
}

export function createMenuApi(data) {
  return request.post('/api/menus/', data)
}

export function updateMenuApi(id, data) {
  return request.put(`/api/menus/${id}`, data)
}

export function deleteMenuApi(id) {
  return request.delete(`/api/menus/${id}`)
}
