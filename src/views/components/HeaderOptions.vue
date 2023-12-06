<!--
 * @Author: ShawnPhang
 * @Date: 2022-01-12 11:26:53
 * @Description: 顶部操作按钮组
 * @LastEditors: ShawnPhang <https://m.palxp.cn>
 * @LastEditTime: 2023-10-16 09:23:06
-->
<template>
  <div class="top-title">
    <!-- <el-input v-model="title" disabled placeholder="未命名的设计" class="input-wrap" /> -->
  </div>
  <div class="top-icon-wrap">
    <!-- <template v-if="tempEditing">
      <span style="color: #999; font-size: 14px; margin-right: 0.5rem">{{ stateBollean ? '启用' : '停用' }}</span> <el-switch v-model="stateBollean" @change="stateChange" />
      <div class="divide__line">|</div>
      <el-button plain type="primary" @click="saveTemp">保存模板</el-button>
      <el-button @click="$store.commit('managerEdit', false)">取消</el-button>
      <div class="divide__line">|</div>
    </template> -->
    <el-button size="large" class="primary-btn" @click="back">返回</el-button>
    <el-button :loading="loading" size="large" class="primary-btn" :disabled="tempEditing" @click="createImage(true)">下载图片</el-button>
    <el-button size="large" class="primary-btn" :disabled="tempEditing" plain type="primary" @click="createImage(false)">保存</el-button>
    <el-button v-if="$route.query.tempid && store.state.superToken" size="large" plain type="primary" @click="saveTemp">保存模板</el-button>
  </div>
  <!-- 生成图片组件 -->
  <SaveImage ref="canvasImage" />
</template>

<script lang="ts">
import api from '@/api'
import { defineComponent, reactive, toRefs, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { mapGetters, mapActions, useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import useNotification from '@/common/methods/notification'
import SaveImage from '@/components/business/save-download/CreateCover.vue'
import { useFontStore } from '@/common/methods/fonts'
// import _config from '@/config'
// import wGroup from '@/components/modules/widgets/wGroup/wGroup.vue'
import useConfirm from '@/common/methods/confirm'
import _config from '@/config'
import uploadImage from '@/utils/upload'
import { HuaweiType, FileType } from '@/api/upload'
import { randomString } from '@/utils/utils'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import axios from 'axios'

const fetch = axios.create()

export default defineComponent({
  components: { SaveImage },
  props: ['modelValue'],
  emits: ['change', 'update:modelValue'],
  setup(props, context) {
    const { proxy }: any = getCurrentInstance() as ComponentInternalInstance
    const route = useRoute()
    const router = useRouter()
    const store = useStore()
    const state = reactive({
      stateBollean: false,
      title: '',
      loading: false,
      cover: '',
    })

    async function back() {
      const isPass = await useConfirm('提示', '确认离开编辑页吗？系统不会自动保存您做的更改', 'warning')
      if (isPass) {
        window.parent?.postMessage(
          {
            type: 'back',
          },
          '*',
        )
      }
    }

    // 保存作品
    async function save() {
      // Bugs: 历史操作有问题，且page操作未及时入栈 proxy?.dPageHistory
      if (proxy?.dHistory.length <= 0) {
        return
      }
      store.commit('setShowMoveable', false) // 清理掉上一次的选择框
      // console.log(proxy?.dPage, proxy?.dWidgets)
      const { id, tempid } = route.query
      state.cover = await proxy?.draw()
      const widgets = proxy.dWidgets // reviseData()
      const {
        data: { id: newId },
        code,
        msg,
      } = await api.home[id ? 'editMyTemp' : 'saveMyTemp']({ cover: state.cover, id, category: store.state.design.basicInfo.category, title: store.state.design.basicInfo.title || '未命名设计', data: JSON.stringify({ page: proxy.dPage, widgets }), template_id: tempid, width: proxy.dPage.width, height: proxy.dPage.height })
      code !== 200 && useNotification('保存失败', msg, { type: 'error' })
      !id && router.push({ path: '/home', query: { id: newId }, replace: true })

      store.commit('setShowMoveable', true)
    }
    // 保存模板
    async function saveTemp() {
      const { tempid, tempType: type } = route.query
      let res = null
      if (type == 1) {
        // 保存组件，组合元素要保证在最后一位，才能默认选中
        if (proxy.dWidgets[0].type === 'w-group') {
          const group = proxy.dWidgets.shift()
          group.record.width = 0
          group.record.height = 0
          proxy.dWidgets.push(group)
        }
        // TODO：如果保存组件不存在组合，则添加组合。该功能待优化
        if (!proxy.dWidgets.some((x: any) => x.type === 'w-group')) {
          alert('提交组件必须为组合！')
          return
          // proxy.dWidgets.push(wGroup.setting)
        }
        res = await api.home.saveTemp({ id: tempid, type, title: proxy.title || '未命名组件', data: JSON.stringify(proxy.dWidgets), width: proxy.dPage.width, height: proxy.dPage.height })
      } else {
        res = await api.home.saveTemp({ id: tempid, title: proxy.title || '未命名模板', data: JSON.stringify({ page: proxy.dPage, widgets: proxy.dWidgets }), width: proxy.dPage.width, height: proxy.dPage.height })
      }
      res.stat != 0 && useNotification('保存成功', '模板内容已变更')
    }
    // 停用启用
    async function stateChange(e: any) {
      const { tempid, tempType: type } = route.query
      const { stat } = await api.home.saveTemp({ id: tempid, type, state: e ? 1 : 0 })
      stat != 0 && useNotification('保存成功', '模板内容已变更')
    }
    async function createImage(isDownload: boolean) {
      if (route.query.tempId) {
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
      }
      if (state.loading === true) {
        return
      }
      state.loading = true
      context.emit('update:modelValue', true)
      context.emit('change', { downloadPercent: 1, downloadText: '正在处理封面' })
      await save()
      setTimeout(async () => {
        const { id } = route.query
        if (id) {
          const { width, height } = proxy.dPage
          context.emit('update:modelValue', true)
          context.emit('change', { downloadPercent: 1, downloadText: '准备合成图片' })
          state.loading = false
          let timerCount = 0
          const animation = setInterval(() => {
            if (props.modelValue && timerCount < 75) {
              timerCount += RandomNumber(1, 10)
              context.emit('change', { downloadPercent: 1 + timerCount, downloadText: '正在合成图片' })
            } else {
              clearInterval(animation)
            }
          }, 800)
          // 获取bolb文件，用于上传
          const res = await fetch.get(`${_config.SCREEN_URL}/api/screenshots`, {
            responseType: 'blob',
            headers: {
              token: store.state.encryptionToken,
            },
            onDownloadProgress(event) {
              clearInterval(animation)
              const progress = (event.loaded / event.total) * 100
              progress >= timerCount && context.emit('change', { downloadPercent: Number(progress.toFixed(0)), downloadText: '图片生成中' })
            },
            params: {
              id,
              width,
              height,
              r: Math.random(),
            },
          })
          // 上传至华为云, 用于保存时回显到讲师端表单
          const file = new File([res.data], `${dayjs().format('YYYYMMDDHHmmss')}_${randomString(16)}.${res.data.type.split('/')[1]}`)
          const url = await uploadImage(file, {
            type: HuaweiType.curriculumCover,
            number: FileType.image,
          })
          if (isDownload) {
            window.location.href = url
            context.emit('change', { downloadPercent: 100, downloadText: '图片下载中' })
          } else {
            context.emit('change', { downloadPercent: 100, downloadText: '保存成功' })
            window.parent?.postMessage(
              {
                type: 'save',
                url: url,
              },
              '*',
            )
          }
        }
      }, 100)
    }
    function RandomNumber(min: number, max: number) {
      return Math.ceil(Math.random() * (max - min)) + min
    }
    return {
      ...toRefs(state),
      createImage,
      save,
      saveTemp,
      back,
      stateChange,
      store,
    }
  },
  computed: {
    ...mapGetters(['dPage', 'dWidgets', 'tempEditing', 'dHistory', 'dPageHistory']),
  },
  methods: {
    ...mapActions(['pushHistory', 'addGroup']),
    async load(id: any, tempId: any, type: any, cb: Function) {
      if (this.$route.name !== 'Draw') {
        await useFontStore.init() // 初始化加载字体
      }
      const apiName = tempId && !id ? 'getTempDetail' : 'getMyDesignDetail'
      if (!id && !tempId) {
        cb()
        return
      }
      const {
        data: { data: content, title, state, width, height, category, cover },
      } = await api.home[apiName]({ id: id || tempId, type })
      if (content) {
        const data = JSON.parse(content)
        this.stateBollean = !!state
        this.title = title
        this.cover = cover
        this.$store.commit('setShowMoveable', false) // 清理掉上一次的选择框
        // this.$store.commit('setDWidgets', [])
        if (type == 1) {
          // 加载文字组合组件
          this.dPage.width = width
          this.dPage.height = height
          this.addGroup(data)
        } else {
          this.$store.commit('setDPage', data.page)
          id ? this.$store.commit('setDWidgets', data.widgets) : this.$store.dispatch('setTemplate', data.widgets)
          this.$store.commit('setBasicInfo', {
            title,
            category,
          })
        }
        cb()
        this.pushHistory('请求加载load')
      }
    },
    draw() {
      return new Promise((resolve) => {
        this.$refs.canvasImage.createCover((url) => {
          resolve(url)
        })
      })
    },
  },
})
</script>

<style lang="less" scoped>
.top-icon-wrap {
  display: flex;
  align-items: center;
  padding-right: 20px;
  height: 54px;
  .top-icon {
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 5px;
    color: #ffffff;
    cursor: pointer;
    font-weight: bold;
    margin: 8px;
    padding: 5px 8px;
    &:hover {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
}
.top-title {
  color: @color-black;
  flex: 1;
  padding-left: 88px;
  // font-weight: bold;
  .input-wrap {
    width: 15rem;
    :deep(input) {
      border-color: #ffffff;
      // border-color: #e8eaec;
    }
  }
  .input-wrap:hover {
    :deep(input) {
      border-color: #e8eaec;
    }
  }
}
.primary-btn {
  font-weight: 600;
  transform: scale(0.95);
  margin-left: 10px;
}

.divide__line {
  margin: 0 1rem;
  color: #e8eaec;
  height: 20px;
}
</style>
