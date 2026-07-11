import request from '@/utils/request'

export function getDepartmentListApi(params) {
  return request.get('/api/department/', { params })
}

export function getDepartmentTreeApi() {
  return request.get('/api/department/tree')
}

export function createDepartmentApi(data) {
  return request.post('/api/department/', data)
}

export function updateDepartmentApi(id, data) {
  return request.put(`/api/department/${id}`, data)
}

export function deleteDepartmentApi(id) {
  return request.delete(`/api/department/${id}`)
}
