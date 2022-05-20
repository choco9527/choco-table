import Vue from 'vue'
import App from './App.vue'

// 本地免打包使用
import GlobalTable from './components/Global'

// 在线使用
// import GlobalTable from '@youmi/choco-table'
// import '@youmi/choco-table/lib/choco-table.css'

// 本地使用打包dist
// import GlobalTable from '/dist/lib/choco-table.umd.min'
// import '/dist/lib/choco-table.css'

/* 定义默认请求方法路径，如不使用自定义方法则会向该路径发起请求 */
const config = {
  getConfigUrl: process.env.VUE_APP_BASE_API + '/api/admin/globalTable/getTableConfig', // 获取tableConfig
  getListUrl: process.env.VUE_APP_BASE_API + '/api/admin/globalTable/getTableList', // 获取tableData
  submitFormUrl: process.env.VUE_APP_BASE_API + '/api/admin/globalTable/submitForm', // 提交表单
  searchOptionsUrl: process.env.VUE_APP_BASE_API + '/api/admin/globalTable/searchPageOptions', // 搜索selectOption选项
  exportUrl: process.env.VUE_APP_BASE_API + '/api/admin/globalTable/exportTable' // 导出表格
}

Vue.use(GlobalTable, config) // 加载全局配置

import Router from 'vue-router'
Vue.use(Router)

new Vue({
  el: '#app',
  render: h => h(App)
})
