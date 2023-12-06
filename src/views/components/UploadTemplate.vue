<!--
 * @Author: ShawnPhang
 * @Date: 2022-07-12 11:26:53
 * @Description: 上传用户模板
 * @LastEditors: ShawnPhang <site: book.palxp.com>
 * @LastEditTime: 2023-07-14 09:17:56
-->
<template>
  <el-button v-show="isDone" type="primary" plain @click="prepare"><b>上传模板</b></el-button>
  <!-- 生成图片组件 -->
  <SaveImage ref="canvasImage" />
</template>

<script lang="ts">
import api from '@/api'
import { defineComponent, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { mapGetters, useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import useNotification from '@/common/methods/notification'
import SaveImage from '@/components/business/save-download/CreateCover.vue'
import { useFontStore } from '@/common/methods/fonts'
import _config from '@/config'
import github from '@/api/github'
import uploadImage from '@/utils/upload'
import { HuaweiType, FileType } from '@/api/upload'
import { base64ToFile, randomString } from '@/utils/utils'
import dayjs from 'dayjs'
import { ElMessage } from 'element-plus'

export default defineComponent({
  components: { SaveImage },
  props: ['modelValue', 'isDone'],
  emits: ['change', 'update:modelValue'],
  setup(props, context) {
    const { proxy }: any = getCurrentInstance() as ComponentInternalInstance
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const state: any = reactive({
      stateBollean: false,
      title: '',
      loading: false,
      canvasImage: null,
    })

    useFontStore.init() // 初始化加载字体

    // 生成封面
    const draw = () => {
      return new Promise((resolve) => {
        state.canvasImage.createCover((url) => {
          resolve(url)
        })
      })
    }

    let addition = 0 // 累加大小
    let lenCount = 0 // 全部大小
    let lens = 0 // 任务数
    const queue: any[] = [] // 队列
    let widgets: any = []
    let page: any = {}

    async function prepare() {
      if (!store.state.design.basicInfo.title) {
        ElMessage.warning('请先在模板信息中填写模板标题')
        store.commit('setTabActive', 2)
        return
      }
      if (!store.state.design.basicInfo.category) {
        ElMessage.warning('请先在模板信息中选择模板分类')
        store.commit('setTabActive', 2)
        return
      }

      store.commit('setShowMoveable', false) // 清理掉上一次的选择框
      addition = 0
      lenCount = 0
      widgets = proxy.dWidgets
      page = proxy.dPage

      if (page.backgroundImage) {
        context.emit('change', { downloadPercent: 1, downloadText: '正在准备上传', downloadMsg: '请等待..' })
        const file = base64ToFile(page.backgroundImage, `${dayjs().format('YYYYMMDDHHmmss')}_${randomString(16)}`)
        page.backgroundImage = await uploadImage(file, { type: HuaweiType.other, number: FileType.image })
      }

      for (const item of widgets) {
        if (item.type === 'w-image') {
          lenCount += item.imgUrl.length
          queue.push(item)
        }
      }
      lens = queue.length
      uploadImgs()
    }

    async function uploadImgs() {
      try {
        if (queue.length > 0) {
          const item = queue.pop()
          const file = base64ToFile(item.imgUrl, `${dayjs().format('YYYYMMDDHHmmss')}_${randomString(16)}`)
          const url = await uploadImage(file, { type: HuaweiType.other, number: FileType.image })
          addition += item.imgUrl.length
          let downloadPercent: any = (addition / lenCount) * 100
          if (!url) {
            context.emit('change', { downloadPercent: downloadPercent, downloadText: '上传资源中失败', downloadMsg: '' })
            setTimeout(() => {
              context.emit('change', { downloadPercent: 0, downloadText: '上传资源失败', downloadMsg: '' })
            }, 2000)
            return
          }
          downloadPercent >= 100 && (downloadPercent = null)
          context.emit('change', { downloadPercent, downloadText: '上传资源中', downloadMsg: `已完成：${lens - queue.length} / ${lens}` })
          item.imgUrl = url
          uploadImgs()
        } else {
          uploadTemplate()
        }
      } catch {}
    }

    const uploadTemplate = async () => {
      context.emit('change', { downloadPercent: 95, downloadText: '正在处理封面', downloadMsg: '即将结束...' })
      const cover = await draw()
      const { code, data, msg } = await api.home.saveWorks({ category: store.state.design.basicInfo.category, cover, title: store.state.design.basicInfo.title, data: JSON.stringify({ page, widgets }), width: page.width, height: page.height }).catch((res) => res)
      if (code === 200) {
        // useNotification('保存成功', '可在"我的模板"中查看')
        router.push({ path: '/psd', query: { tempid: data?.id }, replace: true })
        context.emit('change', { downloadPercent: 99.99, downloadText: '上传完成', cancelText: '查看已上传模板' }) // 关闭弹窗
      } else {
        useNotification('保存失败', msg, { type: 'error' })

        context.emit('change', { downloadPercent: 99.99, downloadText: '保存失败', downloadMsg: msg }) // 关闭弹窗
        setTimeout(() => {
          context.emit('change', { downloadPercent: 0, downloadText: '保存失败', downloadMsg: '' }) // 关闭弹窗
        }, 2000)
      }
    }

    return {
      ...toRefs(state),
      prepare,
    }
  },
  computed: {
    ...mapGetters(['dPage', 'dWidgets']),
  },
})
</script>

<!-- <style lang="less" scoped></style> -->
