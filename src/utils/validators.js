export const userNameRule = [
  { required: true, message: '请输入用户名', trigger: 'blur' },
  {
    pattern: /^[a-zA-Z][a-zA-Z0-9_]{3,19}$/,
    message: '字母开头, 4-20位, 支持字母、数字、下划线',
    trigger: 'blur',
  },
]

export const nickNameRule = [
  { required: true, message: '请输入姓名', trigger: 'blur' },
  {
    pattern: /^[\u4e00-\u9fa5a-zA-Z\s]{2,20}$/,
    message: '2-20位, 支持中文、英文字母、空格',
    trigger: 'blur',
  },
]

export const phoneRule = [
  { required: true, message: '请输入手机号', trigger: 'blur' },
  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
]

export const passwordRule = [
  { required: true, message: '请输入密码', trigger: 'blur' },
  {
    pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/,
    message: '6-20位, 必须包含字母和数字',
    trigger: 'blur',
  },
]

export const emailRule = [
  {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入正确的邮箱格式',
    trigger: 'blur',
  },
]

export const createConfirmPasswordRule = (getOtherValue) => [
  { required: true, message: '请再次输入密码', trigger: 'blur' },
  {
    validator: (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入密码'))
      } else if (value !== getOtherValue()) {
        callback(new Error('两次输入密码不一致'))
      } else {
        callback()
      }
    },
    trigger: 'blur',
  },
]
