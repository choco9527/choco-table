import { sleep } from '@/utils/tool'
import { filters, columns, mockData, mockSummary } from '@/utils/tableData'
import request from '@/utils/request'

export async function getConfig() {
  await sleep(100)
  const res = {
    config: {
      columns: columns,
      create_data_forms: null,
      edit_data_forms: null,
      nest_tables: null,
      table_title: '示例表格',
      filter_config: { filters }
    }
  }
  console.log('mock config请求结果:', res)
  return res
}

export async function getList(params) {
  console.log('mock list请求参数:', params)
  await sleep(300)

  const res = {
    data: {
      next_page_token: '',
      count: mockData.length,
      list: mockData,
      summary: mockSummary
    }
  }
  console.log('mock list请求结果:', res)
  return res
}

// 搜索options
export async function searchPageOptions(params) {
  console.log('mock options请求参数:', params)
  await sleep(100)
  return {
    list: {
      options: [
        {
          label: '开启',
          value: '1'
        },
        {
          label: '关闭',
          value: '0'
        },
        {
          label: '过期',
          value: '2'
        }
      ],
      next_page_token: '' // 如果有下一页可使用token
    }
  }
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
