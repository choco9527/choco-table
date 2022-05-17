import Vue from 'vue'
import App from './App.vue'

import GloBalTable from './components/Global'
Vue.use(GloBalTable)

new Vue({
  el: '#app',
  render: h => h(App)
})
