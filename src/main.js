import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import './styles/element/index.scss'
import 'nprogress/nprogress.css'
import './styles/tokens.scss'
import './styles/reset.scss'
import './styles/element-overrides.scss'
import './assets/iconfont/iconfont.css'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus, { locale: zhCn })

// 在挂载前初始化主题，避免刷新时闪烁
useThemeStore().initTheme()

app.mount('#app')
