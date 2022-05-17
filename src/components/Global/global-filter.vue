<template>
  <div class="global-filter" :table-id="tableId">
    <div v-if="showFilter" class="sections">
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
              <svg-icon class="delete fs-14 mr-4" icon-class="delete" />
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

            <!--        时间日期筛选框-->
            <span v-for="sear in searchQuery.filter(sear => sear.open && getPickerConfig(sear.view_type).show)" :key="'filter-item-'+sear.key" class="filter-item">
              <date-picker :clearable="sear.clearable" :size="elSize" :sear="sear" :get-picker-config="getPickerConfig" :picker-options="pickerOptions" @search="search" />
            </span>

            <!--      普通匹配筛选框（范围 / 纯数值 / RMB）-->
            <span v-for="sear in searchQuery.filter(sear => sear.open && (sear.view_type === viewType.NORMAL || sear.view_type === viewType.CURRENCY_RMB))" :key="'filter-item-'+sear.key" class="filter-item">
              <normal-input :clearable="sear.clearable" :size="elSize" :sear="sear" :get-input-type="getInputType" :query-type="queryType" @search="search" />
            </span>

            <!--      远程搜索/自定义 下拉筛选框-->
            <span v-for="sear in searchQuery.filter(sear => sear.open && sear.view_type === viewType.OPTIONS)" :key="'filter-item-'+sear.key" class="filter-item">
              <render-options :clearable="sear.clearable" :size="elSize" :prop-val="sear.value" :config-id="configId" :sear="sear" @optionChange="search" />
            </span>

            <!--            has searchQuery!-->
            <div class="search-form"><slot name="filterMore" /></div>

            <!--      筛选设置按钮-->
            <span v-if="showSetting" class="filter-item">
              <el-button :size="elSize" @click="toggleFilterSetDialog">设置</el-button>
            </span>

          </div>
          <div v-if="!searchQuery" :class="['search-form', {'max-width': !showSetting}]">
            <el-skeleton-item v-for="i in 2" :key="'skeleton-'+i" :rows="1" animated style="width: 200px;margin-right: 20px" />
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
        <section v-for="sear in searchQuery.filter(sear => !sear.open && getPickerConfig(sear.view_type).show)" :key="'filter-item-'+sear.key" class="whole-area area-structure clearfix">
          <div class="area-left">
            <span class="over-hide" :title="sear.tips">{{ sear.label }}</span>
            <svg-icon icon-class="arrow" class="arrow-icon" />
          </div>
          <div class="area-right search-form">
            <span class="filter-item">
              <date-picker :clearable="sear.clearable" :size="elSize" :sear="sear" :get-picker-config="getPickerConfig" :picker-options="pickerOptions" @search="search" />
            </span>
          </div>
        </section>
        <section v-for="sear in searchQuery.filter(sear => !sear.open && (sear.view_type === viewType.NORMAL || sear.view_type === viewType.CURRENCY_RMB))" :key="'filter-item-'+sear.key" class="whole-area area-structure clearfix">
          <div class="area-left">
            <span class="over-hide" :title="sear.tips">{{ sear.label }}</span>
            <svg-icon icon-class="arrow" class="arrow-icon" />
          </div>
          <div class="area-right search-form">
            <span class="filter-item">
              <normal-input :clearable="sear.clearable" :size="elSize" :sear="sear" :get-input-type="getInputType" :query-type="queryType" @search="search" />
            </span>
          </div>
        </section>

        <section v-for="sear in searchQuery.filter(sear => !sear.open && sear.view_type === viewType.OPTIONS)" :key="'filter-item-'+sear.key" class="whole-area area-structure clearfix">
          <div class="area-left">
            <span class="over-hide" :title="sear.tips">{{ sear.label }}</span>
            <svg-icon icon-class="arrow" class="arrow-icon" />
          </div>
          <div class="area-right search-form">
            <span class="filter-item">
              <!--      远程搜索/自定义 下拉筛选框-->
              <render-options :clearable="sear.clearable" :size="elSize" :prop-val="sear.value" :config-id="configId" :sear="sear" @optionChange="search" />
            </span>
          </div>
        </section>
        <footer class="section-wrap_footer">
          <el-button type="primary" :size="elSize" @click="search">确定</el-button>
          <el-button class="ml-20" :size="elSize" @click="toggleExpand">取消</el-button>
        </footer>
      </div>
    </div>
    <section v-if="showFilter" class="filter-back clearfix mb--7">
      <slot name="filterBack" />
      <div v-if="showSetting" class="batch">
        <el-button :size="elSize" class="batch-item btn" @click="toggleColSetDialog">列设置</el-button>
      </div>
      <div v-if="selectable && openDeleteBatch" class="batch">
        <render-popup v-if="allowDeleteBatch" :handle-confirm="confirmDeleteRows" popup-title="确认批量删除？">
          <el-button slot="reference" :size="elSize" class="batch-item btn">批量删除
          </el-button></render-popup>
        <el-button v-else :size="elSize" disabled class="batch-item btn">批量删除</el-button>
      </div>

      <!--    !SET FORM-->
      <div
        v-if="showSetting"
        :class="['batch', 'set-form', {hide: phoneSetting}]"
        :style="{width: showSettingExport ? '160px' : '110px'}"
      >
        <!--      导出-->
        <div v-if="showSettingExport" class="wrap" @click="openExport"><i class="svg-wrap"><svg-icon icon-class="export" /></i></div>
        <i v-show="isPhone" class="el-icon-caret-right phone-icon" @click="phoneSetting = !phoneSetting" />
      </div>
    </section>
    <!-- table组件放置在 filter后-->
    <slot name="tableArea" />

    <!-- 默认筛选项设置弹窗-->
    <beauty-dialog top="50px" width="620px" :visible.sync="filterSetDialog">
      <template v-slot:titleSelf>
        <span>默认筛选项设置</span>
        <el-tooltip effect="light" class="item svg-wrap" content="还原筛选项设置" placement="right">
          <svg-icon icon-class="fresh" class="fresh-icon fs-20" @click="()=>{resetForm('filter');toggleFilterSetDialog()}" />
        </el-tooltip>
      </template>
      <section class="filter-popup sections">
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
              <span
                :class="['check-cell', {checked: sear.defaultOpen}]"
                @click="()=> {
                  sear.defaultOpen = !sear.defaultOpen
                  setDefaultFilter()
                }"
              >
                <svg-icon icon-class="check" class-name="svg-check" />
              </span>
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
          <div class="content-wrap">

            <div class="left">
              <div class="title">
                <span>列设置</span>
                <el-tooltip effect="light" class="item svg-wrap" content="还原列设置" placement="right">
                  <svg-icon icon-class="fresh" class="fresh-icon fs-20" @click="()=>{resetForm('col');toggleColSetDialog()}" />
                </el-tooltip>
              </div>
              <div class="inner-content">
                <div class="content-item">
                  <header>
                    <el-checkbox v-model="openMetrics" @change="allCols(0)">维度</el-checkbox>
                  </header>
                  <section>
                    <el-row>
                      <el-col v-for="item in columns.filter(col => col.column_type === 0)" :key="item.key" :span="12">
                        <el-checkbox v-model="item.open">{{ item.label }}</el-checkbox>
                      </el-col>
                    </el-row>
                  </section>
                </div>
                <div class="content-item">
                  <header>
                    <el-checkbox v-model="openDimensions" @change="allCols(1)">指标</el-checkbox>
                  </header>
                  <section>
                    <el-row>
                      <el-col v-for="item in columns.filter(col => col.column_type === 1)" :key="item.key" :span="12">
                        <el-checkbox v-model="item.open">{{ item.label }}</el-checkbox>
                      </el-col>
                    </el-row>
                  </section>
                </div>
              </div>
            </div>
            <div class="right">
              <div class="title">
                <span class="w-100">已选</span>
                <el-button type="text" class="ml-54 pr-0" size="small" @click="columns.forEach(item => item.open = false)">清空</el-button>
              </div>
              <draggable v-model="columns" class="column-edit">
                <transition-group>
                  <div
                    v-for="item in columns"
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
          <div class="pl-16 lh-30">
            <el-checkbox v-model="rememberColumn" true-label="1" false-label="2">
              记住我的选择
            </el-checkbox>
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
import draggable from 'vuedraggable'
import { clone, objectEach, isEmpty } from 'xe-utils'
import filterDateMixin from './mixins/filter-date-mixins'
import filterQueryMixin from './mixins/filter-query-mixins'
import filterOptionMixin from './RenderOptions/options-mixins'
import DatePicker from './components/DatePicker'
import NormalInput from './components/NormalInput'
import BeautyDialog from '@/components/BeautyDialog'

// 全局的表格筛选项渲染组件
export default {
  name: 'GlobalFilter',
  components: { draggable, DatePicker, NormalInput, BeautyDialog },
  mixins: [filterDateMixin, filterQueryMixin, filterOptionMixin],
  props: {
    showFilter: { type: Boolean, default: true }, // 显示表格顶部筛选项
    configId: { type: [Number, String], default: 0 }, // config->tableId
    isSelf: { type: Boolean, default: false }, // 自定义，非标准global-table
    tableId: { type: String, default: '' },
    showSetting: { type: Boolean, default: true }, // 是否显示列设置
    showSettingExport: { type: Boolean, default: false }, // 是否显示前端导出按钮
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
      rememberColumn: localStorage.getItem(reKey) || '2',
      expand: false,
      searching: false, // 正在搜索，防止重复触发搜索
      selectedValues: [],
      phoneSetting: false,
      expandHeight: 0,
      filterSetDialog: false,
      colSetDialog: false,
      openMetrics: true,
      openDimensions: true
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
        const filterEle = document.querySelector(`.global-filter[table-id="${this.tableId}"]`)
        const sectionsEle = document.querySelector(`.global-filter[table-id="${this.tableId}"] .sections`)
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
    },
    allCols(colType = 0) { // 开启or关闭维度指标
      this.columns.forEach(col => {
        if (col.column_type === colType) {
          col.open = colType === 0 ? this.openMetrics : this.openDimensions
        }
      })
    },
    search() {
      if (!this.searching) {
        this.searching = true
        this.$emit('search', () => {
          this.expand = false
          this.searching = false
        })
      }
    },
    getFilterConfig(filters) { // 获取筛选项
      this.filters = clone(filters, true)
    },
    resetForm(type = '') {
      this.freshSearch()
      if (type === 'filter') {
        localStorage.removeItem(this.filterKey)
      }
      if (type === 'col') {
        localStorage.removeItem(this.colKey)
      }
      localStorage.removeItem(this.reKey)
      this.rememberColumn = '2'
      this.$emit('resetForm')
    },
    setSelectedValues(vals) {
      this.selectedValues = clone(vals, true)
    },
    // export
    openExport() {
      this.$emit('onOpenExport')
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
      const localCols = localStorage.getItem(this.colKey) // 检查缓存
      if (!localCols) {
        this.columns = columns.map(col => ({ key: col.key, column_type: col.column_type, label: col.label, open: !col.collapse_default }))
      } else {
        this.columns = JSON.parse(localCols)
      }

      if (this.rememberColumn === '1') {
        localStorage.setItem(this.colKey, JSON.stringify(this.columns))
      }
      this.$emit('sortListByArr', columns, this.columns)
      return columns
    },
    applySetting() { // 立即应用列设置
      if (this.columns.every(col => !col.open)) {
        this.$msg.warning('请打开至少一个列')
        return
      }
      localStorage.setItem(this.reKey, this.rememberColumn)

      if (this.rememberColumn === '1') {
        localStorage.setItem(this.colKey, JSON.stringify(this.columns))
      } else {
        localStorage.removeItem(this.colKey)
      }
      this.colSetDialog = false
      this.$emit('handleSetCols', clone(this.columns, true))
    },
    autoSearch() { // 根据路由参数自动搜索
      if (!this.$route.query || this.fromNest) return
      objectEach(this.$route.query, (item, key) => {
        this.searchQuery.forEach(qItem => {
          if (qItem.key === key) qItem.value = item
        })
      })
    },
    setDefaultFilter(sear = null) {
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

      if (this.searchQuery && this.searchQuery.length > 0) {
        const q = this.searchQuery.map(item => ({ key: item.key, label: item.label, default: item.default, defaultSelectQueryType: item.defaultSelectQueryType, defaultOpen: item.defaultOpen }))
        localStorage.setItem(this.filterKey, JSON.stringify(q))
        this.$msg.success('已设置')
      }
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

.global-filter {
  width: 100%;
  overflow: hidden;
  position: relative;
  transition: max-height .2s var(--ease-in-out);
  background-color: #fff;
  border-radius: 4px;
  font-size: var(--gutter_13-14);

  .el-select__tags{
    flex-wrap: nowrap;
  }
  .sections{
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
          .default-item{
            display: flex;
            justify-content: space-between;
          }
        }
        .check-cell{
          width: 20px;
          height: 20px;
          border-radius: 3px;
          border: 1.2px solid $border-white-3;
          cursor: pointer;
          position: relative;
          transition: all .1s ease-in-out;
          margin-left: 8px;
          position: relative;
          .svg-check{
            font-size: 12px;
            position: absolute;
            opacity: 0;
            left: 50%;
            top: 50%;
            transform: translate3d(-50%, -50%, 0px);
            transition: opacity .2s var(--ease-in-out-quint);
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
    .content-wrap{
      overflow: hidden;
      padding: 12px 16px 0 16px;
      .left,.right{
        border-radius: 4px;
        border: 1px solid $border-white-2;
        .title{
          width: 100%;
          height: 38px;
          line-height: 38px;
          border-bottom: 1px solid $border-white-2;
          background: $bg-white-2;
          display: inline-block;
          padding: 0 16px;
          >span,>button,>.svg-wrap{
            display: inline-block;
            vertical-align: middle;
          }
        }
      }
      .left{
        width: 585px;
        float: left;
        .inner-content{
          padding: 8px 16px;
          max-height: 400px;

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
        transition: .2s all ease-in-out;
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
