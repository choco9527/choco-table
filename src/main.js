import Vue from 'vue'
import App from './App.vue'

// 本地免打包使用
import GloBalTable from './components/Global'

// 在线使用
// import GloBalTable from '@youmi/choco-table'
// import '@youmi/choco-table/dist/choco-table.css'

// 本地使用打包dist
// import GloBalTable from '/dist/choco-table.umd'
// import '/dist/choco-table.css'

Vue.use(GloBalTable)

import Router from 'vue-router'
Vue.use(Router)

new Vue({
  el: '#app',
  render: h => h(App)
})
