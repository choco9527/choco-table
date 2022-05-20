<template>
  <div v-if="nothingWrong" class="choco-table">
    <global-filter
      ref="pageFilter"
      v-bind="$attrs"
      :show-setting="showSetting"
      :config-id="config.tableId"
      :table-id="tId"
      :selectable="selectable"
      :delete-data-form="deleteDataForm"
      :from-nest="fromNest"
      :is-phone="isPhone"
      :el-size="elSize"
      :show-filter="showFilter"
      @search="search"
      @handleSetCols="handleSetCols"
      @onOpenExport="onOpenExport"
      @sortListByArr="sortListByArr"
      @resetForm="fresh"
      @resetTableHeight="resetTableHeight"
      @handleDeleteRow="handleDeleteRow"
    >
      <template v-slot:filterMore>
        <slot name="filterMore" :filterConfig="filterConfig" />
      </template>
      <template v-slot:filterBack>
        <template v-if="allowAddForm && createDataForms && createDataForms.length>0">
          <div class="batch">
            <el-button v-for="formConf in createDataForms" :key="formConf.form_id" type="primary" class="batch-item btn" :size="elSize" @click="addForm(formConf)">{{ formConf.call_action_text }}</el-button>
          </div>
        </template>
        <slot name="filterBack" :filterConfig="filterConfig" />
      </template>
      <template v-slot:tableArea>
        <slot name="tableFront" :filterConfig="filterConfig" />
        <vxe-scroll-load-table
          :ref="scrollTableName"
          :size="tableSize"
          :el-size="elSize"
          v-bind="$attrs"
          :table-id="tId"
          :columns="columns"
          :filter-data="filterMethod"
          :list-query.sync="listQuery"
          :request-method="requestMethod"
          :selectable="selectable"
          :nest-tables="nestTables"
          :self-cell-formats="selfCellFormats"
          :stripe="false"
          :is-phone="isPhone"
          fit
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
    <global-export v-if="showExport" ref="pageExporter" @pageExport="pageExport" />
    <beauty-dialog
      :title="formDialogTitle"
      :width="dialogConfig.width"
      :top="dialogConfig.top"
      :visible.sync="showFormDialog"
      :destroy="true"
    >
      <global-form ref="globalForm" :height="dialogConfig.height" :config-id="config.tableId" :dialog-size="dialogSize" v-bind="$attrs" />
      <div slot="footer">
        <el-button :size="elSize" type="primary" @click="submitForm('edit')">{{ submitText }}</el-button>
        <el-button :size="elSize" @click="closeForm">取消</el-button>
      </div>
    </beauty-dialog>
  </div>
</template>

<script>
import { getTableConfig, getTableList, exportTable } from './api/global-table'
import { submitForm } from './api/global-table'

import VxeScrollLoadTable from './VxeScrollLoadTable'
import GlobalFilter from './global-filter'
import GlobalExport from './global-export'
import tableFilterMixin from './mixins/table-filter-mixins'
import tableColMixin from './mixins/table-clo-mixins'
import { JT } from './form-types'
import { isDevicePhone } from './assets/js/tools'

import GlobalForm from './global-form'

import { isEmpty, clone } from 'xe-utils'

/*
  全局的表格渲染组件 筛选项已经列均由后端控制 后经过vxeTableMixin处理
  详见 https://conf.umlife.net/pages/viewpage.action?pageId=94019810
  表格设计 详见 https://conf.umlife.net/pages/viewpage.action?pageId=94018047
*/
export default {
  name: 'GlobalTable',
  components: { GlobalFilter, GlobalExport, GlobalForm, VxeScrollLoadTable },
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
    selfCellFormats: { type: Object, default: null }, // 自定义单元格格式化方法 { key=> fn:Function }
    selfFilters: { type: Array, default: () => ([]) }, // 自定义filter 不渲染此filter
    showIndex: { type: Boolean, default: false }, // 显示表格序号
    colConfigMap: { type: Object, default: () => ({}) }, // 列属性 { key: { align:'right', width: 120, fix: 'left'} }
    tableSize: { type: String, default: 'medium' }, // 表格尺寸
    extraQuery: { type: Object, default: null }, // 额外的自定义筛选项，最终会被拼接在请求参数中
    allowAddForm: { type: Boolean, default: true }, // 是否显示添加表格按钮
    dialogSize: { type: String, default: '' }, // 编辑窗口大小
    showOverflow: { type: [Boolean, String], default: 'ellipsis' },

    /* filter */
    showFilter: { type: Boolean, default: true }, // 显示表格顶部筛选项
    showExport: { type: Boolean, default: false }, // 显示导出键
    showSetting: { type: Boolean, default: true }, // 是否显示表格设置（列排序等按钮）
    elSize: { type: String, default: 'small' }, // ui样式尺寸
    // selfOptions: { type: Object, default: () => ({}) }, // 自定义options { key=> options:[] }
    // showSettingExport: { type: Boolean, default: true }, // 是否显示前端导出按钮

    /* scroll */
    selectable: { type: Boolean, default: false } // 是否可以多选
    // maxTbHeight: { type: String, default: 2000 }, // 列表最大定高
    // showTotal: { type: Boolean, default: true }, // 显示下方分页器
    // showTableSummary: { type: Boolean, default: false }, // 显示合计
    // showContextMenu: { type: Boolean, default: false }, // 显示右键菜单
    // showMenuEdit: { type: Boolean, default: true }, // 显示右键编辑
    // customHeight: { type: Number, default: 0 } // 自定义表格计算需要减去高度
    // autoHeight: { type: Boolean, default: false }, // 列表高度自适应
    // stickyFooter: { type: Boolean, default: false } // 是否合计行吸底

  },
  data() {
    this.filterConfig = [] // 筛选项配置
    this.createDataForms = []
    this.editDataForms = []
    this.deleteDataForm = {}
    this.filters = [] // 筛选项
    this.tId = (Math.random() * Date.now()).toString(32) // 前端自定义id
    this.requestMethod = this.selfGetList ? this.selfGetList : getTableList
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
      widthMap: JSON.parse(localStorage.getItem(widthKey)) || {}, // 列宽
      selectedValues: [], // 选择的行元素
      isPhone: false
    }
  },
  computed: {
    dialogConfig() {
      // dialog顶部+底部 = 88px
      return this.dialogSize === 'max'
        ? { width: '100vw', top: '0px', height: 'calc( 100vh - 88px )' }
        : { width: '600px', top: '10vh', height: '500px' }
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
    this.isPhone = isDevicePhone()
  },
  methods: {
    fresh() { // 硬刷新
      const setTable = () => {
        this.sortColumn = null
        setTimeout(() => {
          this.$refs[this.scrollTableName].$reloadTable(() => {
            this.search()
          })
          this.$choco_msg.success('重置成功')
        })
      }
      this.widthMap = {}
      localStorage.removeItem(this.widthKey)
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
        console.log(resData)
        if (!resData) throw new Error('获取配置失败')
        const { config: remoteConfig } = resData
        if (!remoteConfig) return Promise.reject('获取配置失败')
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
      filters = clone(filters, true)
      if (!this.$refs['pageFilter']) return
      this.$refs['pageFilter'].getFilterConfig(filters)
      this.$refs['pageFilter'].freshSearch(filters)
    },
    initColumnConfig(columns) { // 初始化【列】定义
      if (!columns) return
      columns = clone(columns, true)
      let cols = columns
      let allOpen = true
      if (this.showSetting) {
        cols = this.$refs['pageFilter'] ? this.$refs['pageFilter'].getColumns(columns) : []
        allOpen = false
      }
      this.columnsConfig = this.initCols(cols, allOpen)
      return columns
    },
    initTableForms(c, e, d) { // 初始化表单
      this.createDataForms = c ? clone(c, true) : null
      this.editDataForms = e ? clone(e, true) : null
      this.deleteDataForm = d ? clone(d, true) : null
    },
    initNestTable(propNestTables) { // 初始化行展开
      this.nestTables = clone(propNestTables, true)
    },
    initSortColumn(sortColumn) { // 初始化【列】排序
      if (!sortColumn) return
      const column = this.columnsConfig.find(col => col.key === sortColumn.key)
      if (column && column.open) {
        this.sortColumn = clone(sortColumn, true)
      }
    },
    initCols(cols, allOpen = true) { // 初始化【列】属性
      return cols.map(col => {
        col.width = this.widthMap[col.key] || ''
        col.className = col.className || ''
        col.fixed = this.isPhone ? '' : col.fixed || '' // 不对移动端固定
        if (allOpen) col.open = true
        return col
      })
    },
    pageExport() { // 导出
      const exportQuery = this.filterMethod(true)
      exportTable(exportQuery, this).then(res => {
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
        const { value, ...res } = firstRow.r_d[item.key]
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
    sortListByArr(list, order, key = 'key') { // 直接排序list https://blog.csdn.net/u010622874/article/details/90712604
      const newOrder = order.map(val => ({ key: val.key, open: val.open }))
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
        a.open = newOrder[iA] ? newOrder[iA].open : true
        b.open = newOrder[iA] ? newOrder[iB].open : true
        return iA - iB
      })
    },
    handleSetCols(columns) { // 自定义列
      try {
        if (!columns || isEmpty(columns)) return
        this.$choco_msg.success('设置成功')
        this.sortListByArr(this.columnsConfig, columns)
        setTimeout(async() => {
          this.$refs[this.scrollTableName].$reloadTable(() => {
            this.search()
          })
          // await this.$refs[this.scrollTableName].refreshColumn()
        })
      } catch (e) {
        console.log(e)
      }
    },
    setWidthMap(prop = '', width = '') { // 设置列宽
      this.widthMap[prop] = width
      localStorage.setItem(this.widthKey, JSON.stringify(this.widthMap))
      // this.$choco_msg.success('已记录当前列宽')
    },

    onOpenExport() {
      this.$refs[this.scrollTableName].openExport()
    },
    resetTableHeight() {
      this.$refs[this.scrollTableName].setTableHeight()
    },
    getData() {
      return this.$refs[this.scrollTableName].data
    }

  }
}
</script>

<style lang="scss">
@import "./assets/table-base";
.choco-table {
  padding: 0;

  .svg-wrap {
    vertical-align: text-bottom;
    display: inline-block;
    line-height: 1.5;
  }

  input {
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
          width: 100%;
          float: left;
          display: flex;
          justify-content: center;
          align-items: center;

          .label {
            color: $color-text-primary;
            line-height: 1;
            text-align: left;
            font-weight: 500;
          }

          .sort {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin-left: 2px;

            .caret {
              font-size: 12px;
              cursor: pointer;
              color: $color-white-6;
              transform:  scale(.7);
              &.active {
                color: $light-blue
              }
              &.top{
                transform: scale(.7) rotate(180deg);
                margin-bottom: -2px;
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
    //font-size: 14px;

    &:not(.vxe-body--expanded-column){ // not expand col
      &:hover .val-link + .copy, &:hover .val-json + .copy, &:hover .val-string + .copy{
        display: block;
      }
    }

    .val-tr {
      width: 100%;
      .val-edit{
        display: flex;
        justify-content: space-around;
        .edit-btn,.del-btn{
          border-radius: 5px;
          border-color: $color-primary-light-4;

        }
        .edit-btn {
          background-color: $color-primary;
          color: #fff;
          font-size: var(--gutter_13-14);
          line-height: 14px;
          letter-spacing: 1px;
          padding: 4px 12px;
        }

        .del-btn {
          font-size: 16px;
          padding: 6px;
          color: $color-primary;
        }

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
        width: 100%;
        height: 40px;
        display: flex;
        flex-wrap: wrap;
        overflow: auto;
        justify-content: flex-start;
        align-items: flex-start;
        flex-direction: row;

        img {
          cursor: zoom-in !important;
          max-height: 36px;
          margin-bottom: 1px;
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

  p {
    margin: 0;
  }

  .footer-btn {
    margin-left: 16px;
    border-radius: 1px;
    transition: .2s all ease-in-out;
  }
}

.json-wrap{
  .jsoneditor{
    height: 400px;
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
