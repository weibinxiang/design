// const prefix = import.meta.env
const prefix = process.env
const ENV = import.meta.env
const isDev = prefix.NODE_ENV === 'development'
import { version } from '../package.json'

console.log('env', ENV)

export default {
  isDev,
  BASE_URL: ENV.VITE_PUBLIC_PATH,
  VERSION: version,
  APP_NAME: '易知课堂',
  COPYRIGHT: 'author.yizhiknow.com',
  API_URL: ENV.VITE_GLOB_API_URL, // 服务端地址
  SCREEN_URL: isDev ? 'http://localhost:7001' : 'http://192.168.5.130:7001', // 截图服务地址
  IMG_URL: '',
  ICONFONT_URL: '//at.alicdn.com/t/font_2717063_ypy8vprc3b.css?display=swap',
  ICONFONT_EXTRA: '//at.alicdn.com/t/c/font_3228074_zubqmza1sdk.css',
  supportSubFont: false, // 是否开启服务端字体压缩
  SIGN_KEY: ENV.VITE_GLOB_SIGN_KEY,
}
