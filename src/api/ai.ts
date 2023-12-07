/*
 * @Author: ShawnPhang
 * @Date: 2021-08-27 14:42:15
 * @Description: AI相关接口
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-10-13 00:07:19
 */
import axios from 'axios'

// 上传接口
export const upload = (file: File, cb: Function) => {
  const formData = new FormData()
  formData.append('file', file)

  return axios({
    url: 'http://192.168.5.173:5000/api/remove',
    method: 'POST',
    data: formData,
    responseType: 'blob',
    onUploadProgress: (progress: any) => {
      cb(Math.floor((progress.loaded / progress.total) * 100), 0)
    },
    onDownloadProgress: (progress: any) => {
      cb(100, Math.floor((progress.loaded / progress.total) * 100))
    },
  })
}
