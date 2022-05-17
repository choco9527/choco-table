// import global table
import GlobalTable from './global-table'
import RenderOptions from './RenderOptions/index'
import RenderPopup from './RenderPopup/index'
import ElementUI from 'element-ui'
import '@/styles/theme/pure.css' // 引入自定义主题
import '@/icons' // icon

// Vxe-Table
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

export default {
  install(Vue, options = {}) {
    Vue.use(VXETable) // need import vxe-table

    Vue.use(ElementUI, { size: 'small' })

    Vue.component('global-table', GlobalTable)
    Vue.component('render-options', RenderOptions)
    Vue.component('render-popup', RenderPopup)
  }
}
