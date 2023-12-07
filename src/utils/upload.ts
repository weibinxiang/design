import axios from 'axios'
import dayjs from 'dayjs'
import { HuaweiType, getYcOBSUploadInfo, FileType, SaveFileUrlParams, saveYcFileUrlBatch } from '@/api/upload'
import { randomString } from './utils'
import ObsClient from 'esdk-obs-browserjs'
import CryptoJS from 'crypto-js'
import { useThrottleFn } from '@vueuse/core'
import { cloneDeep } from 'lodash-es'

const bufferChunkSize = 5 * 1024 * 1024 // 计算哈希值时切割大小 5MB
let saveFileQueue: (SaveFileUrlParams & { resolve; reject })[] = []

// 取文件后缀
function getSuffix(filename: string) {
  const pos = filename.lastIndexOf('.')
  let suffix = ''
  if (pos != -1) {
    suffix = filename.substring(pos)
  }
  return suffix || '.png'
}

/** 文件计算哈希值 */
function calculateSHA256(file: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    let count = 0
    const hash = CryptoJS.algo.SHA256.create()
    const reader = new FileReader()

    // 以流的方式读取文件
    function readChunk(start: number, end: number) {
      const slice = file.slice(start, end)
      reader.readAsArrayBuffer(slice)
    }

    // 递归读取文件的每个分块
    function processChunk(offset: number) {
      const start = offset
      const end = Math.min(start + bufferChunkSize, file.size)
      count = end

      readChunk(start, end)
    }

    // 当读取完整个文件后，计算哈希值并返回
    reader.onloadend = (e) => {
      const arrayBuffer = e.target!.result
      // @ts-ignore
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer)

      // 更新哈希对象
      hash.update(wordArray)
      // hash.update('' + Math.random());

      if (count < file.size) {
        // 继续处理下一个分块
        processChunk(count)
      } else {
        // 计算哈希值并返回
        const sha256Hash = hash.finalize()
        resolve(sha256Hash.toString())
      }
    }

    // 开始处理文件内容分块
    processChunk(0)
  })
}

/**
 * @description 节流调用批量保存文件接口（防止多文件上传时接口出现频繁调用的报错）
 */
const saveFileUrlThrottleFn = useThrottleFn(() => {
  // 深拷贝待保存队列 拷贝后清空队列并保存
  const query = cloneDeep(saveFileQueue)
  saveFileQueue = []

  // 保存成功或失败后执行每个队列的Promise回调，继续执行后续上传流程
  saveYcFileUrlBatch({ query: query.map(({ type, hash, url }) => ({ type, hash, url })) })
    .then((res) => {
      query.forEach(({ resolve }) => resolve(res))
    })
    .catch(() => {
      query.forEach(({ reject }) => reject(false))
    })
}, 1000)

/**
 * @description 华为云上传
 */
export default async function upload(
  file: File | Blob,
  options: {
    type: HuaweiType
    number: FileType
    onProgress?: (percent: number) => void
  },
): Promise<string> {
  try {
    // 计算文件哈希值
    const hash = await calculateSHA256(file)

    // 获取上传参数
    const res = await getYcOBSUploadInfo({ hash, type: options.type, number: options.number || 1 })
    const { bucket, cdn_point, end_point, credential, upload_path, yc_file_info } = res.data

    // 已有哈希值的文件直接返回路径
    if (yc_file_info && yc_file_info.url) {
      return Promise.resolve(yc_file_info.url)
    } else {
      const obsClient = new ObsClient({
        access_key_id: credential.access,
        secret_access_key: credential.secret,
        server: end_point,
        signature: 'obs',
        security_token: credential.securitytoken,
      })

      // 设置表单参数
      const formParams = {
        // 设置对象访问权限为公共读
        'x-obs-acl': obsClient.enums.AclPublicRead,
      }

      // 生成文件名
      const key = `${upload_path}/${dayjs().format('YYYYMMDDHHmmss')}_${randomString(16)}${getSuffix((file as File)?.name).toLocaleLowerCase()}`

      const postSign = obsClient.createPostSignatureSync({
        Bucket: bucket,
        Key: key,
        Expires: 3600, // 设置表单上传请求有效期，单位：秒
        FormParams: formParams,
      })

      const formData = new FormData()
      formData.append('Key', key)
      formData.append('x-obs-acl', obsClient.enums.AclPublicRead)
      formData.append('policy', postSign.Policy)
      formData.append('AccessKeyId', credential.access)
      formData.append('signature', postSign.Signature)
      formData.append('x-obs-security-token', credential.securitytoken)
      formData.append('file', file)

      return axios({
        url: end_point,
        data: formData,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data;charset=UTF-8;',
        },
        onUploadProgress: function (e) {
          options?.onProgress?.(Math.round((e.loaded / e.total) * 100 || 0))
        },
      })
        .then(async (res) => {
          if (res.status >= 200 && res.status < 300) {
            const url = (cdn_point || end_point) + '/' + key

            // 保存已上传的文件哈希值
            const saveRes = await new Promise((resolve, reject) => {
              saveFileQueue.push({
                type: options.type,
                hash,
                url,
                resolve,
                reject,
              })
              saveFileUrlThrottleFn()
            })
            return saveRes ? Promise.resolve(url) : Promise.reject('图片上传错误')
          } else {
            return Promise.reject('图片上传错误')
          }
        })
        .catch((err) => {
          const data = err?.response?.data
          if (typeof data === 'string') {
            const dom = document.createElement('div')
            dom.innerHTML = data
            return Promise.reject((dom.querySelector('message') as HTMLElement)?.innerText)
          }
          return Promise.reject('图片上传错误！')
        })
    }
  } catch {
    return Promise.reject('图片上传错误！')
  }
}

// function arrayBufferToWordArray(arrayBuffer: ArrayBuffer) {
//   const i8a = new Uint8Array(arrayBuffer);
//   const a = [] as number[];
//   for (let i = 0; i < i8a.length; i += 4) {
//     a.push((i8a[i] << 24) | (i8a[i + 1] << 16) | (i8a[i + 2] << 8) | i8a[i + 3]);
//   }
//   return CryptoJS.lib.WordArray.create(a, i8a.length);
// }
