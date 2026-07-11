import request from '@/utils/request'

// 字典类型
export function getDictionaryTypesApi(params) {
  return request.get('/api/dictionary/type', { params })
}

export function createDictionaryTypeApi(data) {
  return request.post('/api/dictionary/type', data)
}

export function updateDictionaryTypeApi(id, data) {
  return request.put(`/api/dictionary/type/${id}`, data)
}

export function deleteDictionaryTypeApi(id) {
  return request.delete(`/api/dictionary/type/${id}`)
}

// 字典枚举
export function getDictionaryEnumsApi(typeId) {
  return request.get('/api/dictionary/enum', { params: { typeId } })
}

export function createDictionaryEnumApi(data) {
  return request.post('/api/dictionary/enum', data)
}

export function updateDictionaryEnumApi(id, data) {
  return request.put(`/api/dictionary/enum/${id}`, data)
}

export function deleteDictionaryEnumApi(id) {
  return request.delete(`/api/dictionary/enum/${id}`)
}
