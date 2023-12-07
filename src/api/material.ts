/*
 * @Author: ShawnPhang
 * @Date: 2021-08-27 14:42:15
 * @Description: 媒体相关接口
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-10-13 00:25:25
 */
import fetch from '@/utils/axios'

// 获取素材分类：
export const getKinds = (params: Type.Object = {}) => fetch('/design/getDesignCateList', params)

// 获取素材列表：
export const getList = (params: Type.Object = {}) => fetch('/design/getDesignMaterialList', params)

// 获取字体
export const getFonts = (params: Type.Object = {}) => fetch('/design/getDesignFontsList', params)
export const getFontSub = (params: Type.Object = {}, extra: any = {}) => fetch('design/font_sub', params, 'get', {}, extra)

// 图库列表
export const getImagesList = (params: Type.Object = {}) => fetch('/design/getDesignImgsList', params, 'get')

// 我的上传列表
export const getMyPhoto = (params: Type.Object = {}) => fetch('design/user/image', params)
export const deleteMyPhoto = (data: Type.Object = {}) => fetch('design/user/image/del', data, 'post')

// 添加图片
export const addMyPhoto = (params: Type.Object = {}) => fetch('design/user/add_image', params)
