// 通过列配置构建列组件
import { objectEach, has, isEmpty } from 'xe-utils'
import { filterType, JT } from '../form-types'
import ClipboardJS from 'clipboard'
import dayjs from '@/utils/dayjs'
import { isJson } from '@/utils/tools'

export default {
  data() {
    Object.assign(this, filterType)
    return {
      clipBoard: null
    }
  },
  computed: {
    colAlignMap() {
      const res = {}
      const map = { ...this.colConfigMap }
      objectEach(map, (item, key) => {
        res[key] = item.align || 'center'
      })
      return res
    },
    colWidthMap() {
      const res = {}
      const map = { ...this.colConfigMap }
      objectEach(map, (item, key) => {
        res[key] = item.width || ''
      })
      return res
    },
    colMinWidthMap() {
      const res = {}
      const map = { ...this.colConfigMap }
      objectEach(map, (item, key) => {
        res[key] = item.minWidth || ''
      })
      return res
    },
    colFixMap() {
      const res = {}
      const map = { ...this.colConfigMap }
      objectEach(map, (item, key) => {
        res[key] = item.fix || item.fixed || ''
      })
      return res
    },
    columns() { /* 由于列定义比较复杂，因此使用computed单独抽出*/
      try {
        const columns = []
        if (this.showEditRow() && this.columnsConfig.every(fig => fig.key !== '$edit')) {
          this.columnsConfig.push({ key: '$edit', open: true, label: '操作', tips: '操作', width: this.colWidthMap['$edit'] || '', minWidth: this.colMinWidthMap['$edit'] || 120 })
        }
        this.columnsConfig.forEach(config => {
          const mv = JT.$getType(config.view_type, 'viewType') // 控制列的展示形式
          const configKey = config.key
          if (config.noFormat) { // 不格式化，直接按照vxetable格式接入pure-table中
            columns.push(config)
          } else {
            const item = {
              width: config.width || '',
              minWidth: config.minWidth || 80,
              field: configKey,
              align: this.colAlignMap[configKey] || 'center',
              title: config.label,
              sortable: false,
              visible: config.open,
              fixed: (config.fixed || ''),
              className: config.className,
              showOverflow: this.showOverflow,
              renderHeader: this.renderHeader(config),
              render: this.renderRow(config, mv),
              renderFooter: this.useSlotFooter ? this.renderFooter(mv) : false,
              noRender: config.noRender || false
            }
            columns.push(item)
          }
        })

        /* 展开行 */
        const showExpand = ((this.nestTables && this.nestTables.length > 0) + '') === 'true'
        if (showExpand) {
          const item = {
            type: 'expand',
            width: 40,
            resizable: false,
            fixed: this.colFixMap['expand'],
            renderContent: this.renderExpandContent()
          }
          columns.unshift(item)
        }

        /* 序列 */
        if (this.showIndex) {
          const item = { type: 'seq', visible: true, width: 50, title: '#', resizable: false, fixed: this.colFixMap['seq'] }
          columns.unshift(item)
        }

        /* 多选 */
        if (this.selectable) {
          columns.unshift({ type: 'checkbox', visible: true, width: 40, resizable: false, fixed: this.colFixMap['checkbox'] })
        }
        return columns
      } catch (e) {
        console.log('columns Error:', e)
      }
    }
  },
  mounted() {
    const vm = this
    this.clipBoard = new ClipboardJS(`.val-tr>.copy[tId="${vm.tId}"]`, { // 事件委派创建拷贝
      text(trigger) {
        const val = trigger.getAttribute('copy-data')
        vm.$choco_msg.success('已拷贝至剪切板')
        return val || ''
      }
    })
  },
  beforeDestroy() {
    this.clipBoard && this.clipBoard.destroy()
  },
  methods: {
    renderHeader(config) { // 渲染普通row的header
      return (h, { _columnIndex }) => {
        const sortType = this.sortColumn && this.sortColumn.key === config.key && this.sortColumn.sort_type
        const sortEl = config.sortable ? (<div class='sort ml-2 flex column a-center j-center'>
          <svg-icon onClick={() => this.onSortColumn(config.key, sortType === 0 ? null : 'asc')}
            icon-class='sort' class={`top mb--2 fs-12 caret ${sortType === 0 ? 'active' : ''}`}/>
          <svg-icon onClick={() => this.onSortColumn(config.key, sortType === 1 ? null : 'desc')}
            icon-class='sort' class={` fs-12 caret ${sortType === 1 ? 'active' : ''}`}/>
        </div>) : ''
        return (<div class='val-th _w-100 flex j-center a-center f-left'>
          <el-tooltip popper-class='table-head-tips' effect='light' open-delay={300} content={config.tips} placement='top' transition='el-zoom-in-top'>
            <span class='label t-left'>{config.label}</span>
          </el-tooltip>
          {sortEl}
        </div>)
      }
    },
    renderFooter(mv) { // 渲染表尾合计行
      const icon = <i class='el-icon-minus'/>

      return (h, { column, columnIndex }) => {
        if (!this.showIndex && columnIndex === 0) return (<span>合计</span>)
        const configKey = column.property
        if (!this.$refs[this.scrollTableName]) return
        const row = this.$refs[this.scrollTableName].summary
        const item = row[configKey]
        let ele = (<span class='nothing'>{icon}</span>)
        if (!!this.selfCellFormats && has(this.selfCellFormats, configKey) && item) { // 自定义单元格渲染
          ele = this.formatSelfCol(configKey, row, null, icon, item)
        } else if (this.hasItemVal(item)) {
          ele = this.formatValCol(mv, item.value)
        }
        const trStyle = { textAlign: this.colAlignMap[configKey] || 'center' }
        return (<div class='val-tr _w-100' style={trStyle}>{ele}</div>)
      }
    },
    renderRow(config, mv) { // 渲染row内容
      const configKey = config.key
      const icon = <i class='el-icon-minus'/>

      return (h, { row, rowIndex, _columnIndex }) => {
        try {
          let ele = (<span class='nothing'>{icon}</span>)
          let copyEl = ''

          const item = row.r_d && row.r_d[configKey]
          if (!!this.selfCellFormats && has(this.selfCellFormats, configKey)) { // 自定义单元格渲染
            ele = this.formatSelfCol(configKey, row, rowIndex, icon, item)
          } else if (this.hasItemVal(item)) {
            ele = this.formatValCol(mv, item.value)
          } else if (configKey === '$edit') { // 支持编辑操作行，可通过selfCellFormats拦截并自定义
            ele = this.formatEditCol(mv, row, rowIndex, _columnIndex)
          }
          if (item && !mv('image')) {
            copyEl = <i class='copy el-icon-copy-document' tId={this.tId} copy-data={item.value}/>
          }

          // const trStyle = { textAlign: this.colAlignMap[configKey] || 'center' }
          return (<div class='val-tr _w-100'>{ele}{copyEl}</div>)
        } catch (e) {
          console.log('row render error', e)
        }
      }
    },
    renderExpandContent() { // 渲染展开行内容 -> 嵌套表格
      return (h, { row }) => {
        if (this.nestTables) {
          const tabs = []
          this.nestTables.forEach((tab, $i) => {
            const nestViewId = tab.table_view_id
            const n_d = row?.n_d // 嵌套表格数据
            const nest_view_filter_data_token = n_d[nestViewId]

            const tabConfig = { pageNum: 25, tableToken: tab.table_token, tableId: nestViewId, nestViewFilterDataToken: nest_view_filter_data_token }
            const propTableForm = { createDataForms: tab.create_data_forms, editDataForms: tab.edit_data_forms, deleteDataForm: tab.delete_data_form }

            const tabEl = (<el-tab-pane key={tab.table_token} label={tab.table_title} name={$i + ''} lazy>
              <global-table
                ref='tabTable'
                showIndex={this.showIndex}
                max-tb-height={400}
                from-nest
                config={tabConfig}
                propNestTables={tab.nest_tables}
                colConfigMap={this.colConfigMap}
                selfCellFormats={this.selfCellFormats}
                propColumns={tab.columns}
                propSortColumn={tab.sort_column}
                propFilters={tab.filter_config.filters}
                propTableForm={propTableForm} />
            </el-tab-pane>)
            tabs.push(tabEl)
          })
          const tabsEle = (<el-tabs value='0' type='border-card'>{tabs}</el-tabs>)
          return (<div class='expand-table'>{tabsEle}</div>)
        }
        return ''
      }
    },
    hasItemVal(item) {
      return item && item.value !== undefined && item.value !== null && item.value !== ''
    },
    formatValCol(mv, val) { // 处理元素显示类型 通过mv->view_type控制
      let el = ''
      if (mv('normal')) { // 普通类型
        el = this.getTableNormalEl(val)
      } else if (mv('json')) { // json类型
        el = this.getTableJsonEl(val)
      } else if (mv('link')) { // 链接类型
        el = this.getTableLinkEl(val)
      } else if (mv('image')) { // 图片类型
        el = this.getTableImageEl(val)
      } else if (mv('date')) { // 日期类型
        el = this.getTableDateEl(val)
      } else if (mv('time')) { // 时间类型
        el = this.getTableDateEl(val, 'time')
      }
      return el
    },
    formatEditCol(mv, row, rowIndex, _columnIndex) { // 处理编辑列渲染
      const editEleList = []
      if (!isEmpty(row.e_d)) { // show edit button
        this.editDataForms.forEach(formConfig => {
          const formId = formConfig.form_id
          if (has(row.e_d, formId)) {
            let editEle = ''
            editEle = (<el-button type='text' size='mini' onClick={() => this.handleEditRow([row], formConfig)}>{formConfig.call_action_text}</el-button>)
            editEleList.push(editEle)
          }
        })
      }
      let deleteEle = ''
      if (!isEmpty(this.deleteDataForm)) { // show delete button
        const handleConfirm = () => this.handleDeleteRow([row])
        const popEl = (<render-popup handleConfirm={handleConfirm} popup-title={'确定' + this.deleteDataForm.form.title + '?'}/>)
        deleteEle = row.allowDelete ? popEl : ''
      }
      return (<div class='val-edit flex j-between'>{editEleList} {deleteEle}</div>)
    },
    formatSelfCol(key, row, rowIndex, icon, item) { // 处理自定义列渲染
      const fn = this.selfCellFormats[key]
      return <p class='val-self'>{fn({ item, row: row.r_d, rowIndex, h, pk: row.pk }) || icon}</p>
    },
    getTableNormalEl(val) {
      return <span class='val-string' title={val}>{val}</span>
    },
    getTableJsonEl(val) {
      const jsonVal = JSON.parse(val)
      return <el-popover trigger='click'>
        <div class='json-wrap'>
          <v-json-edit mainMenuBar={false} lang='zh-CN' mode='preview' v-model={jsonVal}/>
        </div>
        <div slot='reference' class='val-json cur-pointer'>{val}</div>
      </el-popover>
    },
    getTableLinkEl(val) {
      return val ? <a title={val} class='val-link' href={val} target='_blank'>下载链接</a> : ''
    },
    isTimeStamp(val) {
      const int = parseInt(val)
      if (isNaN(int) || (int + '').length < 11) {
        return false
      } else {
        return int
      }
    },
    getTableDateEl(val, type = 'date') {
      let int = this.isTimeStamp(val)

      if (!int) { // 不处理非时间戳类型
        return val
      } else {
        if ((int + '').length === 11) {
          int *= 1000
        }
        const format = type === 'date' ? 'YYYY-MM-DD' : 'YYYY-MM-DD hh:mm'
        const date = dayjs(int).format(format)
        return this.getTableNormalEl(date)
      }
    },
    getTableImageEl(val) {
      let url = ''; let urlList = []
      if (isJson(val)) {
        urlList = JSON.parse(val) // 完整图urlList
      } else if (typeof val === 'string') {
        url = val
        urlList = [{ url, resize_url: url }]
      }
      const imgList = urlList.map(item => {
        return (<el-image src={item.resize_url} fit='contain' preview-src-list={urlList.map(v => v.url)}/>)
      })
      return <div class='val-image _w-100 h-40 lh-40 flex j-start a-center'>{imgList}</div>
    }
  }
}
