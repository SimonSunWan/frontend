import request from '@/utils/request'

export function getDepartmentListApi(params) {
  return request.get('/api/departments/', { params })
}

export function getDepartmentTreeApi() {
  return request.get('/api/departments/tree')
}

export function createDepartmentApi(data) {
  return request.post('/api/departments/', data)
}

export function updateDepartmentApi(id, data) {
  return request.put(`/api/departments/${id}`, data)
}

export function deleteDepartmentApi(id) {
  return request.delete(`/api/departments/${id}`)
}
