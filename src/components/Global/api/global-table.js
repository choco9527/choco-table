// 获取全局表格配置
export function getTableConfig(params, vm) {
  if (vm && vm.$cTableGetConfig) {
    return vm.$cTableGetConfig(params)
  } else {
    throw new Error('未指定全局table get config方法')
  }
}

// 获取全局表格列表
export function getTableList(data, vm) {
  if (vm && vm.$cTableGetList) {
    return vm.$cTableGetList(data)
  } else {
    throw new Error('未指定全局table get list方法')
  }
}

// 导出表格
export function exportTable(params, vm) {
  if (vm && vm.$cTableExport) {
    return vm.$cTableExport(params)
  } else {
    throw new Error('未指定全局table export方法')
  }
}

// 提交表单
export function submitForm(data, vm) {
  if (vm && vm.$cTableSubmit) {
    return vm.$cTableSubmit(data)
  } else {
    throw new Error('未指定全局table form submit方法')
  }
}

// 搜索options
export function searchPageOptions(params, vm) {
  if (vm && vm.$cTableSearchOptions) {
    return vm.$cTableSearchOptions(params)
  } else {
    throw new Error('未指定全局table搜索select options方法')
  }
}
