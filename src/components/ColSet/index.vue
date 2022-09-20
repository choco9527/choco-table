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
          <header class="pb-2">
            <vxe-checkbox v-model="openMetrics" class="lh-18" :indeterminate="metriIndeter" size="small" @change="allCols(0)">维度</vxe-checkbox>
          </header>
          <section>
            <el-row>
              <el-col v-for="item in tempCols.filter(col => col.column_type === 0)" :key="item.key" :span="span" class="flex h-26 lh-26">
                <span class="_w-95 over-hide lh-16">
                  <vxe-checkbox v-model="item.open" size="small" @change="singleChange(0)">
                    <span class=" fw-normal lh-18">{{ item.label }}</span>
                  </vxe-checkbox>
                </span>
              </el-col>
            </el-row>
          </section>
        </div>
        <div v-if="dimensionsCol.length" class="content-item">
          <header class="pb-2">
            <vxe-checkbox v-model="openDimensions" class="lh-18" :indeterminate="dimenIndeter" size="small" @change="allCols(1)">指标</vxe-checkbox>
          </header>
          <section>
            <el-row>
              <el-col v-for="item in tempCols.filter(col => col.column_type === 1)" :key="item.key" class="flex h-26 lh-26" :span="span">
                <span class="_w-95 over-hide lh-16">
                  <vxe-checkbox v-model="item.open" size="small" @change="singleChange(1)">
                    <span class=" fw-normal lh-18">{{ item.label }}</span>
                  </vxe-checkbox>
                </span>
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
      <draggable v-model="tempCols" class="column-edit pt-12 pb-12">
        <transition-group>
          <div
            v-for="item in tempCols"
            :key="item.key"
            :class="['drag-item lh-22', {open: item.open}]"
          >
            <i
              v-if="showFixed"
              :class="[`svg-wrap fs-14 icons fixed-icon mr-6 fixed-${item.fixed}`]"
              :title="`点击${item.fixed&&(item.fixed==='left'?'右':'取消')}固定`"
              @click="handleFixCol(item)"
            >
              <svg-icon icon-class="fixed" />
            </i>
            <i class="drag-icon mr-6" />
            <span class="label over-hide" :title="`${item.column_type === 0 ? '(维度)' : '(指标)'}-${item.label}`">{{ item.label }}</span>
            <svg-icon icon-class="close" class="close-icon icons" @click="item.open = false" />
          </div>
        </transition-group>
      </draggable>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from '@/utils/tools'
import draggable from 'vuedraggable'

export default {
  name: 'ColSet',
  components: { draggable },
  props: {
    size: { type: String, default: 'mini' },
    span: { type: Number, default: 12 },
    showFixed: { type: Boolean, default: false }, // 是否可进行固定操作
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
    handleFixCol(col) { // 固定列
      col.fixed = !col.fixed ? 'left' : col.fixed === 'left' ? 'right' : ''
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
    padding: 3px 16px 3px 8px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    &:not(.open){
      display: none;
    }
    .label{
      flex: 1;
    }
    .icons{
      color: $color-white-4;
    }

    .close-icon{
      &:hover{
        color: $color-danger;
      }
    }
    .fixed-icon{
      opacity: 0;
      transition: .1s all var(--color-transition-base);
      &.fixed-left,&.fixed-right{
        opacity: 1;
      }
      &.fixed-left{
        color: $color-primary;
      }
      &.fixed-right{
        color: $color-success;
      }
    }

    &:hover{
      background-color: $bg-white-1;
      .fixed-icon{
        opacity: 1;
      }
      >span,.drag-icon{
        color: $color-primary;
        &::before{
          background: $lighter-blue;
        }
        &::after{
          background: $lighter-blue;
        }
      }
    }
  }
}
</style>
