/*
 * @Author: ShawnPhang
 * @Date: 2021-07-13 02:48:38
 * @Description: 接口规则：只有正确code为200时返回result结果对象，错误返回整个结果对象
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-09-28 15:58:41
 */
import axios from 'axios'
import store from '@/store'
import app_config from '@/config'
import { randomString, sortAscii, paramsFilters, deepMerge } from './utils'
import CryptoJS from 'crypto-js'
import Base64 from 'crypto-js/enc-base64'
import MD5 from 'crypto-js/md5'
import Utf8 from 'crypto-js/enc-utf8'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Action } from 'element-plus'

const signKey = 'O+gm1/AXCp1ERKJko3jOGw=='
const aseKey = '12345678'
const decrypt = CryptoJS.AES.decrypt(signKey, CryptoJS.enc.Utf8.parse(aseKey), {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7,
}).toString(CryptoJS.enc.Utf8)

axios.defaults.timeout = 30000
// axios.defaults.headers.Authorization = 'Bearer ';
// const version = app_config.VERSION;
const baseUrl = app_config.API_URL

// 请求拦截器
axios.interceptors.request.use(
  (config: Type.Object) => {
    // const access_token = store.state.currentUser.access_token;
    const url = config.url
    const values = {}
    // values.access_token = access_token;
    // values.version = version;
    config.headers.token = store.state.token
    console.log('ss', store.state.token)

    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
      url.indexOf('/') === 0 ? (config.url = baseUrl + url) : (config.url = baseUrl + '/' + url)
    }

    if (config.method === 'get') {
      //  config.params = utils.extend(config.params, values)
      config.params = Object.assign(config.params, values)
      // config.params = qs.stringify(config.params);
    } else {
      config.data = Object.assign(config.data, values)
      //  config.data = utils.extend(config.data, values)
      // config.data = qs.stringify(config.data);
    }
    const params = config.params || config.data || {}
    paramsFilters(params)

    // 如果 token 存在
    // 让每个请求携带自定义 token 请根据实际情况自行修改
    const final_token = config.headers.token // 最终发送的token
    const timeStamp = Math.round(new Date().getTime() / 1000) + 0 // 时间戳
    const nonceStr = randomString(32) // 随机字符串
    // 生成需要签名的对象（获取所有的get和post值）
    // 将对象ascii码排序
    const sortString = sortAscii(deepMerge({ nonce_str: nonceStr, time_stamp: timeStamp, token: final_token }, params))

    // 字符串base64加密
    const signString = decrypt + Base64.stringify(Utf8.parse(sortString))
    // console.log('MD5前：', sortString);
    // md5加密
    const sign = MD5(signString).toString()
    // console.log('MD5后：', sign);
    // 对timeStamp进行hash取余，根据取余结果判断签名和token的排序
    const signType = (timeStamp % 5) % 2
    const newSign = signType ? sign + final_token : final_token + sign
    config.headers['time-stamp'] = timeStamp.toString()
    config.headers['nonce-str'] = nonceStr
    config.headers['sign'] = newSign

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// 响应拦截器
axios.interceptors.response.use(
  (res: Type.Object) => {
    // store.dispatch('hideLoading');

    // if (res.status !== 200) {
    //   // return falseInfo
    // }

    if (!res.data) {
      return Promise.reject(res)
    }
    // console.log(res.headers.authorization);
    if ([3216002, 3003, 3002].includes(res.data.code)) {
      ElMessageBox.alert('请重新登录', '登录超时', {
        confirmButtonText: '确认',
        type: 'warning',
        callback: (action: Action) => {
          if (action === 'confirm') {
            window.parent?.postMessage('请重新登录', '*')
          }
        },
      })
      store.commit('changeOnline', false)
    }

    // if (res.data.result && res.data.code === 200) {
    //   return Promise.resolve(res.data.result)
    // } else if (res.data.data && res.data.stat == 1) {
    //   return Promise.resolve(res.data.data)
    // } else
    if (res.data && res.data.code === 200) {
      return Promise.resolve(res.data)
    }
  },
  (error) => {
    // if (error.response.status === 401) {
    //   setTimeout(() => {
    //     window.localStorage.clear()
    //     // window.location.href = app_config.login + "?" + "redirect=" + window.location.href;
    //   }, 1000)
    // }
    store.dispatch('hideLoading')
    return Promise.reject(error)
  },
)

// export default axios;
const fetch = (url: string, params: Type.Object, type: string | undefined = 'get', exheaders: Type.Object = {}, extra: any = {}) => {
  if (params && params._noLoading) {
    delete params._noLoading
  } else {
    // store.commit('loading', '加载中..');
  }

  const objtest: Type.Object = {}
  // const { value } = JSON.parse(localStorage.getItem('pro__Access-Token') || '{}')
  // objtest.Authorization = `Bearer ${value}`
  if (type === 'get') {
    return axios.get(url, {
      // headers: {
      //   // Authorization: String(localStorage.getItem('token')),
      // },
      headers: Object.assign(objtest, exheaders),
      params,
      ...extra,
    })
  } else {
    return (axios as Type.Object)[type](url, params, {
      headers: Object.assign(objtest, exheaders),
      ...extra,
    })
  }
}

export default fetch
