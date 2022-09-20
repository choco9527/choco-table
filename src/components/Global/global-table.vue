<template>
  <div v-if="nothingWrong" :class="['choco-table', {'auto-height': autoHeight}]">
    <global-filter
      ref="pageFilter"
      v-bind="$attrs"
      :show-setting="showSetting"
      :config-id="config.tableId"
      :table-id="tId"
      :selectable="selectable"
      :delete-data-form="deleteDataForm"
      :from-nest="fromNest"
      :el-size="$elSize"
      :show-filter="showFilter"
      @search="search"
      @handleSetCols="handleSetCols"
      @onOpenExport="onOpenExport"
      @sortListByArr="sortListByArr"
      @resetForm="fresh"
      @resetTableHeight="resetTableHeight"
      @handleDeleteRow="handleDeleteRow"
      @remoteExport="pageExport"
    >
      <template v-slot:filterMore>
        <slot name="filterMore" :filterConfig="filterConfig" />
      </template>
      <template v-slot:filterBack>
        <template v-if="allowAddForm && createDataForms && createDataForms.length>0">
          <div class="batch">
            <el-button v-for="formConf in createDataForms" :key="formConf.form_id" type="primary" class="batch-item btn" :size="$elSize" @click="addForm(formConf)">{{ formConf.call_action_text }}</el-button>
          </div>
        </template>
        <slot name="filterBack" :filterConfig="filterConfig" />
      </template>
      <template v-slot:tableArea>
        <slot name="tableFront" :filterConfig="filterConfig" />
        <vxe-scroll-load-table
          :ref="scrollTableName"
          :size="$tableSize"
          :el-size="$elSize"
          v-bind="$attrs"
          :table-id="tId"
          :columns="columns"
          :filter-data="filterMethod"
          :list-query.sync="listQuery"
          :request-method="requestMethod"
          :selectable="selectable"
          :nest-tables="nestTables"
          :from-nest="fromNest"
          :self-cell-formats="selfCellFormats"
          :stripe="false"
          fit
          :auto-height="autoHeight"
          align="center"
          border
          v-on="$listeners"
          @onSortColumn="onSortColumn"
          @handleSelectionChange="handleSelectionChange"
          @setWidthMap="setWidthMap"
        />
        <slot name="tableBack" />
      </template>
    </global-filter>
    <beauty-dialog
      :title="formDialogTitle"
      :width="dialogConfig.width"
      :top="dialogConfig.top"
      :visible.sync="showFormDialog"
      :destroy="true"
    >
      <global-form ref="globalForm" :max-height="dialogConfig.maxHeight" :config-id="config.tableId" :dialog-size="dialogSize" v-bind="$attrs" />
      <div slot="footer">
        <el-button size="small" @click="closeForm">取消</el-button>
        <el-button class="ml-16" size="small" type="primary" @click="submitForm('edit')">{{ submitText }}</el-button>
      </div>
    </beauty-dialog>
  </div>
</template>

<script>
import { getTableConfig, getTableList, exportTable } from './api/global-table'
import { submitForm } from './api/global-table'
import BeautyDialog from '@/components/BeautyDialog/index'

import VxeScrollLoadTable from './VxeScrollLoadTable'
import GlobalFilter from './global-filter'
import tableFilterMixin from './mixins/table-filter-mixins'
import tableColMixin from './mixins/table-clo-mixins'
import { JT } from './form-types'
import { isDevicePhone } from './assets/js/tools'

import GlobalForm from './global-form'

import { isEmpty } from 'xe-utils'
import { _local, cloneDeep } from '@/utils/tools'
const rememberTime = 30 * 24 * 3600 * 1000 // 列宽缓存30天

/*
  全局的表格渲染组件 筛选项已经列均由后端控制 后经过vxeTableMixin处理
  详见 https://conf.umlife.net/pages/viewpage.action?pageId=94019810
  表格设计 详见 https://conf.umlife.net/pages/viewpage.action?pageId=94018047
*/
export default {
  name: 'GlobalTable',
  components: { GlobalFilter, GlobalForm, VxeScrollLoadTable, BeautyDialog },
  mixins: [tableColMixin, tableFilterMixin],
  props: {
    config: { // 表格配置
      type: Object,
      default() {
        return {
          tableId: 0, // 有其一
          pageNum: 25, // 默认表格请求页数
          tableToken: '', // 子表格需要
          nestViewFilterDataToken: '' // 子表格需要
        }
      }
    },
    propSortColumn: { type: Object, default: () => ({}) }, // 子表格sort_column
    propColumns: { type: Array, default: () => ([]) }, // 子表格column
    propFilters: { type: Array, default: () => ([]) }, // 子表格filter
    propNestTables: { type: Array, default: () => ([]) }, // 子表格nestTable
    propTableForm: { type: Object, default: () => ({ createDataForms: null, editDataForms: null, deleteDataForm: null }) }, // 子表格tableForm

    fromNest: { type: Boolean, default: false }, // 是否来自嵌套表格（子表格）
    selfGetConfig: { type: Function, default: null }, // 自定义配置请求方法 替换getTableConfig
    selfGetList: { type: Function, default: null }, // 自定义列表请求方法 替换getTableList
    // selfSubmit: { type: Function, default: null }, // 自定义提交方法 替换global-form -> submitForm
    selfCellFormats: { type: Object, default: null }, // 自定义单元格格式化方法 { key=> fn:Function } 注意：和嵌套表格通用
    colConfigMap: { type: Object, default: () => ({}) }, // 列属性 { key: { align:'right', width: 120, fixed(或 fix): 'left'} } 注意：和嵌套表格通用
    showIndex: { type: Boolean, default: false }, // 显示表格序号 注意：和嵌套表格通用
    selfFilters: { type: Array, default: () => ([]) }, // 自定义filter 不渲染此filter
    tableSize: { type: String, default: '' }, // 表格尺寸
    extraQuery: { type: Object, default: null }, // 额外的自定义筛选项，最终会被拼接在请求参数中
    allowAddForm: { type: Boolean, default: true }, // 是否显示添加表格按钮
    dialogSize: { type: String, default: '' }, // 编辑窗口大小
    showOverflow: { type: [Boolean, String], default: 'ellipsis' }, // 文本溢出形式
    useSlotFooter: { type: Boolean, default: true }, // 是否使用slot形式渲染表尾，不使用性能会好点但无法使用与row相同的format方法

    /* filter */
    showFilter: { type: Boolean, default: true }, // 显示表格顶部筛选项
    showSetting: { type: Boolean, default: true }, // 是否显示表格设置（列排序等按钮）
    // showRemoteExport: { type: Boolean, default: true }, // 是否显示后端导出按钮
    elSize: { type: String, default: '' }, // ui样式尺寸
    // selfOptions: { type: Object, default: () => ({}) }, // 自定义options { key=> options:[] }
    // showSettingExport: { type: Boolean, default: true }, // 是否显示前端导出按钮
    exportOptions: { type: Object, default: () => ({}) }, // 前端导出options https://vxetable.cn/v3/#/table/api

    /* scroll table */
    selectable: { type: Boolean, default: false }, // 是否可以多选
    autoHeight: { type: Boolean, default: true } // true则铺满父容器，false由内容撑开
    // maxTbHeight: { type: String, default: 2000 }, // 列表最大定高
    // showTotal: { type: Boolean, default: true }, // 显示下方分页器
    // showTableSummary: { type: Boolean, default: false }, // 显示合计
    // customHeight: { type: Number, default: 0 } // 自定义表格计算需要减去高度
    // stickyFooter: { type: Boolean, default: false } // 是否合计行吸底
    // pages: { type: Array, default: () => [25, 50, 100, 200] } // 分页
    // enableContextMenu: { type: Boolean, default: true } // 开启右键菜单,默认启用
    // scrollSelector: { type: String, default: '' }, // 指定需要作为滚动监测的包裹元素，默认为window
  },
  data() {
    this.filterConfig = [] // 筛选项配置
    this.createDataForms = []
    this.editDataForms = []
    this.deleteDataForm = {}
    this.filters = [] // 筛选项
    this.tId = (Math.random() * Date.now()).toString(32) // 前端自定义id
    this.requestMethod = this.selfGetList || getTableList
    this.tableTitle = ''
    this.tableToken = ''
    this.hasConfig = false
    this.scrollTableName = 'scrollLoadTable'
    const widthKey = this.widthKey = 'table-cols-width-' + this.config.tableId

    return {
      nothingWrong: true,
      listQuery: {
        per_page_num: 25,
        next_page_token: null
      },
      showFormDialog: false,
      nestTables: null, // 行展开
      columnsConfig: [], // 列定义
      sortColumn: null, // 排序列
      formDialogTitle: '',
      submitText: '',
      widthMap: _local.get(widthKey) || {}, // 列宽
      selectedValues: [] // 选择的行元素
    }
  },
  computed: {
    $elSize() {
      return this.elSize || this.$cTableElSize
    },
    $tableSize() {
      return this.tableSize || this.$cTableTableSize
    },
    dialogConfig() {
      // dialog顶部+底部 = 88px
      return this.dialogSize === 'max'
        ? { width: '100vw', top: '0px', maxHeight: 'calc( 100vh - 88px )' }
        : { width: '660px', top: '10vh', maxHeight: '500px' }
    }
  },
  created() {
    this.config.pageNum && (this.listQuery.per_page_num = this.config.pageNum)
  },
  beforeDestroy() {
    let id = setTimeout(() => ({}), 0)
    while (id > 0) {
      window.clearTimeout(id)
      id--
    }
  },
  mounted() {
    const _get = () => {
      this.hasConfig = true
      this.getList()
    }
    if (!this.fromNest) { // 主表格数据加载
      this.getTableConfig().then(config => _get())
    } else { // 子表格数据加载
      this.getTableConfigFromParent().then(config => _get())
    }
  },
  methods: {
    fresh() { // 硬刷新
      const setTable = () => {
        this.sortColumn = null
        setTimeout(() => {
          this.$refs[this.scrollTableName].$reloadTable(this.search)
          this.$choco_msg.success('重置成功')
        })
      }
      this.widthMap = {}
      _local.remove(this.widthKey)
      if (!this.fromNest) {
        this.getTableConfig().then(config => {
          setTable()
        })
      } else { // 嵌套表格
        this.getTableConfigFromParent().then(config => {
          setTable()
        })
      }
    },
    getTableConfigFromParent() { // 从父表获取信息
      try {
        return new Promise((resolve, reject) => {
          this.tableToken = this.config.tableToken
          const columns = this.initColumnConfig(this.propColumns)
          const { createDataForms, editDataForms, deleteDataForm } = this.propTableForm
          this.initTableForms(createDataForms, editDataForms, deleteDataForm)
          this.initNestTable(this.propNestTables)
          this.initSortColumn(this.propSortColumn)
          this.initFilter(this.propFilters)
          resolve({ columns })
        })
      } catch (e) {
        console.log(e)
      }
    },
    async getTableConfig() {
      try {
        this.nothingWrong = true
        this.$refs[this.scrollTableName] && (this.$refs[this.scrollTableName].listLoading = true)
        let config = {}
        const resData = this.selfGetConfig ? await this.selfGetConfig() : await getTableConfig({ table_view_id: this.config.tableId }, this)
        if (!resData) throw new Error('未获取到配置信息')
        const remoteConfig = resData.config
        if (!remoteConfig) return Promise.reject('获取配置失败，配置格式不正确')
        config = Object.assign(config, remoteConfig)
        this.filterConfig = config.filter_config
        this.tableTitle = config.table_title
        this.tableToken = config.table_token
        const columns = this.initColumnConfig(config.columns)
        this.initFilter(config.filter_config.filters)
        this.initSortColumn(config.sort_column)
        this.initTableForms(config.create_data_forms, config.edit_data_forms, config.delete_data_form)
        this.initNestTable(config.nest_tables || null)
        return Promise.resolve({ columns })
      } catch (e) {
        this.$refs[this.scrollTableName] && (this.$refs[this.scrollTableName].listLoading = false)
        this.nothingWrong = false
        console.log(e)
      }
    },
    async getList() {
      try {
        await this.$refs[this.scrollTableName].$getList()
      } catch (e) {
        this.nothingWrong = false
      }
    },
    async search(cb = null) {
      if (this.hasConfig) await this.$refs[this.scrollTableName].$search() // 没有配置选项无法搜索，需先经过mounted->getList
      cb && cb()
    },
    initFilter(filters) { // 初始化筛选项
      this.filters = filters
      if (!this.showFilter) return
      filters = cloneDeep(filters)
      if (!this.$refs['pageFilter']) return
      this.$refs['pageFilter'].getFilterConfig(filters)
      this.$refs['pageFilter'].freshSearch(filters)
    },
    initColumnConfig(columns) { // 初始化【列】定义
      if (!columns) return
      columns = cloneDeep(columns)
      let cols = this.initCols(columns)
      let allOpen = true
      if (this.showSetting) {
        cols = this.$refs['pageFilter']?.getColumns(columns) ?? [] // 从filter读取存储的col信息
        allOpen = false
      }
      if (allOpen) cols.forEach(c => { c.open = true })
      this.columnsConfig = cols
      return columns
    },
    initTableForms(c, e, d) { // 初始化表单
      this.createDataForms = c ? cloneDeep(c) : null
      this.editDataForms = e ? cloneDeep(e) : null
      this.deleteDataForm = d ? cloneDeep(d) : null
    },
    initNestTable(propNestTables) { // 初始化行展开
      this.nestTables = cloneDeep(propNestTables)
    },
    initSortColumn(sortColumn) { // 初始化【列】排序
      if (!sortColumn) return
      const column = this.columnsConfig?.find(col => col.key === sortColumn.key)
      if (column && column.open) {
        this.sortColumn = cloneDeep(sortColumn)
      }
    },
    initCols(cols) { // 初始化【列】属性
      return cols.map(col => {
        const key = col.key
        col.width = this.widthMap[key] || col.fixed || this.colWidthMap[key] || '' // 本地存储 > 后端设置 > 前端设置
        col.minWidth = col.minWidth || this.colMinWidthMap[key] || '' // 后端设置 > 前端设置
        col.className = col.className || ''
        col.fixed = col.fixed || this.colFixMap[key] || '' // 本地存储 > 后端设置 > 前端设置
        return col
      })
    },
    pageExport() { // 导出
      const exportQuery = this.filterMethod(true)
      exportTable(exportQuery, this).then(res => {
        console.log(res)
      })
    },
    addForm(formConf) { // 新建表单
      if (!formConf && isEmpty(formConf)) return

      const formData = {}
      formConf.form.items.forEach(item => { // 填充空数据
        const format = JT.$toType(item.value_type)
        const { value, ...res } = item
        const newVal = format('')
        formData[item.key] = { ...res, value: newVal }
      })
      this.openForm(formData, formConf)
    },
    handleEditRow(rows = [], formConfig) { // 编辑行 row: 行数据
      if (!rows || rows.length <= 0) return
      const firstRow = rows[0]
      const pks = rows.map(row => row.pk)
      const formData = {}

      formConfig.form.items.forEach(item => {
        const format = JT.$toType(item.value_type)
        const { value, ...res } = firstRow?.r_d[item.key] ?? {}
        const newVal = format(res.source_value)
        formData[item.key] = { ...res, value: newVal }
      })

      this.openForm(formData, formConfig, pks)
    },
    handleDeleteRow(rows = []) { // 删除行 row: 行数据
      if (isEmpty(this.deleteDataForm)) return
      if (!rows || rows.length <= 0) return
      if (rows.some(row => !row.allowDelete)) return // if not some not allow delete => return
      const pks = rows.map(row => row.pk)
      const data = { commitValue: { form_token: this.deleteDataForm.form.form_token }, pks }
      this.submitForm('delete', data).then(res => {
        if (res.code === 0 && this.$refs['pageFilter']) this.$refs['pageFilter'].setSelectedValues([])
      })
    },
    openForm(formData, formConf, pks = []) {
      this.formDialogTitle = formConf.call_action_text
      this.submitText = formConf.form.submit_button_text

      if (isEmpty(formData) || isEmpty(formConf)) return
      this.showFormDialog = true
      this.$nextTick(() => {
        this.$refs.globalForm.$getFormConfig(formConf, pks) // 表单配置填充
        this.$refs.globalForm.$getFormData(formData, formConf) // 表单数据填充
      })
    },
    closeForm() {
      this.showFormDialog = false
      this.formData = null
    },
    showEditRow() { // 是否支持【编辑】列操作
      return !isEmpty(this.editDataForms) || !isEmpty(this.deleteDataForm) || this.editDataForms === 'allow'
    },
    submitForm(submitType = 'edit', data = null) {
      return new Promise(resolve => {
        if (submitType === 'edit') {
          this.$refs.globalForm.$submit().then(res => {
            if (res.code === 0) {
              this.closeForm()
              this.search()
              resolve({ code: 0 })
            }
          })
        } else if (submitType === 'delete') {
          submitForm(data, this).then(res => {
            if (res.status.code === 0) {
              this.$choco_msg.success('删除成功')
              this.search()
              resolve({ code: 0 })
            }
          })
        }
      })
    },
    onSortColumn(property, order) {
      if (order) {
        this.sortColumn = order ? {
          key: property,
          sort_type: order === 'desc' ? 1 : 0
        } : null
      } else {
        this.sortColumn = null
      }
      this.search()
    },
    handleSelectionChange(vals) {
      this.$refs['pageFilter'] && this.$refs['pageFilter'].setSelectedValues(vals)
      const mapVals = vals.map(item => item.r_d)
      console.log('globalTable->handleSelectionChange')
      this.$emit('handleTableSelectionChange', mapVals)
    },
    sortListByArr(list, order, key = 'key') {
      // 直接排序list https://blog.csdn.net/u010622874/article/details/90712604
      const newOrder = order.map(val => ({ key: val.key, open: val.open, fixed: val.fixed }))
      if (this.showEditRow()) {
        newOrder.push({ key: '$edit', open: false })
      }
      if (list.length !== newOrder.length) {
        console.log('list.length !== order.length')
        return
      }
      const od = newOrder.map(o => o.key)

      list.sort((a, b) => {
        const iA = od.indexOf(a[key])
        const iB = od.indexOf(b[key])

        // 排序时进行赋值
        a.open = newOrder[iA]?.open ?? true
        b.open = newOrder[iB]?.open ?? true
        a.fixed = newOrder[iA]?.fixed ?? ''
        b.fixed = newOrder[iB]?.fixed ?? ''

        return iA - iB
      })
    },
    handleSetCols(columns) { // 自定义列
      try {
        if (!columns || isEmpty(columns)) return
        this.$choco_msg.success('设置成功')
        this.sortListByArr(this.columnsConfig, columns)

        setTimeout(_ => {
          this.$refs[this.scrollTableName].$reloadTable(_ => { // 重载后search
            this.search(this.$refs[this.scrollTableName].initStickyFooter) // search后处理合计行
          })
        })
      } catch (e) {
        console.log(e)
      }
    },
    setWidthMap(prop = '', width = '') { // 设置列宽
      this.widthMap[prop] = width
      _local.set(this.widthKey, this.widthMap, rememberTime)
      // this.$choco_msg.success('已记录当前列宽')
    },

    onOpenExport() {
      this.$refs[this.scrollTableName].openExport(this.exportOptions)
    },
    resetTableHeight() {
      this.$refs[this.scrollTableName].setTableHeight()
    },
    getData() {
      return this.$refs[this.scrollTableName].data
    },
    _vxeTable() { // 向外暴露vxe-table
      return this.$refs[this.scrollTableName]._getVxeTable()
    },
    setActiveRows(activeIds, color = 'blue') {
      if (Object.prototype.toString.call(activeIds) === '[object Array]') {
        this.$refs[this.scrollTableName].highLineRows[color] = [...activeIds]
        this.$refs[this.scrollTableName].clearAll()
      }
    },
    clearActiveRows(color = 'blue') {
      this.$refs[this.scrollTableName].highLineRows[color] = []
      this.$refs[this.scrollTableName].clearAll()
    }
  }
}
</script>

<style lang="scss">
@import "./assets/table-base";
.choco-table {
  padding: 0;
  box-sizing: border-box;

  p,ul,li {
    padding: 0;
    margin: 0;
  }
  &.auto-height{ // height auto 铺满，否则撑开
    height: 100%;
  }

  .svg-wrap {
    vertical-align: text-bottom;
    display: inline-block;
    line-height: 1.5;
  }

  input:not(.el-select__input) {
    &:focus {
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 25%);
      border-color: $lighter-blue;
      border-radius: 4px;
    }
  }

  // 表头
  th{
    .vxe-cell{
      .vxe-cell--title{
        display: inline-block;
        .val-th {
          .label {
            color: $color-text-primary;
            line-height: 1;
            font-weight: 500;
          }

          .sort {
            .caret { // 列排序小按钮
              cursor: pointer;
              color: $color-white-6;
              transform: scale(.7);
              &.active {
                color: $light-blue
              }
              &.top{
                transform: scale(.7) rotate(180deg);
              }
            }
          }
        }
      }
    }
  }

  // 表单元
  td{
    position: relative;

    &:not(.vxe-body--expanded-column){ // not expand col
      &:hover .val-link + .copy, &:hover .val-json + .copy, &:hover .val-string + .copy{
        display: block;
      }
    }

    .val-tr {
      .val-edit{
        .nothing {
          color: #cdcdcd;
        }
      }

      .copy {
        position: absolute;
        top: 0;
        right: 0;
        cursor: pointer;
        color: $color-primary;
        display: none;
      }

      .val-string {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .val-json {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .val-link {
        color: $lighter-blue;
        text-decoration: underline;
        cursor: pointer;
      }

      .val-image {
        flex-wrap: wrap;
        overflow: auto;
        flex-direction: row;
        .el-image{
          margin-bottom: 2px;
          margin-top: 2px;
          border-radius: 4px;
          &:not(:last-of-type) {
            margin-right: 2px;
          }
        }
        img {
          cursor: zoom-in !important;
          max-height: 30px;
          display: block;
        }
      }

      .big-cell, .bigger-cell {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 99;
        display: flex;
        align-content: center;
        justify-content: center;
        transform: translate(-50%, -50%);
        transition: all .2s cubic-bezier(0.6, 0.04, 0.98, 0.34);

        &:hover {
          z-index: 100;
          background: #fff;
          transition: all .3s cubic-bezier(0.08, 0.82, 0.17, 1);
          box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
        }
      }

      .big-cell {
        &:hover {
          width: 194.17px;
          height: 120px;
        }
      }

      .bigger-cell {
        &:hover {
          width: 258.89px;
          height: 160px;
        }
      }
    }
    .val-self{
      overflow: hidden;
    }
  }

}

.json-wrap{
  max-width: 600px;
  max-height: 200px;
  overflow: auto;
  .jsoneditor {
    border-color: $border-white-1;
    border-radius: 4px;
    .ace-jsoneditor .ace_gutter{
      background-color: $bg-white-1;
      width: 20px !important;
      padding: 0;
    }
    .jsoneditor-statusbar{
      border-color: $border-white-1;
      background-color: $bg-white-2;
      color: $color-text-secondary;
      font-size: 13px;
    }
    .jsoneditor-preview {
      color: $color-text-primary;
      line-height: 1.2;
    }
  }
}

// 拖拽图标
.drag-icon{
  @include drag-icon(10px)
}

.space{
  &:before{
    content: '';
    width: 6px;
    height: .5px;
    display: inline-block;
    margin: 0 4px;
    background-color: $color-text-regular;
    vertical-align: middle;
  }
}

</style>
