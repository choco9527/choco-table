/* 参数化配置Vue实例 */
export function setOptions(Vue = null, options = null) {
  if (Vue && options) {
    const { getConfig = null, getData = null, submitForm = null, exportTable = null, searchOptions = null, elSize = 'mini', tableSize = 'small' } = options
    getConfig && (Vue.prototype.$cTableGetConfig = getConfig)
    getData && (Vue.prototype.$cTableGetList = getData)
    submitForm && (Vue.prototype.$cTableSubmit = submitForm)
    exportTable && (Vue.prototype.$cTableExport = exportTable)
    searchOptions && (Vue.prototype.$cTableSearchOptions = searchOptions)
    elSize && (Vue.prototype.$cTableElSize = elSize)
    tableSize && (Vue.prototype.$cTableTableSize = tableSize)
  }
}

/* 引入element */

import { Button, Select, Message, Tooltip, Loading, SkeletonItem, Checkbox, Dialog, Divider, Popconfirm, Option, Form, Row, Col, FormItem, Tabs, Switch, TabPane, Input, Popover, Image, Tag, DatePicker, Skeleton } from 'element-ui'
import '@/styles/theme/pure.css' // 引入自定义主题
import '@/icons' // icon

export function setElement(Vue = null) {
  if (Vue) {
    // Element
    Vue.use(Button)
    Vue.use(Select)
    Vue.use(Option)
    Vue.use(DatePicker)
    // Vue.component('c-el-date-picker', DatePicker) // 避免被覆盖
    Vue.use(Skeleton)
    Vue.use(SkeletonItem)
    Vue.use(Tooltip)
    Vue.use(Tabs)
    Vue.use(TabPane)
    Vue.use(Popover)
    Vue.use(Image)
    Vue.use(Tag)
    Vue.use(Dialog)
    Vue.use(Input)
    Vue.use(Switch)
    Vue.use(Form)
    Vue.use(FormItem)
    Vue.use(Row)
    Vue.use(Col)
    Vue.use(Popconfirm)
    Vue.use(Divider)
    Vue.use(Loading)
    Vue.use(Checkbox)

    const option = { customClass: 'choco-table-msg', duration: 3000 }
    const msgList = ['success', 'warning', 'info', 'error']

    Vue.prototype.$choco_msg = function(option) {
      return Message(option)
    }

    msgList.forEach(type => {
      Vue.prototype.$choco_msg[type] = function(msg) {
        return Message[type]({
          message: msg,
          ...option
        })
      }
    })
  }
}

import { Menu, Modal as VxeModal, Export, Button as VxeButton, Header, Footer, Checkbox as vxeCheckbox, CheckboxGroup, Tooltip as vxeTooltip } from 'vxe-table'
import 'xe-utils'
import 'vxe-table/lib/style.css'
const vxeComponents = [VxeModal, VxeButton, Menu, Export, Header, Footer, vxeCheckbox, CheckboxGroup, vxeTooltip]
export function setVxe(Vue = null) {
  if (Vue) {
    vxeComponents.forEach(com => {
      Vue.use(com)
    })
  }
}
