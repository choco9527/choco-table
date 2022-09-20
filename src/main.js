import Vue from 'vue'
import App from './App.vue'
import { getConfig, getList, searchPageOptions, exportTable, submitForm } from '@/mock-api/tableMethods'

// 本地免打包使用
import GlobalTable, { BeautyDialog } from './index'

// 本地使用打包lib
// import GlobalTable, { BeautyDialog } from '/lib/packages.umd.min'
// import '/lib/packages.css'

/* 定义默认请求方法，（在非自定义组件方法时使用） */
const options = {
  getConfig, // 全局获取tableConfig方法
  getData: getList, // 全局获取tableData方法
  submitForm, // 提交表单
  searchOptions: searchPageOptions, // 搜索selectOption选项
  exportTable, // 导出表格
  elSize: 'mini',
  tableSize: 'small'
}

Vue.component('BeautyDialog', BeautyDialog) // 全局注册 BeautyDialog
Vue.use(GlobalTable, options) // 挂载GlobalTable 加载全局配置

new Vue({
  el: '#app',
  render: h => h(App)
})
