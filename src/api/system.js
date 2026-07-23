import request from '@/utils/request'

export function getSystemSettingApi(settingKey) {
  return request.get(`/api/system/${settingKey}`)
}
