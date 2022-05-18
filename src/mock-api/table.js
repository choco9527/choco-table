import { sleep } from '@/utils/tool'
import { filters, columns, mockData } from '@/utils/tableData'

export async function getConfig() {
  await sleep(300)
  return {
    columns: columns,
    create_data_forms: null,
    edit_data_forms: null,
    nest_tables: null,
    table_title: '示例表格',
    filter_config: { filters }
  }
}

export async function getList() {
  await sleep()
  return {
    next_page_token: '',
    count: mockData.length,
    list: mockData
  }
}
