// 关于VXE Table的配置及方法
import StickyFooterMixin from './sticky-footer-mixin'

export default {
  mixins: [StickyFooterMixin],
  data() {
    return {
      tableMenu: { // 右键菜单
        header: {
          options: [[{ name: '列左锁定', code: 'lockColLeft' }, { name: '列右锁定', code: 'lockColRight' }, {
            name: '取消锁定',
            code: 'cancelLockCol'
          }]]
        },
        body: {
          options: [
            this.selectable ? [{ name: '全选', code: 'selectAll' }, { name: '取消全选', code: 'clearAll' }] : []
          ]
        }
      },
      exportConfig: {
        modes: ['current', 'selected']
      }
    }
  },
  methods: {
    getColumns() {
      return this.$refs[this.refName].getColumns()
    },
    reloadColumn(columns) {
      this.$refs[this.refName].reloadColumn(columns)
    },
    async refreshColumn() {
      // await this.$broadcast('refreshColumn') // 向下传递刷新组件
      await this.$refs[this.refName].refreshColumn()
      this.initStickyFooter()
    },
    clearCheckboxRow() {
      this.$refs[this.refName].clearCheckboxRow()
    },
    toggleRowSelection(row, selected) {
      this.$refs[this.refName].toggleRowSelection(row, selected)
    },
    toggleRowExpand(row) {
      this.$refs[this.refName].toggleRowExpand(row)
    },
    setAllCheckboxRow(val) {
      this.$refs[this.refName].setAllCheckboxRow(val)
    },
    toggleCheckboxRow(row, expanded) {
      this.$refs[this.refName].toggleCheckboxRow(row, expanded)
    },
    setCurrentRow(row) {
      this.$refs[this.refName].setCurrentRow(row)
    },
    clearSelected() {
      this.$refs[this.refName].clearSelected()
    },
    clearFilter(columnKey) {
      this.$refs[this.refName].clearFilter(columnKey)
    },
    openExport() {
      this.$refs[this.refName].openExport()
    },
    async loadData() {
      this.$refs[this.refName] && await this.$refs[this.refName].loadData(this.data)
    },
    async reloadData() {
      this.$refs[this.refName] && await this.$refs[this.refName].reloadData(this.data)
      console.log('reloadData')
    }
  }
}
