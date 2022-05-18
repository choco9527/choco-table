import { Button, Select, Tooltip, Loading, SkeletonItem, Checkbox, Dialog, Divider, Popconfirm, Option, Form, Row, Col, FormItem, Tabs, Switch, TabPane, Input, Popover, Image, Tag, DatePicker, Skeleton } from 'element-ui'
import '@/styles/theme/pure.css' // 引入自定义主题
import '@/icons' // icon

/* 参数化配置Vue实例 */
export function setOptions(Vue = null, options = null) {
  if (Vue && options) {
    const { getConfigUrl = '', getListUrl = '', submitFormUrl = '', exportUrl = '' } = options
    getConfigUrl && (Vue.prototype.$cTableGetConfigUrl = getConfigUrl)
    getListUrl && (Vue.prototype.$cTableGetListUrl = getListUrl)
    submitFormUrl && (Vue.prototype.$cTableSubmitFormUrl = submitFormUrl)
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
  }
}
