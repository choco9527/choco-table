import request from '@/utils/request'
import { promiseRetry } from '@/utils/tool'

// 获取全局表格配置
export function getTableConfig(params, vm) {
  try {
    return request({
      url: vm.$cTableGetConfigUrl || 'api/globalTable/getTableConfig',
      method: 'get',
      params
    })
  } catch (e) {
    console.log(e)
  }
}

// 获取全局表格列表
export function getTableList(data, vm) {
  return request({
    url: vm.$cTableGetListUrl || 'api/globalTable/getTableList',
    method: 'post',
    data
  })
}

// 搜索options
export function searchPageOptions(params, vm) {
  return request({
    url: vm.$cTableSearchOptionsUrl || 'api/globalTable/searchPageOptions',
    method: 'get',
    params
  })
}

// 导出表格
export function exportTable(params, vm) {
  return request({
    url: vm.$cTableExportUrl || 'api/globalTable/exportTable',
    method: 'get',
    params
  })
}

// 提交表单
export function submitForm(data, vm) {
  return request({
    url: vm.$cTableSubmitFormUrl || 'api/globalTable/submitForm',
    method: 'post',
    data
  })
}
