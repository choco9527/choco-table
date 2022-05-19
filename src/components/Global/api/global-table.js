import request from '@/utils/request'
import { promiseRetry } from '@/utils/tool'

// 获取全局表格配置
export function getTableConfig(params) {
  return promiseRetry({
    fn: request,
    times: 0,
    delay: 500,
    args: {
      url: this.$cTableGetConfigUrl || 'api/globalTable/getTableConfig',
      method: 'get',
      params
    }
  })
}

// 获取全局表格列表
export function getTableList(data) {
  return request({
    url: this.$cTableGetListUrl || 'api/globalTable/getTableList',
    method: 'post',
    data
  })
}

// 搜索options
export function searchPageOptions(params) {
  return request({
    url: this.$cTableSearchOptionsUrl || 'api/globalTable/searchPageOptions',
    method: 'get',
    params
  })
}

// 导出表格
export function exportTable(params) {
  return request({
    url: this.$cTableExportUrl || 'api/globalTable/exportTable',
    method: 'get',
    params
  })
}

// 提交表单
export function submitForm(data) {
  return request({
    url: this.$cTableSubmitFormUrl || 'api/globalTable/submitForm',
    method: 'post',
    data
  })
}
