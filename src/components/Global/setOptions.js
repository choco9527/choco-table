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
