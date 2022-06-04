import { data } from './orionData'
// 关于type类型请查看 Global/form-types.js

/* filter示例*/
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
    query_type: [2, 0],
    tips: '状态',
    value_type: 1,
    view_type: 1,
    default: [1],
    clearable: true
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

/* column示例*/
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
    noRender: true
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
    // noRender: true
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
    sortable: false,
    tips: '数量',
    noRender: true
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

/* mockData 示例*/
export const mockData = (function() {
  return data.map(item => {
    const { r_d } = item
    /* 示例图片类型*/
    const imgs = [
      { resize_url: item.icon/* 缩略图*/, url: item.icon/* 大图*/ },
      { resize_url: item.icon, url: item.icon },
      { resize_url: item.icon, url: item.icon },
      { resize_url: item.icon, url: item.icon }
    ]

    /* 示例日期类型*/
    const date = { value: Date.now(), source_value: Date.now() }

    return {
      ...item,
      r_d: {
        ...r_d,
        date,
        images: { value: JSON.stringify(imgs), source_value: JSON.stringify(imgs) }
      },
      num: item.cp_id + parseInt(Math.random() * 100 + '')
    }
  })
}())

export const mockSummary = (function() {
  const r_d = {
    num: { key: 'num', value: 0 }
  }
  mockData.forEach(data => {
    r_d.num.value += data.num
  })
  return { r_d }
}())

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

export const pureData = [
  { keyword: '词语1', num: 18, day: '2022-05-30', start: '00:00', end: '23:59', status: true },
  { keyword: '词语2', num: 88, day: '2022-11-30', start: '00:00', end: '23:59', status: false },
  { keyword: '词语3', num: 555, day: '2022-12-12', start: '00:00', end: '23:59', status: false }
]
