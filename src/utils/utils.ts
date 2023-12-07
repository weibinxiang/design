import app_config from '@/config'
import { isObject, isArray, isBoolean } from './is'

export const config = app_config

/**
 * 星期换算
 * @param {String} 'YYYY-MM-DD'
 */
// export const transformDate = (date: string) => {
//   const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
//   const myDate = new Date(date.replace(/-/g, '/'))
//   if (weekDay[myDate.getDay()]) {
//     return weekDay[myDate.getDay()]
//   } else {
//     return ''
//   }
// }
/**
 * 返回正确时间
 */
// export const getDate = (date: string) => {
//   const reDate = new Date(date.replace(/-/g, '/'))
//   return reDate
// }
/**
 * 短日期
 */
// export const getMinDate = (d: string, type: string) => {
//   const mydate = new Date(d.replace(/-/g, '/'))
//   if (isNaN(mydate.getDate())) {
//     return d
//   }
//   if (type === 'ym') {
//     return mydate.getFullYear() + ' - ' + (mydate.getMonth() + 1)
//   } else if (type === 'md') {
//     return mydate.getMonth() + 1 + '-' + mydate.getDate()
//   } else {
//     return String(mydate.getMonth() + 1).padStart(2, '0')
//   }
// }
// 判断是否在数组中并返回下标
export const isInArray = (arr: Type.Object[], value: any) => {
  if (arr.indexOf && typeof arr.indexOf === 'function') {
    const index = arr.indexOf(value)
    if (index >= 0) {
      return index
    }
  }
  return false
}
/** 删除多个对象元素 */
export const deleteSome = (obj: Type.Object, arr: string[]) => {
  arr.forEach((key) => {
    delete obj[key]
  })
  return obj
}
/** 拾取对象元素 */
export const pickSome = (obj: Type.Object, arr: string[]) => {
  const newObj: Type.Object = {}
  arr.forEach((key) => {
    newObj[key] = obj[key]
  })
  return newObj
}
/** String长度 */
// export const getBLen = (str: string | any) => {
//   if (str === null) {
//     return 0
//   }
//   return String(str).replace(/[^\x00-\xff]/g, '01').length
// }
/** 随机 */
export const rndNum = (n: number, m: number) => {
  const random = Math.floor(Math.random() * (m - n + 1) + n)
  return random
}

// 按ascii码从小到大排序
export function sortAscii(obj) {
  let str = ''

  const testFun = function (item) {
    const ss = ''
    if (item === null) {
      item = ''
    }
    if (isObject(item)) {
      return ss + `{${sortAscii(item)}}`
    } else if (isArray(item)) {
      return ss + `[${sortAscii(item)}]`
    } else {
      return ss + item
    }
  }
  if (isObject(obj)) {
    const keys = Object.keys(obj).sort()
    for (const item in keys) {
      str += keys[item] + '=' + testFun(obj[keys[item]]) + '&'
    }
    const char = '&'
    str = str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '')
  } else if (isArray(obj)) {
    obj.forEach((element) => {
      str += testFun(element) + ','
    })
    const char = ','
    str = str.replace(new RegExp('^\\' + char + '+|\\' + char + '+$', 'g'), '')
  }
  return str
}

// 过滤undefined和null的参数 Boolean转换为数字
export function paramsFilters(params) {
  for (const key in params) {
    params[key] ?? delete params[key]
    if (isObject(params[key])) {
      paramsFilters(params[key])
    } else if (isArray(params[key])) {
      params[key].forEach((item) => isObject(item) && paramsFilters(item))
      !params[key].length && delete params[key]
    } else if (isBoolean(params[key])) {
      params[key] = Number(params[key])
    }
  }
}

/* 生成随机字符串 */
export function randomString(len) {
  len = len || 32
  const $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz-'
  // const $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  /** **默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  const maxPos = $chars.length
  let pwd = ''
  for (let i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

// 深度合并
export function deepMerge<T = any>(src: any = {}, target: any = {}): T {
  let key: string
  for (key in target) {
    src[key] = isObject(src[key]) ? deepMerge(src[key], target[key]) : (src[key] = target[key])
  }
  return src
}

/** base图片转file */
export function base64ToFile(base64, fileName) {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], `${fileName}.${mime.split('/')[1]}`, { type: mime })
}

export default {}

/**
 * @description: base64 to blob
 */
export function base64toBlob(base64Buf: string): Blob {
  const arr = base64Buf.split(',')
  const typeItem = arr[0]
  const mime = typeItem.match(/:(.*?);/)![1]
  const bstr = window.atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}
