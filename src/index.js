// import global table
// 全局组件
import GlobalTable from './components/Global/global-table'
import RenderOptions from './components/Global/RenderOptions/index'
import RenderPopup from './components/Global/RenderPopup/index'

// 局部组件
import PureTable from './components/Global/VxeScrollLoadTable/pure-table'
import VxeScrollLoadTable from './components/Global/VxeScrollLoadTable'
import BeautyDialog from './components/BeautyDialog'
import CColSet from './components/ColSet'

// 局部方法

import { setOptions, setElement, setVxe } from './setOptions'

const components = { // 需要全局注册的组件
  GlobalTable,
  RenderOptions,
  RenderPopup
}

const install = function(Vue, options = {}) {
  setOptions(Vue, options)
  setElement(Vue, options)
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

const Table = {
  install // 直接注册
}

export { // 导出局部组件
  BeautyDialog,
  PureTable,
  VxeScrollLoadTable,
  CColSet
}

export default Table

