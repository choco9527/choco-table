import { sleep } from '@/utils/tool'
import { filters, columns, mockData } from '@/utils/tableData'
import request from '@/utils/request'

export async function getConfig() {
  await sleep(300)
  return {
    config: {
      columns: columns,
      create_data_forms: null,
      edit_data_forms: null,
      nest_tables: null,
      table_title: '示例表格',
      filter_config: { filters }
    }
  }
}

export async function getList() {
  await sleep()
  return {
    data: {
      next_page_token: '',
      count: mockData.length,
      list: mockData
    }
  }
}

// 搜索options
export function searchPageOptions(params) {
  return request({
    url: 'api/globalTable/searchPageOptions',
    method: 'get',
    params
  })
}

// 导出表格
export function exportTable(params) {
  return request({
    url: 'api/globalTable/exportTable',
    method: 'get',
    params
  })
}

// 提交表单
export function submitForm(data) {
  return request({
    url: 'api/globalTable/submitForm',
    method: 'post',
    data
  })
}
