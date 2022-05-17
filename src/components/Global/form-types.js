import dayjs from '@/utils/dayjs'
export const filterType = {
  // (必须)决定了表单是如何显示的
  viewType: {
    NORMAL: 0, // 普通,原始值
    OPTIONS: 1, // 下拉列表
    DATE: 2, // 时间选择，精确到日期即可
    TIME: 3, // 时间选择，精确到具体时间
    MULTILINE_TEXT: 4, // 多行文本(长文本)，使用\n换行
    CURRENCY_RMB: 5, // 人民币(元),值的value_type为int，显示时转换为￥1.3元这样的格式，
    IMAGE: 6, // 图片格式
    JSON: 7, // JSON格式
    LINK: 8, // LINK格式
    RICH_TEXT: 9 // 富文本格式（比较特殊，需全局引入富文本插件）
  },
  /* (必须)值类型,决定值最终存储的类型 */
  valueType: {
    STRING: 0, // 字符串
    INT: 1, // 整数
    FLOAT: 2, // 浮点数
    BOOL: 3, // 布尔数
    TIMESTAMP: 4 // 时间戳，单位为秒
  },
  /*
  *   (必须)查询类型，决定了值如何匹配
  * 这里返回的是数组，若超过1个，则用户具有多个选择的权利。
  * 如query_type为IN和NOT_IN，则用户可以选择白名单或黑名单。
  * */
  queryType: {
    EQUAL: 0, // 等于
    NOT_EQUAL: 1, // 不等于
    IN: 2, // 多值匹配，类似于sql中的where in (?)，返回的值必须
    NOT_IN: 3, // 多值匹配反选，类似于sql中的where not in (?)
    RANGE: 4, // 范围匹配,开始和结束值
    MATCH: 5 // 模糊匹配
  }
}

export const columnType = {
  /* 值类型*/
  columnType: {
    Dimension: 0, // 维度,一般是字符串
    Measure: 1 // 指标,偏数据
  }
}

const JudgeType = class { /* 类型判断 */
  constructor() {
    this.filters = []
    this.filterMaps = {}
  }

  /* 筛选项判断 */

  /* 通用类型转换*/
  $toType(typeVal) { /* 将值按valueType储存类型转换 */
    class ToType {
      constructor(typeVal) {
        const val = parseInt(typeVal)
        this.typeVal = !isNaN(val) ? val : -1
      }
      init() {
        return this.format.bind(this)
      }
      format(value) { // param 需要转化的值
        if (this.typeVal === -1) return ''
        switch (this.typeVal) {
          case filterType.valueType.STRING:
            // if (Object.prototype.toString.call(value) === '[object Date]') {
            //   return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
            // }
            return (value + '').trim()
          case filterType.valueType.INT:
            return isNaN(parseInt(value)) ? undefined : parseInt(value) // 无意义不置0，0是有意义的
          case filterType.valueType.FLOAT:
            return isNaN(parseFloat(value)) ? undefined : parseFloat(value) // 无意义不置0，0是有意义的
          case filterType.valueType.BOOL:
            if (value === 'true') return true
            if (value === 'false') return false
            return Boolean(value)
          case filterType.valueType.TIMESTAMP:
            return dayjs(value).unix()
        }
      }
    }
    return new ToType(typeVal).init()
  }

  /* 通用的类型名判断 */
  $getType(typeVal, typeName) {
    class Match {
      constructor(typeVal, typeName) {
        const val = parseInt(typeVal)
        this.typeVal = !isNaN(val) ? val : -1
        this.typeName = typeName || ''
      }
      init() {
        return this.match.bind(this)
      }
      match(key = '') {
        if (!key || typeof key !== 'string' || this.typeVal === -1 || !this.typeName) return false
        key = key.toUpperCase()
        if (this.typeName === 'columnType') {
          return columnType[this.typeName][key] === this.typeVal
        } else {
          return filterType[this.typeName][key] === this.typeVal
        }
      }
    }
    return new Match(typeVal, typeName).init()
  }

  /* queryType*/
  getQueryTypeName(queryType) {
    switch (queryType) {
      case filterType.queryType.EQUAL:
        return '完全匹配输入值'
      case filterType.queryType.NOT_EQUAL:
        return '排除输入值'
      case filterType.queryType.IN:
        return '在输入的多个值中匹配'
      case filterType.queryType.NOT_IN:
        return '排除输入的多个值'
      case filterType.queryType.RANGE:
        return '范围匹配输入值'
      case filterType.queryType.MATCH:
        return '模糊匹配输入值'
    }
  }
  /* queryType*/

  /* ******* 列判断 ********* */

  /* columnType */
  //
  // isString(value_type) {
  //   return value_type === columnType.columnValueType.STRING
  // }
  // isHtml(value_type) {
  //   return value_type === columnType.columnValueType.HTML
  // }
  // isImage(value_type) {
  //   return value_type === columnType.columnValueType.IMAGE
  // }

  /* columnType*/
}

export const JT = new JudgeType()

