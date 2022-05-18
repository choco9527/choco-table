import Vue from 'vue'
import App from './App.vue'

// import GloBalTable from './components/Global'
import GloBalTable from '@youmi/choco-table'
Vue.use(GloBalTable)

import Router from 'vue-router'
Vue.use(Router)

new Vue({
  el: '#app',
  render: h => h(App)
})
