// import global table
import GlobalTable from './global-table'
import RenderOptions from './RenderOptions/index'
import RenderPopup from './RenderPopup/index'

// Element
import ElementUI from 'element-ui'
import '@/styles/theme/pure.css' // 引入自定义主题
import '@/icons' // icon

// Vxe-Table
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import '@/styles/index.scss' // global css 顺序必须在组件引入之后，覆盖原本样式

import { setOptions } from '@/components/Global/setOptions'

export default {
  install(Vue, options = {}) {
    Vue.use(VXETable) // need import vxe-table
    Vue.use(ElementUI, { size: 'small' })

    setOptions(Vue, options)

    Vue.component('global-table', GlobalTable)
    Vue.component('render-options', RenderOptions)
    Vue.component('render-popup', RenderPopup)
  }
}
