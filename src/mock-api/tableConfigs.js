// table config格式示例

// 关于type类型请查看 Global/form-types.js

/* 筛选项filter数据示例*/
export const filters = [
  {
    key: 'date',
    label: '日期',
    option_type: 0,
    query_type: [4],
    tips: '日期',
    value_type: 4,
    view_type: 2,
    default: 'lastWeek',
    clearable: false
  },
  {
    key: 'status',
    label: '状态',
    option_token: 'test_token',
    option_type: 0,
    query_type: [0],
    // query_type: [2, 0],
    tips: '状态',
    value_type: 1,
    view_type: 1
    // default: [1],
  }, {
    key: 'name',
    label: '名称',
    option_type: 0,
    query_type: [5],
    tips: '输入应用名称',
    value_type: 0,
    view_type: 0,
    default: ''
  }, {
    key: 'cp_id',
    label: '应用id',
    option_type: 0,
    query_type: [0, 5],
    tips: '输入应用id',
    value_type: 0,
    view_type: 0,
    default: '',
    open: false
  }, {
    key: 'num',
    label: '数量',
    option_type: 0,
    query_type: [4],
    tips: '输入应用数量',
    value_type: 1,
    view_type: 0,
    collapse_default: true // 和open意思相反，控制相同，优先级比open低
  },
  {
    key: 'delete',
    label: '查看',
    option_token: '',
    option_type: 0,
    query_type: [0, 2],
    tips: '是否删除',
    value_type: 1,
    view_type: 1,
    clearable: true
  }
]

/* 列column数据示例*/
export const columns = [
  {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'cp_id',
    label: '应用id',
    sortable: false,
    tips: '应用id',
    noRender: true // noRender即表示不走table的rander function渲染逻辑，直接通过vxetable渲染，性能更好，但没有copy功能，且无法获取自定义单元格内容
  }, {
    column_type: 0,
    exportable: false,
    field_type: 4,
    view_type: 2,
    key: 'date',
    label: '日期',
    sortable: false,
    tips: '日期',
    noRender: false
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'name',
    label: '名称',
    sortable: false,
    tips: '应用名称'
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'platform',
    label: '系统',
    sortable: false,
    tips: '操作系统',
    noRender: true
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'bundle',
    label: '包名',
    sortable: false,
    tips: '包名',
    noRender: true
  }, {
    column_type: 1, // 指标
    exportable: false,
    field_type: 0,
    view_type: 6, // IMAGE
    key: 'images',
    label: '图片',
    sortable: false,
    tips: '示例图片'
  }, {
    column_type: 1,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'num',
    label: '数量',
    sortable: true,
    tips: '数量'
  }, {
    column_type: 1,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'text',
    label: '一个非常长的列名称一般不会这么长',
    sortable: false,
    tips: '用来测试'
  }, {
    column_type: 1,
    exportable: false,
    field_type: 0,
    view_type: 7,
    key: 'json',
    label: 'JSON配置',
    sortable: false,
    tips: 'JSON示例'
  }, {
    column_type: 1,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'keywords',
    label: '关键词',
    sortable: false,
    tips: '关键词'
  }
]

/* 控制编辑表单示例*/
export const formItems = [
  {
    'form': {
      'items': [ // 表单编辑项
        {
          'key': 'text',
          'label': '测试文字',
          'tips': '测试文字',
          'value_type': 0,
          'view_type': 0,
          'option_token': ''
        }, {
          'key': 'num',
          'label': '数量',
          'tips': '修改数量',
          'value_type': 0,
          'view_type': 0,
          'option_token': ''
        },
        {
          'key': 'json',
          'label': 'JSON配置',
          'tips': 'JSON配置 适用于闪挣',
          'value_type': 0,
          'view_type': 7,
          'option_token': ''
        }, {
          'key': 'json',
          'label': 'JSON配置',
          'tips': 'JSON配置 适用于闪挣',
          'value_type': 0,
          'view_type': 7,
          'option_token': ''
        }, {
          'key': 'json',
          'label': 'JSON配置',
          'tips': 'JSON配置 适用于闪挣',
          'value_type': 0,
          'view_type': 7,
          'option_token': ''
        }
      ],
      'title': '操作',
      'form_token': 'token',
      'tips': '操作',
      'submit_button_text': '保存'
    },
    'call_action_text': '编辑',
    'batch': false,
    'form_id': 'form_id'
  }
]

/* 小表格column数据示例*/
export const pureColumns = (that) => {
  return [
    { type: 'seq', visible: true, title: '#', width: 40 },
    { field: 'keyword', visible: true, title: '关键词', width: 100 },
    { field: 'date', visible: true, title: '投放时间', width: 150,
      render: (h, { row }) => {
        return <p>
          <span>{row.day}</span>
          <br/>
          <span>{row.start}</span> - <span>{row.end}</span>
        </p>
      }
    },
    { field: 'num', visible: true, title: '计划数量' },
    { field: 'status', visible: true, title: '状态',
      render: (h, { row }) => {
        return <span>{row.status ? '开启' : '关闭'}</span>
      }
    }
  ]
}
