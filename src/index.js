// import global table
import GlobalTable from './components/Global/global-table'
import RenderOptions from './components/Global/RenderOptions/index'
import RenderPopup from './components/Global/RenderPopup/index'
import PureTable from './components/Global/VxeScrollLoadTable/pure-table'
import VxeScrollLoadTable from './components/Global/VxeScrollLoadTable'
import BeautyDialog from './components/BeautyDialog/index.js'

import { setOptions, setElement, setVxe } from './setOptions'

const components = {
  GlobalTable,
  RenderOptions,
  RenderPopup,
  BeautyDialog,
  PureTable,
  VxeScrollLoadTable
}

const install = function(Vue, options = {}) {
  setOptions(Vue, options)
  setElement(Vue)
  setVxe(Vue)

  Object.keys(components).forEach(key => {
    Vue.component(key, components[key])
  })
}

if (typeof window !== 'undefined' && window.Vue) {
  // 判断是否直接引入，如果是则可以跳过Vue.use()
  install(window.Vue)
}

import '@/styles/index.scss' // global css 顺序必须在组件引入之后，覆盖原本样式

const PACKAGES = {
  ...components,
  install // 直接注册
}

export default PACKAGES
