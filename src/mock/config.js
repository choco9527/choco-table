export const filters = [
  {
    key: 'campaignName',
    label: '名称',
    option_type: 0,
    query_type: [5],
    tips: '广告系列名称',
    value_type: 0,
    view_type: 0
  },
  {
    key: 'displayStatus',
    label: '状态',
    option_type: 0,
    query_type: [2],
    tips: '筛选广告系列状态',
    value_type: 0,
    view_type: 1
  }, {
    key: 'deleted',
    label: '查看',
    option_type: 0,
    query_type: [2],
    tips: '是否被移除',
    value_type: 0,
    view_type: 1,
    open: false
  }, {
    key: 'totalBudget',
    label: '预算',
    option_type: 0,
    query_type: [4, 0],
    tips: '预算',
    value_type: 2,
    view_type: 0,
    open: false
  },
  {
    key: 'dailyBudget',
    label: '日预算',
    option_type: 0,
    query_type: [4, 0],
    tips: '日预算',
    value_type: 2,
    view_type: 0,
    open: false
  },
  ...dimensionFilters
];

export const columns = [
  {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'campaignName',
    label: '广告系列名称',
    sortable: false,
    tips: '广告系列名称',
    fixed: 'left'
  }, {
    column_type: 0,
    exportable: false,
    field_type: 1,
    view_type: 0,
    key: 'campaignId',
    label: '广告系列ID',
    sortable: true,
    tips: '广告系列ID',
    noRender: true
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'displayStatus',
    label: '状态',
    sortable: false,
    tips: '展示状态',
    fixed: 'left'
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'countriesOrRegions',
    label: '国家或地区',
    sortable: false,
    tips: '国家或地区',
    noRender: true
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'app',
    label: 'app名称',
    sortable: false,
    tips: 'app名称',
    noRender: true
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'supplySources',
    label: '广告展示位置',
    sortable: false,
    tips: '广告展示位置',
    noRender: true
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'totalBudget',
    label: '预算',
    sortable: true,
    tips: '总预算'
  }, {
    column_type: 0,
    exportable: false,
    field_type: 0,
    view_type: 0,
    key: 'dailyBudget',
    label: '日预算',
    sortable: true,
    tips: '每日预算上限，至少是0.01且不能超过预算'
  },
  {
    column_type: 1,
    exportable: false,
    field_type: 1,
    view_type: 0,
    key: 'avgCPM',
    label: '平均每千次展示费用',
    sortable: true,
    tips: '在 App Store 上进行一千次广告展示所支付金额的平均值。',
    noRender: true
  },
];
