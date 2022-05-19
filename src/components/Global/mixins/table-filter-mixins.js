// 筛选项处理为上传数据
import { objectEach, isEmpty } from 'xe-utils'
import { JT } from '../form-types'
import dayjs from '@/utils/dayjs'

export default {
  methods: {
    /*
    * 上传参数处理
    * */
    filterMethod(isExport = false) { /* searchData -> filters */
      try {
        if (this.listQuery.next_page_token && !isExport) return { next_page_token: this.listQuery.next_page_token } // 次页非导出直接传token
        const cloneQuery = this.$refs['pageFilter'] ? this.$refs['pageFilter']._getSearchQuery() : []
        // const q = cloneQuery ? cloneQuery.filter(v => v.open) : []
        const filters = []
        cloneQuery.forEach(filter => {
          const mv = JT.$getType(filter.view_type, 'viewType') // match viewType
          const mq = JT.$getType(filter.selectQueryType, 'queryType') // match queryType
          const format = JT.$toType(filter.value_type)

          /* 决定了值的内容类型*/
          const terms = mq('RANGE') ? null : this.handleTermVal(mv, filter, format)
          const ranges = mq('RANGE') ? this.handleRangeVal(mv, filter, format) : null
          if (!!terms || !!ranges) {
            filters.push({
              key: filter.key,
              query_type: filter.selectQueryType,
              option_type: filter.option_type,
              view_type: filter.view_type,
              value_type: filter.value_type,
              terms,
              ranges })
          }
        })
        if (!isEmpty(this.extraQuery)) {
          objectEach(this.extraQuery, (item, key) => {
            filters.push({ key, terms: [item], query_type: [5], option_type: 0, value_type: 0, view_type: 0 })
          })
        }
        const columns = isExport ? this.columnsConfig.filter(c => c.exportable) : this.columnsConfig.filter(c => c.open)
        const { tableId, nestViewFilterDataToken } = this.config

        return { /* 输出搜索参数 searchQuery */
          fromNest: this.fromNest,
          tableId,
          tableToken: this.tableToken,
          nestViewFilterDataToken,
          per_page_num: this.listQuery.per_page_num,
          columns,
          sortColumn: this.sortColumn,
          next_page_token: this.listQuery.next_page_token,
          filters
        }
      } catch (e) {
        console.log('Error: filterMethod', e)
      }
    },
    hasVal(val) { // 值不等于 '' undefined null
      return val !== '' && val !== undefined && val !== null
    },
    handleTermVal(mv, filter, format) { /* 处理term值*/
      const terms = []

      const mq = JT.$getType(filter.selectQueryType, 'queryType') // match queryType

      if (mv('NORMAL') && this.hasVal(filter.value)) { /* 普通*/
        if (equal(mq)) { // 完全
          terms.push(format(filter.value))
        } else if (similar(mq)) { // 不完全
          const valList = filter.value.trim().split(/；|;|,|，/)
          valList.forEach(val => terms.push(format(val)))
        }
      } else if (mv('OPTIONS') && this.hasVal(filter.value)) { // 下拉
        if (equal(mq)) { // 完全
          terms.push(format(filter.value))
        } else if (similar(mq)) { // 不完全
          if (Object.prototype.toString.call(filter.value) === '[object Array]') {
            terms.push(...filter.value)
          }
        }
      } else if (mv('CURRENCY_RMB') && this.hasVal(filter.value)) { // 人民币
        const rate = 100
        if (equal(mq)) { // 完全
          terms.push(format(filter.value) * rate)
        } else if (similar(mq)) { // 不完全
          const valList = filter.value.trim().split(' ')
          valList.forEach(val => terms.push(format(val) ? format(val) * rate : ''))
        }
      }
      if (terms.length > 0) return terms

      function equal(mq) {
        return (mq('EQUAL') || mq('eed') || mq('MATCH'))
      }
      function similar(mq) {
        return (mq('IN') || mq('NOT_IN'))
      }
      return null
    },

    handleRangeVal(mv, filter, format) { /* 处理range值类型*/
      let ranges = null
      let canPost = false
      if (filter.value) {
        let a = ''; let b = ''
        if (mv('NORMAL')) {
          const { start, end } = filter.value
          a = start
          b = end
          if (a || b) canPost = true
        } else if (mv('CURRENCY_RMB')) {
          const { start, end } = filter.value
          a = start ? start * 100 : start
          b = end ? end * 100 : ''
          if (a || b) canPost = true
        } else if (mv('TIME') || mv('DATE')) { /* 时间 日期 值*/
          const [start, end] = filter.value
          const valueV = JT.$getType(filter.value_type, 'valueType') // match valueType
          if (valueV('STRING')) { // 针对字符串格式时间处理
            a = start ? mv('TIME') ? dayjs(start).format('YYYY-MM-DD HH:mm:ss') : dayjs(start).format('YYYY-MM-DD') : ''
            b = end ? mv('TIME') ? dayjs(end).format('YYYY-MM-DD HH:mm:ss') : dayjs(end).format('YYYY-MM-DD') : ''
          } else {
            a = start
            b = end
          }
          if (a && b) canPost = true
        }
        if (canPost) {
          ranges = {
            start: format(a),
            end: format(b),
            contain_start: filter.config.contain_start,
            contain_end: filter.config.contain_end
          }
        }
      }

      return ranges
    }
  }
}
