import request from '@/utils/request'

// 字典类型
export function getDictionaryTypesApi(params) {
  return request.get('/api/dictionary/types', { params })
}

export function createDictionaryTypeApi(data) {
  return request.post('/api/dictionary/types', data)
}

export function updateDictionaryTypeApi(id, data) {
  return request.put(`/api/dictionary/types/${id}`, data)
}

export function deleteDictionaryTypeApi(id) {
  return request.delete(`/api/dictionary/types/${id}`)
}

// 字典枚举
export function getDictionaryEnumsApi(typeId) {
  return request.get('/api/dictionary/enums', { params: { typeId } })
}

export function createDictionaryEnumApi(data) {
  return request.post('/api/dictionary/enums', data)
}

export function updateDictionaryEnumApi(id, data) {
  return request.put(`/api/dictionary/enums/${id}`, data)
}

export function deleteDictionaryEnumApi(id) {
  return request.delete(`/api/dictionary/enums/${id}`)
}
