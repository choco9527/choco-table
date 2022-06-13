<template>
  <div class="choco-filter" :table-id="tableId">
    <section v-if="showFilter" class="filter-sections">
      <section v-if="queryTags.length" class="selected-area area-structure clearfix">
        <div class="area-left">
          <span>已选标签</span>
        </div>
        <div class="area-right clearfix">
          <div class="tags">
            <el-tag v-for="tag in queryTags" :key="tag.key" disable-transitions class="tag" :closable="tag.clearable" type="info" size="small" @close="closeQueryTag(tag)">{{ tag.label }}: {{ tag.value }}</el-tag>
          </div>
          <div class="batch wrap">
            <el-button class="batch-item btn" @click="clearAllQuery()">
              <svg-icon class="delete mr-4" icon-class="delete" />
              <span>清空</span>
            </el-button>
          </div>
        </div>
      </section>
      <section class="area-structure clearfix">
        <div class="area-left">
          <span>常规筛选</span>
        </div>
        <div class="area-right clearfix">
          <div v-if="searchQuery && searchQuery.length > 0" :class="['search-form', {'max-width': !showSetting}]">
            <span v-if="searchQuery.some(sear => !sear.open)" class="filter-item">
              <el-button :size="elSize" class="btn" @click="toggleExpand">全部筛选<i class="el-icon-arrow-down ml-16" /></el-button>
            </span>

            <span v-for="sear in searchQuery.filter(sear => sear.open)" :key="'filter-item-'+sear.key" class="filter-item">
              <!--        时间日期筛选框-->
              <date-picker v-if="getPickerConfig(sear.view_type).show" :clearable="sear.clearable" :size="elSize" :sear="sear" :get-picker-config="getPickerConfig" :picker-options="pickerOptions" @search="search" />

              <!--      普通匹配筛选框（范围 / 纯数值 / RMB）-->
              <normal-input v-if="(sear.view_type === viewType.NORMAL || sear.view_type === viewType.CURRENCY_RMB)" :clearable="sear.clearable" :size="elSize" :sear="sear" :get-input-type="getInputType" :query-type="queryType" @search="search" />

              <!--      远程搜索/自定义 下拉筛选框-->
              <render-options v-if="sear.view_type === viewType.OPTIONS" :clearable="sear.clearable" :size="elSize" :prop-val="sear.value" :config-id="configId" :sear="sear" @optionChange="search" />
            </span>

            <!--            has searchQuery!-->
            <div class="search-form"><slot name="filterMore" /></div>

            <!--      筛选设置按钮-->
            <span v-if="showSetting" class="filter-item">
              <el-button :size="elSize" @click="toggleFilterSetDialog">设置</el-button>
            </span>

          </div>
          <div v-if="!searchQuery" :class="['search-form','w--100', 'h-40', {'max-width': !showSetting }]">
            <el-skeleton-item v-for="i in 3" :key="'skeleton-'+i" :rows="1" animated :class="['w--25', {'mr-20': i<3}]" />
          </div>

          <!--            no searchQuery!-->
          <div v-if="!searchQuery || searchQuery.length === 0" class="search-form"><slot name="filterMore" /></div>

          <div v-if="searchQuery && searchQuery.length === 0" :class="['search-form', {'max-width': !showSetting}]">
            <span>
              <el-button type="primary" :size="elSize" @click="search">刷新数据</el-button>
            </span>
          </div>

        </div>
      </section>
      <transition name="el-fade-in-linear">
        <i v-show="expand" class="arrow-point" />
      </transition>

      <!--      隐藏筛选<非常规筛选，需要点击后显示>-->
      <div v-if="searchQuery && searchQuery.length > 0" :class="['whole-section-wrap',{expand}]" :style="{'max-height': expand ? expandHeight : 0}">
        <section v-for="sear in searchQuery.filter(sear => !sear.open)" :key="'filter-item-'+sear.key" class="whole-area area-structure clearfix">
          <div class="area-left">
            <span class="over-hide" :title="sear.tips">{{ sear.label }}</span>
            <svg-icon icon-class="arrow" class="arrow-icon" />
          </div>
          <div class="area-right search-form">
            <span class="filter-item">
              <!--        时间日期筛选框-->
              <date-picker v-if="getPickerConfig(sear.view_type).show" :clearable="sear.clearable" :size="elSize" :sear="sear" :get-picker-config="getPickerConfig" :picker-options="pickerOptions" @search="search" />

              <!--      普通匹配筛选框（范围 / 纯数值 / RMB）-->
              <normal-input v-if="(sear.view_type === viewType.NORMAL || sear.view_type === viewType.CURRENCY_RMB)" :clearable="sear.clearable" :size="elSize" :sear="sear" :get-input-type="getInputType" :query-type="queryType" @search="search" />

              <!--      远程搜索/自定义 下拉筛选框-->
              <render-options v-if="sear.view_type === viewType.OPTIONS" :clearable="sear.clearable" :size="elSize" :prop-val="sear.value" :config-id="configId" :sear="sear" @optionChange="search" />
            </span>
          </div>
        </section>

        <footer class="section-wrap_footer">
          <el-button type="primary" :size="elSize" @click="search">确定</el-button>
          <el-button class="ml-20" :size="elSize" @click="toggleExpand">取消</el-button>
        </footer>
      </div>
    </section>
    <section v-if="showFilter" class="filter-back clearfix mb--7">
      <slot name="filterBack" />
      <span v-if="showSetting" class="batch">
        <el-button :size="elSize" class="batch-item btn" @click="toggleColSetDialog">列设置</el-button>
      </span>
      <span v-if="showSettingExport" class="batch">
        <el-tooltip effect="light" content="仅提供页面前端导出" placement="top">
          <el-button :size="elSize" class="batch-item btn" @click="openExport">导出</el-button>
        </el-tooltip>
      </span>
      <span v-if="showRemoteExport" class="batch">
        <el-button class="batch-item btn" :size="elSize" @click="remoteExport">导出表格</el-button>
      </span>

      <span v-if="selectable && openDeleteBatch" class="batch">
        <render-popup v-if="allowDeleteBatch" :handle-confirm="confirmDeleteRows" popup-title="确认批量删除？">
          <el-button slot="reference" :size="elSize" class="batch-item btn">批量删除
          </el-button>
        </render-popup>
        <el-button v-else :size="elSize" disabled class="batch-item btn">批量删除</el-button>
      </span>

      <!--    !SET FORM-->
      <div
        v-if="showSetting"
        :class="['batch', 'set-form', {hide: phoneSetting}]"
        :style="{width: showSettingExport ? '160px' : '110px'}"
      >
        <!--      导出-->
        <i v-show="isPhone" class="el-icon-caret-right phone-icon" @click="phoneSetting = !phoneSetting" />
      </div>
    </section>
    <!-- table组件放置在 filter后-->
    <slot name="tableArea" />

    <!-- 默认筛选项设置弹窗-->
    <beauty-dialog top="50px" width="620px" :visible.sync="filterSetDialog">
      <template v-slot:titleSelf>
        <span>默认筛选项设置</span>
        <el-tooltip effect="light" class="item" content="还原筛选项设置" placement="right">
          <el-button :size="elSize" type="text">还原</el-button>
        </el-tooltip>
      </template>
      <section class="filter-popup filter-sections mt-12 mb-12">
        <article class="filter-set">
          <div v-for="sear in searchQuery" :key="sear.key" class="area-structure edit-item">
            <div class="area-left">
              <span class="over-hide" :title="sear.label">{{ sear.label }}</span>
              <svg-icon icon-class="arrow" class="arrow-icon" />
            </div>
            <div class="inner-item area-right">
              <div class="select">
                <!--                选择筛选条件-->
                <el-select v-model="sear.defaultSelectQueryType" :size="elSize" placeholder="请选择" :disabled="sear.query_type && sear.query_type.length <= 1" @change="setDefaultFilter(sear)">
                  <el-option
                    v-for="(queryType,index) in sear.query_type"
                    :key="`${index}-${queryType}`"
                    :label="getQueryTypeName(queryType)"
                    :value="queryType"
                  />
                </el-select>
              </div>
              <div class="default">
                <!--                选择默认值-->
                <div v-if="sear.view_type === viewType.NORMAL || sear.view_type === viewType.CURRENCY_RMB" class="default-item">
                  <normal-input :size="elSize" :sear="sear" :get-input-type="getInputType" :query-type="queryType" model-name="default" @onChange="setDefaultFilter" />
                </div>
                <el-select v-if="getPickerConfig(sear.view_type).show" v-model="sear.default" :size="elSize" clearable placeholder="请选择默认值" @change="setDefaultFilter">
                  <el-option v-for="time in timeDefaultList" :key="time.val" :label="time.label" :value="time.val" />
                </el-select>
                <render-options v-if="sear.view_type === viewType.OPTIONS" :size="elSize" model-name="default" :config-id="configId" :sear="sear" @optionChange="setDefaultFilter" />
              </div>
              <vxe-checkbox v-model="sear.defaultOpen" @change="setDefaultFilter" />

            </div>
          </div>
        </article>
      </section>
      <template v-slot:footer>
        <el-button :size="elSize" @click="toggleFilterSetDialog">取消</el-button>
        <el-button class="ml-16" title="立即进行一次搜索" type="primary" :size="elSize" @click="()=>{freshSearch();search();toggleFilterSetDialog();}">立即应用</el-button>
      </template>
    </beauty-dialog>

    <!-- 列设置弹窗-->
    <beauty-dialog top="50px" width="860px" :visible.sync="colSetDialog">
      <template v-slot:titleSelf>
        <span>列设置</span>
      </template>
      <section class="filter-popup">
        <article class="column-set">
          <c-col-set ref="colSet" :span="12" :columns.sync="columns" :size="elSize">
            <template v-slot:title>
              <span class="flex between" style="width: 100%">
                <span>列设置</span>
                <el-button :size="elSize" class="item pr-0" type="text" @click="()=>{resetForm('col');toggleColSetDialog()}">还原</el-button>
              </span>
            </template>
          </c-col-set>
          <div class="lh-30">
            <vxe-checkbox v-model="rememberColumn" checked-value="1" unchecked-value="2">
              记住我的选择
            </vxe-checkbox>
          </div>
        </article>
      </section>
      <template v-slot:footer>
        <el-button :size="elSize" @click="toggleColSetDialog">取消</el-button>
        <el-button class="ml-16" type="primary" :size="elSize" @click="()=>{applySetting();}">应用</el-button>
      </template>
    </beauty-dialog>
  </div>
</template>

<script>
import { filterType, JT } from './form-types'
import { objectEach, isEmpty } from 'xe-utils'
import filterDateMixin from './mixins/filter-date-mixins'
import filterQueryMixin from './mixins/filter-query-mixins'
import filterOptionMixin from './RenderOptions/options-mixins'
import DatePicker from './components/DatePicker'
import NormalInput from './components/NormalInput'
import { _local, getAllParams, cloneDeep } from '@/utils/tool'
import CColSet from '@/components/ColSet'

const rememberTime = 3 * 24 * 3600 * 1000 // 列以及筛选项信息缓存3天
import BeautyDialog from '@/components/BeautyDialog/index'

// 全局的表格筛选项渲染组件
export default {
  name: 'GlobalFilter',
  components: { CColSet, DatePicker, NormalInput, BeautyDialog },
  mixins: [filterDateMixin, filterQueryMixin, filterOptionMixin],
  props: {
    showFilter: { type: Boolean, default: true }, // 显示表格顶部筛选项
    configId: { type: [Number, String], default: 0 }, // config->tableId
    tableId: { type: String, default: '' },
    showSetting: { type: Boolean, default: true }, // 是否显示列设置
    showSettingExport: { type: Boolean, default: false }, // 是否显示前端导出按钮
    showRemoteExport: { type: Boolean, default: false }, // 是否显示后端导出按钮
    selfOptions: { type: Object, default: () => ({}) }, // 自定义options { key=> options }
    selectable: { type: Boolean, default: false }, // 是否可以多选 （若打开多选则支持批量操作）
    deleteDataForm: { type: Object, default: () => ({}) },
    fromNest: { type: Boolean, default: false }, // 是否来自嵌套表格（子表格）
    isPhone: { type: Boolean, default: false }, // 是否是移动端
    elSize: { type: String, default: 'small' } // ui样式尺寸
  },
  data() {
    this.colKey = 'table-cols-' + this.configId
    this.filterKey = 'table-filters-' + this.configId
    const reKey = this.reKey = 'rememberCol-' + this.configId
    this.lockHeight = false
    this.confirmDeleteRows = () => this.$emit('handleDeleteRow', this.selectedValues)
    return {
      fromFilter: true,
      filterConfig: [],
      filters: [],
      searchQuery: null,
      ...filterType,
      columns: [],
      getQueryTypeName: JT.getQueryTypeName,
      rememberColumn: _local.get(reKey) || '2',
      expand: false,
      searching: false, // 正在搜索，防止重复触发搜索
      selectedValues: [],
      phoneSetting: false,
      expandHeight: 0,
      filterSetDialog: false,
      colSetDialog: false

    }
  },
  computed: {
    openDeleteBatch() {
      return !isEmpty(this.deleteDataForm)
    },
    allowDeleteBatch() {
      if (!this.selectedValues || this.selectedValues.length <= 0) return false
      return this.selectedValues.every(val => val.allowDelete)
    },
    listLoading() {
      return this.$parent && this.$parent.$refs.scrollLoadTable && this.$parent.$refs.scrollLoadTable.listLoading
    }
  },
  watch: {
    isPhone(val) {
      this.phoneSetting = val
      // this.resetFilterHeight()
    }
  },
  methods: {
    toggleExpand() {
      this.expand = !this.expand
      if (this.expand) this.setExpandHeight()
    },
    setExpandHeight() {
      this.$nextTick(() => {
        const filterEle = document.querySelector(`.choco-filter[table-id="${this.tableId}"]`)
        const sectionsEle = document.querySelector(`.choco-filter[table-id="${this.tableId}"]>.filter-sections`)
        if (filterEle && sectionsEle) {
          this.expandHeight = (filterEle.clientHeight - sectionsEle.clientHeight - 10) + 'px'
        }
      })
    },
    toggleFilterSetDialog() { // open filter set dialog
      this.filterSetDialog = !this.filterSetDialog
    },
    toggleColSetDialog() { // open col set dialog
      this.colSetDialog = !this.colSetDialog
      if (this.colSetDialog) {
        this.$nextTick(() => {
          this.$refs['colSet'].$init()
        })
      }
    },
    search() {
      if (!this.searching) {
        this.searching = true
        this.expand = false
        this.$emit('search', () => {
          this.searching = false
        })
      }
    },
    getFilterConfig(filters) { // 获取筛选项
      this.filters = cloneDeep(filters)
    },
    resetForm(type = '') {
      this.freshSearch()
      if (type === 'filter') {
        _local.remove(this.filterKey)
      }
      if (type === 'col') {
        _local.remove(this.colKey)
      }
      _local.remove(this.reKey)
      this.rememberColumn = '2'
      this.$emit('resetForm')
    },
    setSelectedValues(vals) {
      this.selectedValues = cloneDeep(vals)
    },
    // export
    openExport() {
      this.$emit('onOpenExport')
    },
    remoteExport() { // 后端导出
      this.$emit('remoteExport')
    },
    getPickerConfig(viewType) { // 获取时间选择器config
      const res = { show: false, type: '', format: '' }
      const mv = JT.$getType(viewType, 'viewType') // match viewType

      if (mv('TIME') || mv('DATE')) {
        res.show = true
      }
      if (mv('TIME')) {
        res.type = 'datetimerange'
        res.format = 'YYYY-MM-DD HH:mm:ss'
      } else if (mv('DATE')) {
        res.type = 'daterange'
        res.format = 'YYYY-MM-DD'
      }
      return res
    },
    getColumns(columns = null) {
      const localCols = _local.get(this.colKey) // 检查缓存
      if (!localCols) {
        this.columns = columns.map(col => ({ key: col.key, column_type: col.column_type, label: col.label, open: col.open || !col.collapse_default }))
      } else {
        this.columns = localCols
      }

      if (this.rememberColumn === '1') {
        _local.set(this.colKey, this.columns, rememberTime)
      }
      this.$emit('sortListByArr', columns, this.columns)
      return columns
    },
    applySetting() { // 立即应用列设置
      this.columns = this.$refs['colSet'].$getData()
      if (this.columns.every(col => !col.open)) {
        this.$choco_msg.warning('请打开至少一个列')
        return
      }
      _local.set(this.reKey, this.rememberColumn, rememberTime)

      if (this.rememberColumn === '1') { // 记住选择
        _local.set(this.colKey, this.columns, rememberTime)
      } else {
        _local.remove(this.colKey)
      }
      this.colSetDialog = false
      this.$emit('handleSetCols', cloneDeep(this.columns))
    },
    autoSearch() { // 根据路由参数自动搜索
      const query = getAllParams()
      if (isEmpty(query) || this.fromNest) return
      objectEach(query, (item, key) => {
        this.searchQuery.forEach(qItem => {
          if (qItem.key === key) qItem.value = item
        })
      })
    },
    setDefaultFilter(sear = null) {
      const that = this
      const t = setTimeout(() => { // 异步防止阻塞卡顿
        if (sear) { // 需要先进行default值转换
          const mv = JT.$getType(sear.view_type, 'viewType') // match viewType
          const mq = JT.$getType(sear.defaultSelectQueryType, 'queryType') // match queryType

          if (mv('NORMAL') || mv('CURRENCY_RMB')) {
            if (mq('RANGE')) {
              sear.default = { start: '', end: '' }
            } else {
              sear.default = ''
            }
          }
        }

        if (that.searchQuery && that.searchQuery.length > 0) {
          const q = that.searchQuery.map(item => ({ key: item.key, label: item.label, default: item.default, defaultSelectQueryType: item.defaultSelectQueryType, defaultOpen: item.defaultOpen }))
          _local.set(that.filterKey, q, rememberTime)
          // that.$choco_msg.success('已设置')
          console.log('已设置')
        }
        clearTimeout(t)
      }, 20)
    },
    getInputType(valueType) {
      return (valueType === this.valueType.INT || valueType === this.valueType.FLOAT) ? 'number' : 'text'
    }

  }
}
</script>

<style lang="scss">
@import "./assets/table-base";

@mixin item-input{
  &.daterange{
    width: 240px;
  }
  &.short{
    //width: 80px;
    width: calc( (100% - 14px) / 2 );
  }
  &.middle{
    width: 75%;
  }
  &.long{
    width: 100%;
  }
  input[type=number] {
    -moz-appearance:textfield;
  }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

}
.tip-content {
  color: $color-text-primary;
}

.choco-filter {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  transition: max-height .2s var(--ease-in-out);
  background-color: #fff;
  border-radius: 4px;
  font-size: var(--gutter_13-14);

  .el-select__tags{
    flex-wrap: nowrap;
  }
  .filter-sections{
    background-color: $bg-white-1;
    position: relative;

    @mixin area-left{
      width: calc(var(--gutter_24-44,44px) + 100px) ;
      float: left;
      height: var(--gutter_42-48);
      line-height: var(--gutter_42-48);
      text-align: center;
      font-weight: 400;
      color: $color-text-regular;
      border: none;
      >span{
        max-width: 75%;
        display: inline-block;
        vertical-align: middle;
      }
    }

    @mixin area-right{
      min-height: var(--gutter_42-48);
      width: calc(100% - ( var(--gutter_24-44,44px) + 100px )) ;
      float: left;
      padding: 0 16px;
      border-left:1px solid $border-white-3;
      border-right: none;
      border-top: none;
      border-bottom: none;
      background-color: $color-white;
      margin-top: -1px;
      line-height: 1;
      vertical-align: middle;
    }

    .area-structure{
      width: 100%;
      overflow: hidden;
      border: 1px solid $border-white-3;
      background-color: $bg-white-2;

      &:first-of-type{
        border-radius: 4px 4px 0 0;
        border-bottom: none;
      }
      &:last-of-type{
        border-radius: 0 0 4px 4px;
      }
      &:only-of-type{
        border-radius:4px;
        border-bottom: 1px solid $border-white-3;
      }
      &+.area-structure{
        margin-top: -1px;
      }

      .area-left{
        @include area-left;
        .arrow-icon{
          color: $color-white-4;
          transform: rotate(-90deg);
          margin: 0 6px;
          display: inline-block;
          vertical-align: middle;
        }

      }
      .area-right{
        @include area-right;

        &.search-form,.search-form {
          display: flex;
          justify-content: start;
          align-items: center;
          flex-wrap: wrap;
          overflow: hidden;
          float: left;
          line-height: var(--gutter_42-48);
          color: $color-text-regular;
          &.max-width {
            width: 100%;
          }

          .filter-item {
            height: var(--gutter_42-48);

            &:not(:last-of-type) {
              margin-right: 6px;
            }

            &:last-child {
              padding-right: 0;
            }

            .item-input {
              @include item-input
            }

            input.el-input__inner {
              padding: 0 4px 0 6px;
            }

            .btn {
              font-weight: 300;
            }
          }
        }

        .tags{
          line-height: var(--gutter_42-48);
          float: left;
          width: calc(100% - calc(var(--gutter_40-48) + 30px));
          .tag{
            background-color: $bg-white-2;
            border-radius: 4px;
            opacity: 1;
            border: 1px solid $border-white-3;
            &+.tag{
              margin-left: 6px;
            }
          }
        }
        .wrap{
          line-height: var(--gutter_42-48);
          float: right;
          .btn{
            height: 24px;
            padding: 2px 8px;
            .delete{
              color: #D0D3D9;
              &+span{
                font-size: var(--gutter_13-14);
              }
            }
            @include normal-btn
          }
        }
      }
    }
    // 小箭头
    >i.arrow-point{
      z-index: 2002;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: -5.5px;
      display: inline-block;
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 7px solid $border-white-3;
      &:after{
        content: "";
        display: block;
        position: absolute;
        z-index: 1995;
        left: -5px;
        bottom: -9px;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 7px solid $color-white;
      }
    }

    .whole-section-wrap{
      position: absolute;
      left: 0;
      bottom: -5px;
      transform: translateY(100%);
      width: 100%;
      overflow: auto;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 8%);
      transition: max-height .3s var(--ease-in-out-quint), z-index .4s linear;
      border: 1px solid $border-white-3;
      border-radius: 4px;
      background-color: $color-white;
      z-index: -1;
      &.expand{
        z-index: 2001;
      }
      .whole-area{
        border-left: none;
        border-right: none;
        &:first-of-type{
          border-top: none;
        }
        .area-left{
          text-align: right;
        }
        .area-right{
          border-left: none;
        }
      }
      .section-wrap_footer{
        height: 56px;
        line-height: 56px;
        display: inline-block;
        padding-left: calc(var(--gutter_20-40) + 120px);
        >.el-button{
          width: 66px;
        }
      }
    }
  }

  .filter-back{
    width: 100%;
    display: inline-block;
    line-height: 1;
    background-color: $bg-white-1;

    .batch{
      display: flex;
      justify-content: start;
      line-height: 1px;
      float: left;
      padding: 8px 0;
      color: $color-text-regular;

      &+.batch{
        margin-left: 8px;
      }

      .batch-item{
        &:not([disabled]){
          cursor: pointer;
        }
        &+.batch-item{
          margin-left: 8px;
        }
        &.hidden{
          color: $border-white-1;
          cursor: not-allowed;
        }
        &.btn,.btn{
          @include normal-btn
        }
        &.handle{
          background-color: #F0F3FA;
        }
      }
    }

    .set-form{
      float: right;
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      align-items: center;

      .wrap {
        width: 28px;
        height: 28px;
        line-height: 28px;
        cursor: pointer;
        text-align: center;
        background-color: transparent;
        color: $light-blue;
        font-size: 20px;
        border-color: #f3f0f1;
        margin: 0;
        &.first{
          margin-left: 0;
        }

        .set-icon {
          transition: transform .2s ease-in-out;
          &:hover {
            transform: rotateZ(-90deg);
          }
        }
        .fresh-icon{
          font-size: 24px;
        }
      }
    }
  }

}

.filter-popup{
  max-height: calc(80vh - 100px);
  overflow-y: auto;
  overflow-x: hidden;
  font-size: var(--gutter_13-14);

  .filter-set {
    .area-structure{
      border: none;
      .area-left{
        text-align: right;
        border: none;
        background-color: $color-white;
      }
      .area-right{
        border: none;
      }
    }

    .edit-item {

      .inner-item{
        display: flex;
        justify-content: start;
        align-items: center;
        flex-wrap: wrap;

        .select {
          margin-left: 10px;
        }
        .default{
          flex: 1;
          margin: 0 10px;
          .el-select{
            width: 100%;
          }
        }
        .check-cell{
          width: 18px;
          height: 18px;
          border-radius: 3px;
          border: 1.2px solid $border-white-3;
          cursor: pointer;
          position: relative;
          margin-left: 8px;
          position: relative;
          .svg-check{
            font-size: 12px;
            position: absolute;
            opacity: 0;
            left: 50%;
            top: 50%;
            transform: translate3d(-50%, -50%, 0px);
          }

          &.checked{
            background-color: $light-blue;
            border-color: $light-blue;
            color: #fff;
            .svg-check{
              opacity: 1;
            }
          }
          &:hover{
            border-color: $light-blue;
          }
        }
        .item-input {
          @include item-input
        }
      }

    }
  }

  .column-set{
    padding: 12px 16px 0 16px;

    .sub-btn {
      cursor: pointer;
      padding: 4px 8px;
      color: $color-text-regular;
      border: 1px solid $border-white-3;

      &:hover{
        box-shadow: inset 0 0 0 2px $border-white-3, 0 2px 2px 0 rgba(0, 0, 0, 8%);
      }
    }
  }
}

</style>
