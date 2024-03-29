<template>
  <div
    class="scroll-load-table"
    :table-id="tableId"
    :style="{height: autoHeight ? tableBodyHeight : 'auto'}"
  >
    <section :class="{nest:fromNest}" :style="{height: autoHeight && showTotal ? 'calc(100% - 40px)' : 'auto',overflowY: 'auto'}">
      <pure-table
        v-if="showTable"
        ref="pureTable"
        v-loading="listLoading && data.length === 0"
        class="youmi-scroll-table"
        :data="data"
        resizable
        :scroll-x="{enabled: false}"
        :scroll-y="{enabled:false}"
        :height="autoHeight ? 'auto' : height"
        :max-height="maxTbHeight"
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
    </section>
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
import { isEmpty, debounce } from 'xe-utils'
import VxeTableMixin from '../mixins/vxe-table-mixins'
const highLineMap = { blue: 1, success: 2, warning: 3, danger: 4 }

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
    fromNest: { type: Boolean, default: false }, // 是否来自嵌套表格（子表格）
    autoHeight: { type: Boolean, default: true }, // true则铺满父容器，false由内容撑开
    height: { type: [String, Number], default: 'auto' }, // 列表高度
    maxTbHeight: { type: [String, Number], default: 2000 }, // 列表最大定高，如果需要高度自适应则设置为100%
    selectable: { type: Boolean, default: false }, // 是否可以多选 （若打开多选功能则不支持前端缓存加载）
    showTotal: { type: Boolean, default: true }, // 显示下方分页器
    showTableSummary: { type: Boolean, default: false }, // 显示合计
    selfCellFormats: { type: Object, default: null }, // 自定义合计单元格格式化方法 { key=> fn:Function }
    customHeight: { type: [Number, String], default: 0 }, // 自定义表格计算需要减去高度
    sortConfig: { type: Object, default: null }, // 排序配置
    elSize: { type: String, default: 'small' }, // ui样式尺寸
    pages: { type: Array, default: () => [25, 50, 100, 200] } // 分页
    // stickyFooter: { type: Boolean, default: false }, // 是否合计行吸底
    // scrollSelector: { type: String, default: '' } // 指定需要作为滚动监测的包裹元素，默认为window
  },
  data() {
    this.allList = [] // 缓存所有数据列表
    this.expandList = []
    this.tableSelector = `.scroll-load-table[table-id="${this.tableId}"]`
    this.refName = 'pureTable'

    return {
      listLoading: false,
      data: [],
      total: 0,
      summary: null, // 合计
      showTable: true,
      tableBodyHeight: 'auto',
      highLineRows: { blue: [] } // {blue: [], } // 按颜色标记
    }
  },
  computed: {
    pageOptions() {
      return this.pages.map(item => ({
        value: item,
        label: item
      }))
    },
    showSummary() {
      return (!isEmpty(this.summary) && this.showTableSummary)
    },
    showNextPageTab() {
      return (this.total > (this.data.length + this.allList.length) && this.showTotal)
    }
  },
  mounted() {
    this.$init()
  },
  methods: {
    $init() {
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

      const resizeFn = () => this.setTableHeight() // 监听窗口改变table大小

      this.$nextTick(() => {
        dom && dom.addEventListener('scroll', debounce(scrollFn, 300), false)
        if (this.autoHeight) { // calc height auto when window resize,铺满父容器
          setTimeout(() => resizeFn(), 1000)
          window.addEventListener('resize', debounce(resizeFn, 200))
        }
      })
      this.$emit('$vxeTableInit')
    },
    $reloadTable(cb = null) { // 使用vif 大型重载table
      const that = this
      that.showTable = false
      that.$nextTick(_ => {
        that.showTable = true
        afterReload()
      })
      function afterReload() { // 重载后重新初始化并回调
        that.$nextTick(_ => {
          that.$init()
          cb && cb()
        })
      }
    },
    setTableHeight() {
      try {
        const ele = document.querySelector(`.choco-filter[table-id="${this.tableId}"]`)
        const filterEle = ele ? ele.querySelector(`section.filter-sections`) : null
        const filterBackEle = ele ? ele.querySelector(`section.filter-back`) : null

        const filterHeight = filterEle?.clientHeight ?? 0
        const filterBackHeight = filterBackEle?.clientHeight ?? 0

        const elseHeight = filterHeight + filterBackHeight + parseFloat(this.customHeight) + 'px'
        this.tableBodyHeight = `calc( 100% - ${elseHeight} )`
      } catch (e) {
        console.log('setTableHeight Error:', e)
      }
    },

    // 获取列表,因为滚动加载下一页基本结构一样
    async $getList(update = true) {
      this.listLoading = true
      // 对dimensions进行处理
      const params = this.filterData()
      try {
        const { data, cb = null } = await this.requestMethod(params, this) // 可接受callback函数
        if (!data) throw new Error('no data')
        let list = null
        let count = 0
        let next_page_token = null
        let summary = null
        let expandList = null

        list = data.list
        count = data.count
        next_page_token = data.next_page_token
        summary = data.summary?.r_d
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
          if (summary && !isEmpty(summary)) this.summary = summary
          expandList && (this.expandList = expandList)
        }
        this.listQuery.next_page_token = next_page_token
        await this.loadData()
        this.handleInit()
        this.listLoading = false

        cb && cb()
        return Promise.resolve(true)
      } catch (error) {
        console.log('Vxe-scroll-table Error:', error.message || error)
        this.data = []
        this.total = 0
        this.summary = null
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
        // console.log(col)
        if (!col.type || !col.fixed || !col.fix) col.fixed = ''
      })
    },
    handleInit() {
      if (this.$route?.query?.expandSearch === '0') {
        this.toggleRowExpand(this.data[this.$route.query.expandSearch])
      }
    },
    onRowExpand(params) {
      const { expanded, row } = params
      const key = row._XID || row._X_ROW_KEY // 兼容_XID
      if (expanded) {
        this.highLineRows['blue'].push(key) // 展开行使用蓝色标记
      } else {
        const index = this.highLineRows['blue'].indexOf(key)
        if (index >= 0) this.highLineRows['blue'].splice(index, 1)
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
    async handleColumn(row, column, code) {
      if (!row && column) { // 头操作
        if (code === 'lockColLeft' && column.fixed !== 'left') {
          column.fixed = 'left'
        } else if (code === 'lockColRight' && column.fixed !== 'right') {
          column.fixed = 'right'
        } else if (code === 'cancelLockCol' && column.fixed) {
          column.fixed = ''
        }
        await this.refreshColumn()
        this.initStickyFooter()
      }
    },
    resizeCol({ column }) { // 列宽改变
      const colId = column.id
      const colEle = document.querySelector(`[colid=${colId}]`)
      const width = colEle?.clientWidth
      if (width) this.$emit('setWidthMap', column.property, width)
      this.changeFooterFn()
    },
    rowClassName({ row }) {
      const key = row._XID || row._X_ROW_KEY
      let className = 'vxe-custom-row'
      Object.keys(this.highLineRows).forEach(color => {
        if (this.highLineRows[color].includes(key)) {
          className = `vxe-custom-row active-${highLineMap[color]}`
        }
      })
      return className
    },
    getSummaries({ columns }) {
      try {
        const col = !isEmpty(this.summary) ? columns?.map(({ property, type, ...args }, i) => {
          let colEle = ''

          if (i === 0) return '合计'
          if (['seq', 'checkbox', 'radio', 'expand', 'html'].includes(type)) {
            return colEle
          }
          if (property) {
            colEle = this.summary[property]?.value ?? ''
          }
          return colEle
        }) : []
        const fn = () => {
          this.$nextTick(() => {
            this.initStickyFooter()
          })
        }
        debounce(fn, 666)()
        return [col]
      } catch (e) {
        console.log('getSummaries Error: ', e)
        return []
      }
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

section.nest::-webkit-scrollbar{
  display: none;
}

</style>
