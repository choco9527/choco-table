// import global table
import GlobalTable from './global-table'
import RenderOptions from './RenderOptions/index'
import RenderPopup from './RenderPopup/index'
import BeautyDialog from '@/components/BeautyDialog/index'

// Vxe-Table
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

import { setOptions, setElement } from './setOptions'

const install = function(Vue, options = {}) {
  Vue.use(VXETable) // need import vxe-table

  setOptions(Vue, options)
  setElement(Vue)

  Vue.component('BeautyDialog', BeautyDialog)
  Vue.component('GlobalTable', GlobalTable)
  Vue.component('RenderOptions', RenderOptions)
  Vue.component('RenderPopup', RenderPopup)
}

if (typeof window !== 'undefined' && window.Vue) {
  // 判断是否直接引入，如果是则可以跳过Vue.use()
  install(window.Vue)
}

import '@/styles/index.scss' // global css 顺序必须在组件引入之后，覆盖原本样式

export default {
  install
}
