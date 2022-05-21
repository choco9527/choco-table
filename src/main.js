import Vue from 'vue'
import App from './App.vue'
import { getConfig, getList, searchPageOptions, exportTable, submitForm } from '@/mock-api/table'

// 本地免打包使用
import GlobalTable from './components/Global'

// 在线使用
// import GlobalTable from '@youmi/choco-table'
// import '@youmi/choco-table/lib/choco-table.css'

// 本地使用打包dist
// import GlobalTable from '/dist/lib/choco-table.umd.min'
// import '/dist/lib/choco-table.css'

/* 定义默认请求方法，（在非自定义组件方法时使用） */
const options = {
  getConfig, // 全局获取tableConfig方法
  getData: getList, // 全局获取tableData方法
  submitForm, // 提交表单
  searchOptions: searchPageOptions, // 搜索selectOption选项
  exportTable // 导出表格
}

Vue.use(GlobalTable, options) // 加载全局配置

import Router from 'vue-router'
Vue.use(Router)

new Vue({
  el: '#app',
  render: h => h(App)
})
