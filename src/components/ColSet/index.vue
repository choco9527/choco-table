<template>
  <div class="col-content-wrap">
    <div class="left">
      <div class="title">
        <slot name="title">
          <span>设置</span>
        </slot>
      </div>
      <div class="inner-content">
        <div v-if="metricsCol.length" class="content-item">
          <header>
            <vxe-checkbox v-model="openMetrics" :indeterminate="metriIndeter" size="medium" @change="allCols(0)">维度</vxe-checkbox>
          </header>
          <section>
            <el-row>
              <el-col v-for="item in tempCols.filter(col => col.column_type === 0)" :key="item.key" :span="span">
                <vxe-checkbox v-model="item.open" size="medium" @change="singleChange(0)">{{ item.label }}</vxe-checkbox>
              </el-col>
            </el-row>
          </section>
        </div>
        <div v-if="dimensionsCol.length" class="content-item">
          <header>
            <vxe-checkbox v-model="openDimensions" :indeterminate="dimenIndeter" size="medium" @change="allCols(1)">指标</vxe-checkbox>
          </header>
          <section>
            <el-row>
              <el-col v-for="item in tempCols.filter(col => col.column_type === 1)" :key="item.key" :span="span">
                <vxe-checkbox v-model="item.open" size="medium" @change="singleChange(1)">{{ item.label }}</vxe-checkbox>
              </el-col>
            </el-row>
          </section>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="title flex between">
        <span>已选</span>
        <el-button type="text" class="pr-0" :size="size" @click="tempCols.forEach(item => item.open = false)">清空</el-button>
      </div>
      <draggable v-model="tempCols" class="column-edit">
        <transition-group>
          <div
            v-for="item in tempCols"
            :key="item.key"
            :class="['drag-item', {open: item.open}]"
            :title="`${item.column_type === 0 ? '(维度)' : '(指标)'}-${item.label}`"
          >
            <i class="drag-icon" />
            <span class="label">{{ item.label }}</span>
            <svg-icon icon-class="close" class="close-icon" @click="item.open = false" />
          </div>
        </transition-group>
      </draggable>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from '@/utils/tool'
import draggable from 'vuedraggable'

export default {
  name: 'ColSet',
  components: { draggable },
  props: {
    size: { type: String, default: 'mini' },
    span: { type: Number, default: 12 },
    columns: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      openMetrics: true, // 全选维度
      openDimensions: true, // 全选指标
      metriIndeter: false, // 部分选择维度
      dimenIndeter: false, // 部分选择指标
      tempCols: [] // 缓存的data columns
    }
  },
  computed: {
    metricsCol() {
      return this.tempCols.filter(col => col.column_type === 0)
    },
    dimensionsCol() {
      return this.tempCols.filter(col => col.column_type === 1)
    }
  },
  methods: {
    $init() {
      this.tempCols = cloneDeep(this.columns)
    },
    $getData() {
      return cloneDeep(this.tempCols)
    },
    allCols(colType = 0) { // 开启or关闭维度指标
      this.metriIndeter = false
      this.dimenIndeter = false

      this.tempCols.forEach(col => {
        if (col.column_type === colType) {
          col.open = colType === 0 ? this.openMetrics : this.openDimensions
        }
      })
    },
    singleChange(colType = 0) {
      const colNames = ['metricsCol', 'dimensionsCol']
      const openNames = ['openMetrics', 'openDimensions']
      const indeterNames = ['metriIndeter', 'dimenIndeter']

      const colName = colNames[colType]
      const openName = openNames[colType]
      const indeterName = indeterNames[colType]

      if (this[colName].every(v => v.open)) {
        this[openName] = true
        this[indeterName] = false
      } else if (this[colName].every(v => !v.open)) {
        this[openName] = false
        this[indeterName] = false
      } else {
        this[openName] = false
        this[indeterName] = true
      }
    }
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.col-content-wrap{
  overflow: hidden;
  .left,.right{
    border-radius: 4px;
    border: 1px solid $border-white-2;
    .title{
      width: 100%;
      height: 38px;
      line-height: 34px;
      border-bottom: 1px solid $border-white-2;
      background: $bg-white-2;
      padding: 0 16px;
    }
  }
  .left{
    width: calc(100% - 244px);
    float: left;
    .inner-content{
      padding: 8px 16px;
      max-height: 400px;
      overflow-y: auto;

      .content-item{
        line-height: 28px;
        >header{
          width: 100%;
          border-bottom: $border-white-1 1px solid;
        }
        >section{
          padding: 4px 20px;
        }
      }
    }
  }
  .right{
    width: 230px;
    float: right;
    &.max-width{
      width: 100%;
    }
  }
}
.column-edit {
  padding: 16px 0;
  overflow-x: auto;
  max-height: 400px;

  > span {
    display: flex;
    flex-direction: column;
    justify-content: start;
    height: auto;
  }

  .drag-item {
    cursor: pointer;
    transition: .1s all var(--ease-in-out);
    box-sizing: content-box;
    user-select: none;
    padding: 3px 16px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    line-height: 22px;
    &:not(.open){
      display: none;
    }
    .label{
      flex: 1;
    }
    .drag-icon{
      margin-right: 8px;
    }
    .close-icon{
      color: $color-white-4;
      &:hover{
        color: $color-danger;
      }
    }

    &:hover{
      background-color: $bg-white-1;

      >span{
        color: $color-primary;
      }
    }
  }
}
</style>
