import fetch from '@/utils/axios'

export enum Api {
  GetCosRegion = '/agent/getCosRegion',
  GetCosToken = '/agent/getTencentStsKey',
  GetHuaweiSecuritytokens = '/agent/getHuaweiSecuritytokens',
  GetVideoCover = '/dy/getVideoFirstFrame',
}
/** 上传的文件类型 */
export enum HuaweiType {
  /** 其他 */
  other,
  /** 课表媒体 */
  lessonMedia,
  /** 课表封面 */
  lessonCover,
  /** 课程封面 */
  curriculumCover,
  /** 课表学习资料 */
  lessonStudy,
  /** 课程长图 */
  lessonLong,
  /** 讲师头像 */
  authorAvatar,
}

/** 上传的文件媒体类型 */
export enum FileType {
  /** 图片 */
  image = 1,
  /** 媒体 */
  media,
}

export enum OssType {
  media = 1,
  image,
}

export interface HuaweiTokenModel {
  /** 桶 */
  bucket: string
  credential: {
    /** ak */
    access: string
    /** 超时时间 */
    expires_at: string
    /** sk  */
    secret: string
    /** token */
    securitytoken: string
  }
  /** cdn桶域名  */
  cdn_point: string
  /** 桶域名  */
  end_point: string
  /** 桶域名  */
  upload_path: string
  /** 如果已经上传过反正的路径信息 */
  yc_file_info: {
    url: string
    yc_file_id: number
  }
}

export interface SaveFileUrlParams {
  url: string
  type: HuaweiType
  hash: string
}

export enum ObsType {
  /** 华为云 */
  huawei = 'huawei',
  /** 阿里云 */
  ali = 'ali',
}

// 获取课堂OBS上传信息
export const getYcOBSUploadInfo = (
  params: {
    path?: string
    type?: HuaweiType
    hash?: string
    number: 1 | 2
  } = { path: '', hash: '', number: 1 },
) => fetch('/curriculum/getYcOBSUploadInfo', params, 'get')

// 保存课堂文件
export const saveYcFileUrl = (data: { url?: string; type: HuaweiType; hash?: string }) => fetch('/curriculum/saveYcFileUrl', data, 'post')

/** 批量保存课堂文件 */
export const saveYcFileUrlBatch = (data: SaveFileUrlParams) => fetch('https://app-api-pre.yizhiweixin.com/curriculum/saveYcFileUrlBatch', data, 'post')
