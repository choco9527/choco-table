import { Button, Select, Message, Tooltip, Loading, SkeletonItem, Checkbox, Dialog, Divider, Popconfirm, Option, Form, Row, Col, FormItem, Tabs, Switch, TabPane, Input, Popover, Image, Tag, DatePicker, Skeleton } from 'element-ui'
import '@/styles/theme/pure.css' // 引入自定义主题
import '@/icons' // icon

/* 参数化配置Vue实例 */
export function setOptions(Vue = null, options = null) {
  if (Vue && options) {
    const { getConfigUrl = '', getListUrl = '', submitFormUrl = '', searchOptionsUrl = '', exportUrl = '' } = options
    getConfigUrl && (Vue.prototype.$cTableGetConfigUrl = getConfigUrl)
    getListUrl && (Vue.prototype.$cTableGetListUrl = getListUrl)
    submitFormUrl && (Vue.prototype.$cTableSubmitFormUrl = submitFormUrl)
    searchOptionsUrl && (Vue.prototype.$cTableSearchOptionsUrl = searchOptionsUrl)
    exportUrl && (Vue.prototype.$cTableExportUrl = exportUrl)
  }
}

/* 引入element */
export function setElement(Vue = null) {
  if (Vue) {
    // Element
    Vue.use(Button)
    Vue.use(Select)
    Vue.use(Option)
    Vue.use(DatePicker)
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

    msgList.forEach(type => {
      if (!Vue.prototype.$choco_msg) Vue.prototype.$choco_msg = {}
      Vue.prototype.$choco_msg[type] = function(msg) {
        return Message[type]({
          message: msg,
          ...option
        })
      }
    })
  }
}
