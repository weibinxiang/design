/*
 * @Author: ShawnPhang
 * @Date: 2022-03-03 14:13:16
 * @Description:
 * @LastEditors: ShawnPhang <site: book.palxp.com>
 * @LastEditTime: 2023-06-29 15:11:46
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import utils from './utils'

import 'normalize.css/normalize.css'
import '@/assets/styles/index.less'
import elementConfig from './utils/widgets/elementConfig'
import CryptoJS from 'crypto-js'

const app = createApp(App)

elementConfig.components.forEach((component) => {
  app.component(component.name, component)
})

elementConfig.plugins.forEach((plugin: any) => {
  app.use(plugin)
})

// 初次加载处理token操作，导航栏没带就取本地的
try {
  const search = window.location.search.substr(1) || ''
  const query = new URLSearchParams(search)
  const key = query.get('t') || JSON.parse(localStorage.getItem('DESIGN_INFO') || '')?.token
  if (query.get('t')) {
    localStorage.setItem('DESIGN_INFO', JSON.stringify({ token: query.get('t') }))
  }
  const t = window.atob(decodeURIComponent(key))
  const token = CryptoJS.AES.decrypt(t, 'O+gm1/AXCp1ERKJko3jOGw==').toString(CryptoJS.enc.Utf8)
  store.commit('setToken', token || '')
} catch {}

app.use(store).use(router).use(utils).mount('#app')
