<template>
  <div class="render-form">
    <el-form ref="form" label-width="auto" label-position="left" :model="outputFormData" v-bind="$attrs">
      <el-row :gutter="40" class="form-row">
        <el-col
          v-for="item in items.filter(v => !v.fullRow)"
          :key="item.prop"
          :sm="24"
          :lg="dialogSize === 'max' ? 12 : 24"
          :xl="dialogSize === 'max' ? 8 : 24"
        >
          <re-item v-bind="$attrs" :item="item" />
        </el-col>
        <el-col v-for="item in items.filter(v => v.fullRow)" :key="item.prop" :span="24">
          <re-item v-bind="$attrs" :item="item" />
        </el-col>
      </el-row>
    </el-form>

  </div>
</template>

<script>
import ReItem from './reItem'
export default {
  name: 'SingleForm',
  components: { ReItem },
  props: {
    outputFormData: {
      type: Object,
      default() {
        return {}
      }
    },
    items: {
      type: Array,
      default() {
        return []
      }
    },
    dialogSize: { type: String, default: '' } // 编辑窗口大小
  }
}
</script>

<style scoped lang="scss">

.render-form{
  padding: 0 80px;
  .form-row{
    flex-wrap: wrap;
    display: flex;
    justify-content: flex-start;
    align-content: start;
    align-items: start;
  }
}

</style>
