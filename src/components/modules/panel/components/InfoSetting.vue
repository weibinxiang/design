<template>
  <div class="info-setting">
    <div class="label">模板标题</div>
    <el-input v-model="store.state.design.basicInfo.title" placeholder="请输入模板标题" maxlength="20" show-word-limit />

    <div class="label">模板分类</div>
    <el-select v-model="store.state.design.basicInfo.category" placeholder="请选择模板分类" style="width: 100%">
      <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" :disabled="item.disabled" />
    </el-select>
  </div>
</template>

<script lang="ts" setup>
import api from '@/api'
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { ElSelect, ElOption } from 'element-plus'

const store = useStore()

const options = computed(() => {
  return store.state.design.materialCates.map((item) => ({ value: item.id, label: item.name }))
})

if (!store.state.design.materialCates.length) {
  api.home.getCategories({ type: 1 }).then((res: any) => {
    store.commit('setMaterialCates', res.data)
  })
}
</script>

<style lang="less" scoped>
.info-setting {
  padding: 0 20px;
  .label {
    font-size: 14px;
    color: #666;
    margin: 14px 0 10px;
  }
}
</style>
