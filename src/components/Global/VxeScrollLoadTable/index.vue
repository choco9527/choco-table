<template>
  <div class="scroll-load-table" :table-id="tableId" :style="{height: height === 'auto' ? '100%' : 'auto'}">
    <pure-table
      v-if="showTable"
      ref="pureTable"
      v-loading="listLoading && data.length === 0"
      class="youmi-scroll-table"
      :data="data"
      auto-resize
      resizable
      :scroll-x="{enabled: false}"
      :scroll-y="{enabled:false}"
      :max-height="maxTbHeight"
      :height="height"
      :show-footer="showSummary"
      :footer-method="getSummaries"
      :menu-config="tableMenu"
      :export-config="exportConfig"
      header-row-class-name="vxe-custom-head"
      header-align="center"
      :row-class-name="rowClassName"
      footer-cell-class-name="vxe-custom-footer-cell"
      footer-row-class-name="vxe-custom-footer-row"
      :sort-config="sortConfig"
      :columns="columns"
      v-bind="$attrs"
      @toggle-row-expand="onRowExpand"
      @checkbox-all="selectAllEvent"
      @checkbox-change="handleSelectionChange"
      @menu-click="menuClick"
      @resizable-change="resizeCol"
      @sort-change="onSortColumn"
      @filter-change="filterChange"
      v-on="$listeners"
    />
    <div v-if="showNextPageTab && data.length > 0" class="next-page" @click="getNextPage">
      <i v-if="listLoading" class="el-icon-loading" style="color: #104466;font-weight: bold" />
      <i v-else class="el-icon-arrow-down" />
    </div>
    <div v-if="showTotal" class="total">
      <span>当前 {{ data.length }}</span>
      <el-divider direction="vertical" />
      <span>总计 {{ total }}</span>
      <el-divider direction="vertical" />
      Show:
      <el-select
        :value="listQuery.per_page_num"
        placeholder="请选择"
        class="w-75"
        :size="elSize"
        @change="handlePageChange"
      >
        <el-option v-for="item in pageOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
  </div>
</template>

<script>
import PureTable from './pure-table'
import { isEmpty, debounce, has } from 'xe-utils'
import VxeTableMixin from '../mixins/vxe-table-mixins'

export default {
  name: 'VxeScrollLoadTable',
  components: { PureTable },
  mixins: [VxeTableMixin],
  props: {
    tableId: { type: String, default: '' },
    columns: { type: Array, default() { return [] } },
    filterData: Function,
    listQuery: Object,
    requestMethod: Function,
    nestTables: {
      type: Array,
      default() {
        return null
      }
    },
    height: { type: [String, Number], default: 'auto' }, // 列表高度
    maxTbHeight: { type: [String, Number], default: 2000 }, // 列表最大定高，如果需要高度自适应则设置为100%
    // autoHeight: { type: Boolean, default: false }, // 列表高度自适应
    selectable: { type: Boolean, default: false }, // 是否可以多选 （若打开多选功能则不支持前端缓存加载）
    showTotal: { type: Boolean, default: true }, // 显示下方分页器
    showTableSummary: { type: Boolean, default: false }, // 显示合计
    showContextMenu: { type: Boolean, default: false }, // 挂载右键菜单
    selfCellFormats: { type: Object, default: null }, // 自定义合计单元格格式化方法 { key=> fn:Function }
    customHeight: { type: [Number, String], default: 0 }, // 自定义表格计算需要减去高度
    isPhone: { type: Boolean, default: false }, // 是否是移动端
    sortConfig: { type: Object, default: null }, // 排序配置
    stickyFooter: { type: Boolean, default: false }, // 是否合计行吸底
    elSize: { type: String, default: 'small' } // ui样式尺寸
  },
  data() {
    const pageOptions = [25, 50, 100, 200, 400].map(item => ({
      value: item,
      label: item
    }))
    this.allList = [] // 缓存所有数据列表
    this.expandList = []
    this.tableSelector = `.scroll-load-table[table-id="${this.tableId}"]`
    this.expandRowIds = []
    this.refName = 'pureTable'
    return {
      listLoading: false,
      pageOptions,
      data: [],
      total: 0,
      summary: null, // 合计
      showTable: true
      // tableHeight: '200px'
    }
  },
  computed: {
    showSummary() {
      return (!isEmpty(this.summary) && this.showTableSummary)
    },
    showNextPageTab() {
      return (this.total > (this.data.length + this.allList.length) && this.showTotal)
    }
  },
  mounted() {
    // 滚动加载下一页的数据
    this.bodyDom = document.querySelector(`${this.tableSelector} .vxe-table--body-wrapper`)
    const dom = this.bodyDom
    const scrollFn = () => { // 监听table滚动加载下一页
      if (!dom.scrollTop) return
      if ((dom.scrollHeight - ~~(dom.scrollTop + dom.clientHeight)) < 100) {
        // 如果next_page_token 不存在，则不加载下一页
        if ((this.data.length === 0 && this.allList.length === 0) || this.data.length === this.total) {
          return
        }
        this.getNextPage()
      }
      if (!this.selectable && 2 * ~~(dom.scrollTop + dom.clientHeight) > dom.scrollHeight && this.allList.length > 0) { // 从allList取出数据 (不可多选时支持)
        this.pushListData()
      }
    }
    const scrollFooterFn = () => { // 监听视图滚动锁定合计行
      if (this.judgeBottomAppear()) {
        this.removeFootersClass()
      } else {
        this.setFootersClass()
      }
    }

    // const resizeFn = () => this.setTableHeight() // 监听窗口改变table大小
    const resizeFooterFn = () => this.setFootersClass() // 监听窗口改变计算底部合计行

    this.$nextTick(() => {
      dom && dom.addEventListener('scroll', debounce(scrollFn, 300), false)
      // if (this.autoHeight) { // calc height auto when window resize
      //   setTimeout(() => resizeFn(), 1000)
      //   window.addEventListener('resize', debounce(resizeFn, 200))
      // } else {
      //   this.tableHeight = typeof this.maxTbHeight === 'string' ? this.maxTbHeight : this.maxTbHeight + 'px'
      // }

      if (this.stickyFooter) { // calc footer width when window resize
        window.addEventListener('resize', debounce(resizeFooterFn, 200))
        window.addEventListener('scroll', debounce(scrollFooterFn, 500))
      }
      // this.initSpin()
    })
    this.$init()
  },
  methods: {
    $init() {
      this.$emit('$vxeTableInit')
    },
    $reloadTable(cb = null) { // 使用vif 大型重载table
      this.showTable = false
      this.$nextTick(() => {
        this.showTable = true
        cb && cb()
      })
    },
    // setTableHeight() {
    //   const nav = 84
    //   const totalHeight = 40
    //   const filterEle = document.querySelector(`.global-filter[table-id="${this.tableId}"]`)
    //   const filterHeight = filterEle ? filterEle.clientHeight : 0
    //   const footerHeight = this.showTableSummary ? 50 : 20
    //   if (!this.isPhone) {
    //     this.tableHeight = window.innerHeight - nav - filterHeight - footerHeight - totalHeight - parseFloat(this.customHeight) + 'px'
    //   } else {
    //     this.tableHeight = '100%'
    //   }
    // },
    // 获取列表,因为滚动加载下一页基本结构一样

    async $getList(update = true) {
      this.listLoading = true
      // 对dimensions进行处理
      const params = this.filterData()
      try {
        const { data, cb = null } = await this.requestMethod(params) // 可接受callback函数
        if (!data) throw new Error('no data')
        let list = null
        let count = 0
        let next_page_token = null
        let summary = null
        let expandList = null

        list = data.list
        count = data.count
        next_page_token = data.next_page_token
        summary = data.summary && data.summary.r_d
        if (this.nestTables) expandList = data.$expandList

        if (!list || list.length === 0) {
          this.data = []
          this.total = 0
        } else {
          if (this.selectable) { // 多选不支持前端分批加载
            this.data = this.data.concat(list)
          } else {
            this.allList.push(...list)
            this.pushListData()
          }
          count && count >= 0 && (this.total = parseInt(count))
          summary && (this.summary = summary)
          expandList && (this.expandList = expandList)
        }
        this.listQuery.next_page_token = next_page_token
        this.loadData()
        this.handleInit()
        this.listLoading = false

        cb && cb()
        return Promise.resolve(true)
      } catch (error) {
        console.log('Vxe-scroll-table Error:', error.message || error)
        this.data = []
        this.total = 0
        this.summary = []
        this.listLoading = false
      }
    },

    getNextPage() {
      if (this.listQuery.next_page_token) {
        // console.log('next_page')
        this.$getList()
      }
    },
    pushListData() {
      this.data = this.data.concat(this.allList.splice(0, 100))
    },
    // 搜索
    async $search() {
      this.clearList()
      await this.$getList()
    },
    handlePageChange(value) {
      // console.log('handlePageChange')
      this.clearList()
      this.listQuery.per_page_num = value
      this.$getList()
    },
    clearList() {
      this.data = []
      this.listQuery.next_page_token = ''
      this.allList = []
    },
    refreshCustomCol() { // 重置列自定义属性
      this.getColumns().forEach(col => {
        console.log(col)
        if (!col.type || !col.fixed || !col.fix) col.fixed = ''
      })
    },
    handleInit() {
      if (this.$route.query.expandSearch === '0') {
        this.toggleRowExpand(this.data[this.$route.query.expandSearch])
      }
    },
    onRowExpand(params) {
      const { expanded, row } = params
      if (expanded) {
        this.expandRowIds.push(row._XID)
      } else {
        const index = this.expandRowIds.indexOf(row._XID)
        if (index >= 0) this.expandRowIds.splice(index, 1)
      }
    },
    selectAllEvent({ checked, records }) { // 全选
      this.$emit('handleSelectionChange', records)
      this.$emit('checkboxAll', checked, records)
    },
    handleSelectionChange({ checked, records }) { // 多选
      this.$emit('handleSelectionChange', records)
    },
    menuClick({ menu, row, column }) { // 菜单点击
      const { code } = menu
      if (code === 'selectAll') { // 全选/取消
        this.setAllCheckboxRow(true)
      }
      if (code === 'clearAll') {
        this.clearCheckboxRow()
      }
      this.handleColumn(row, column, code)
    },
    handleColumn(row, column, code) {
      if (!row && column) { // 头操作
        if (code === 'lockColLeft' && column.fixed !== 'left') {
          column.fixed = 'left'
        } else if (code === 'lockColRight' && column.fixed !== 'right') {
          column.fixed = 'right'
        } else if (code === 'cancelLockCol' && column.fixed) {
          column.fixed = ''
        }
        this.refreshColumn()
      }
    },
    resizeCol({ column }) { // 列宽改变
      const colId = column.id
      const colEle = document.querySelector(`[colid=${colId}]`)
      const width = colEle ? colEle.clientWidth : 0
      if (width) this.$emit('setWidthMap', column.property, width)
      this.setFootersStyle()
    },
    rowClassName({ row }) {
      if (row && this.expandRowIds.includes(row._XID)) {
        return 'vxe-custom-row active'
      }
      return 'vxe-custom-row'
    },
    getSummaries({ columns }) {
      // const col = !isEmpty(this.summary) ? columns.map(({ property }, i) => {
      //   let colEle = ''
      //   if (property && this.summary[property]) {
      //     colEle = this.summary[property].value
      //   }
      //   return i === 0 ? '合计' : colEle
      // }) : []
      const fn = () => {
        this.$nextTick(() => {
          if (!this.judgeBottomAppear()) {
            this.initStickyFooter()
          } else {
            this.removeFootersClass()
          }
        })
      }
      debounce(fn, 666)()
      return [['合计']]
    },
    initSpin() { // 加载自定义loading
      setTimeout(() => {
        const selector = `.el-loading-spinner`
        const spinner = document.querySelector(selector)

        if (spinner) {
          const ul = document.createElement('ul')
          const frag = document.createDocumentFragment()
          for (let i = 0; i < 9; i++) {
            const li = document.createElement('li')
            frag.appendChild(li)
          }
          ul.appendChild(frag)
          spinner.appendChild(ul)
        }
        console.log(spinner)
      }, 0)
    },
    onSortColumn({ column, property, order, sortBy, sortList, $event }) {
      this.$emit('onSortColumn', { column, property, order, sortBy, sortList, $event })
    },
    filterChange({ column, property, values, datas, filterList, $event }) {
      this.$emit('filterChange', { column, property, values, datas, filterList, $event })
    }
  }
}
</script>
<style lang="scss">
.youmi-scroll-table {
  transition: max-height .3s ease-in-out;

  .hideShadow {
    box-shadow: none;
  }
  .vxe-table--filter-wrapper{
    .vxe-table--filter-body{
      max-height: 200px !important;
    }
  }
}
</style>
<style scoped lang="scss">
@import "../assets/table-base";

.next-page {
  height: 20px;
  background: #fff;
  z-index: 10999;
  border-right: 1px solid #dfe6ec;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 10%);
  border-left: 1px solid #dfe6ec;
  cursor: pointer;
  transition: all .3s;
  text-align: center;

  &:hover {
    background-color: $bg-white-1;
  }

  i {
    transition: all .3s;
  }

  &:hover i {
    transform: translateY(3px);
  }
}

.total {
  //margin-top: 20px;
  font-size: var(--gutter_13-14,14px);
  line-height:var(--gutter_36-48,48px);
  font-weight: 400;
  color: $color-text-regular;
  text-align: left;
}

</style>
