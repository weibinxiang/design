/*
 * @Author: ShawnPhang
 * @Date: 2021-08-19 18:43:22
 * @Description:
 * @LastEditors: ShawnPhang <site: book.palxp.com>
 * @LastEditTime: 2023-07-24 13:01:10
 */
import fetch from '@/utils/axios'
import _config from '@/config'
import store from '@/store'

// const screenshot_url = window.location.protocol + '//' + window.location.host + '/draw'
export const download = (params: Type.Object = {}) => `${_config.SCREEN_URL}/api/screenshots?id=${params.id}&tempid=${params.tempid}&width=${params.width}&height=${params.height}&t=${store.state.encryptionToken}`

// 获取模板列表
export const getTempList = (params: Type.Object = {}) => fetch('/design/getDesignTemplateModuleList', params, 'get')
export const getTempDetail = (params: Type.Object = {}) => fetch('/design/getDesignTemplateModuleDetail', params, 'get')
export const getCategories = (params: Type.Object = {}) => fetch('/design/getDesignCateList', params, 'get')
// 保存模板
export const saveTemp = (params: Type.Object = {}) => fetch('/design/editDesignTemplateModule', params, 'post')
export const delTemp = (params: Type.Object = {}) => fetch('/design/deleteDesignTemplateModule', params, 'post')

// 组件相关接口
export const getCompList = (params: Type.Object = {}) => fetch('/design/getDesignTemplateModuleList', params, 'get')
export const removeComp = (params: Type.Object = {}) => fetch('design/del', params, 'post')
// export const getCompDetail = (params: Type.Object = {}) => fetch('/api/template/temp_info', params, 'get')

// 新建模板
export const saveWorks = (params: Type.Object = {}) => fetch('/design/saveDesignTemplateModule', params, 'post')

// 保存个人模板
export const saveMyTemp = (params: Type.Object = {}) => fetch('/design/saveDesignAgentTemplate', params, 'post')
export const editMyTemp = (params: Type.Object = {}) => fetch('/design/editDesignAgentTemplate', params, 'post')
export const delMyTemp = (params: Type.Object = {}) => fetch('/design/deleteDesignAgentTemplate', params, 'post')
export const getMyDesign = (params: Type.Object = {}) => fetch('/design/getDesignAgentTemplateList', params, 'get')
export const getMyDesignDetail = (params: Type.Object = {}) => fetch('/design/getDesignAgentTemplateDetail', params, 'get')
