// import global table
import GlobalTable from './global-table'
import RenderOptions from './RenderOptions/index'
import RenderPopup from './RenderPopup/index'

// Vxe-Table
import 'xe-utils'
import VXETable from 'vxe-table'
import 'vxe-table/lib/style.css'

export default {
  install(Vue, options = {}) {
    Vue.use(VXETable) // need import vxe-table

    // const { jsonEdit = false } = options
    //
    // if (jsonEdit) { // import json edit plugin
    //   import('v-json-edit').then(VJsonEdit => {
    //     Vue.use(VJsonEdit)
    //   })
    // }
    Vue.component('global-table', GlobalTable)
    Vue.component('render-options', RenderOptions)
    Vue.component('render-popup', RenderPopup)
  }
}
