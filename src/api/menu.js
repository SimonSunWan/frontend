import request from '@/utils/request'

export function getMenuListApi(params) {
  return request.get('/api/menu/', { params })
}

export function getMenuTreeApi() {
  return request.get('/api/menu/tree')
}

export function getNavigationMenusApi() {
  return request.get('/api/menu/navigation')
}

export function createMenuApi(data) {
  return request.post('/api/menu/', data)
}

export function updateMenuApi(id, data) {
  return request.put(`/api/menu/${id}`, data)
}

export function deleteMenuApi(id) {
  return request.delete(`/api/menu/${id}`)
}
