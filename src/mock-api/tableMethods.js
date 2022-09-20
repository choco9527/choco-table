// table请求示例
import { sleep } from '@/utils/tools'
import { filters, columns, formItems } from '@/mock-api/tableConfigs'
import { mockData, mockSummary } from '@/mock-api/tableDatas'

export async function getConfig() {
  await sleep(100)
  const nestConfig = {
    columns: columns,
    create_data_forms: null,
    edit_data_forms: null,
    nest_tables: null,
    table_title: '嵌套表格',
    table_token: 'nest_token',
    table_view_id: 'NEST_TABLE_ID',
    filter_config: { }
  }
  const res = {
    config: {
      columns: columns,
      create_data_forms: null,
      edit_data_forms: formItems, // 设置为 'allow' 可使用自定义编辑列 key = $edit
      nest_tables: [nestConfig], // 嵌套表格
      table_title: '主表格',
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

const postConfig = {
  method: 'POST', // *GET, POST, PUT, DELETE, etc.
  mode: 'cors', // no-cors, *cors, same-origin
  headers: {
    'Content-Type': 'application/json'
  }
}

// 导出表格
export function exportTable(params) {
  return fetch('api/globalTable/exportTable', postConfig)
}

// 提交表单
export function submitForm(data) {
  return fetch('api/globalTable/submitForm', postConfig)
}
