import { has, isEmpty, clone } from 'xe-utils'
import { JT } from '@/components/Global/form-types'
import dayjs from '@/utils/dayjs'

export default {
  data() {
    return {
      cacheSearchQuery: []
    }
  },
  computed: {
    queryTags() { // 搜索参数已选标签
      const tags = []
      if (this.cacheSearchQuery) {
        this.cacheSearchQuery.forEach(query => {
          if (!!query.value && !isEmpty(query.value)) {
            const mv = JT.$getType(query.view_type, 'viewType') // match viewType
            const mq = JT.$getType(query.query_type, 'queryType') // match queryType
            const val = query.value
            const tag = {
              key: query.key,
              label: query.label,
              clearable: query.clearable
            }
            const _push = () => tags.push(tag)
            const _set = v => tag.value = v
            if (mv('TIME') || mv('DATE')) {
              const [start, end] = val
              if (start && end) {
                const _get = day => dayjs(day).format(this.getPickerConfig(query.view_type).format)
                const s = _get(start)
                const e = _get(end)
                _set(s === e ? s : `${_get(s)} ~ ${_get(e)}`)
                _push()
              }
            } else if (mv('NORMAL') || mv('CURRENCY_RMB')) { // 普通值 or RMB
              if (mq('RANGE')) {
                const { start, end } = val
                if (start || end) {
                  if (start && end) {
                    _set(`${start} ~ ${end}`)
                  } else if (start) {
                    _set(`大于${start}`)
                  } else if (end) {
                    _set(`小于${end}`)
                  }
                  _push()
                }
              } else {
                _set(val)
                _push()
              }
            } else if (mv('OPTIONS')) {
              if (mq('IN')) { // 多选
                const labels = query.options.filter(opt => val.includes(opt.key))
                _set(labels.map(l => l.label).join(','))
              } else {
                const label = query.options.find(opt => opt.key === val)
                _set(label && label.label)
              }
              _push()
            }
          }
        })
      }
      return tags
    }

  },
  methods: {
    clearAllQuery() { // 清空所有筛选
      this.freshSearch()
      this.search()
    },
    clearQuery(key) { // 清空指定筛选
      const saveFilters = localStorage.getItem(this.filterKey) ? JSON.parse(localStorage.getItem(this.filterKey)) : undefined

      this.searchQuery.forEach((filter, $i) => {
        if (filter.key === key) {
          let value = ''
          const saveFilter = saveFilters && saveFilters.find(f => f.key === filter.key)
          const mv = JT.$getType(filter.view_type, 'viewType') // match viewType
          const defaultSelectQueryType = saveFilter ? saveFilter.defaultSelectQueryType : ''
          const queryType = typeof defaultSelectQueryType === 'number' ? defaultSelectQueryType : filter.query_type[0]

          const mq = JT.$getType(queryType, 'queryType') // match queryType
          if (mv('TIME') || mv('DATE')) { // 时间/日期
            value = []
          } else if (mv('OPTIONS')) { // 单选
            value = mq('IN') ? [] : ''
          } else if (mv('NORMAL') || mv('CURRENCY_RMB')) { // 普通值 or RMB
            value = mq('RANGE') ? { start: '', end: '' } : ''
          }
          filter.value = value
        }
      })
      this.search()
    },
    closeQueryTag(tag) {
      const { key } = tag
      if (key) this.clearQuery(key)
    },

    /*
    * 根据配置渲染搜索项
    * @param{array|null}filters filters初始配置信息
    * @param{array|null}clearKeys 可指定需要清空的key
    * */
    freshSearch(filters = null, clearKeys = null) { /* filters -> searchData */
      filters = filters || this.filters
      const saveFilters = localStorage.getItem(this.filterKey) ? JSON.parse(localStorage.getItem(this.filterKey)) : undefined

      const searchQuery = filters.map(filter => {
        const saveFilter = saveFilters && saveFilters.find(f => f.key === filter.key)

        const mv = JT.$getType(filter.view_type, 'viewType') // match viewType

        const defaultSelectQueryType = saveFilter ? saveFilter.defaultSelectQueryType : ''
        const queryType = typeof defaultSelectQueryType === 'number' ? defaultSelectQueryType : filter.query_type[0]

        const mq = JT.$getType(queryType, 'queryType') // match queryType

        let value = ''; let option_type = ''
        const sear = {
          open: saveFilter ? saveFilter.defaultOpen : typeof filter.open === 'boolean' ? filter.open : true,
          defaultOpen: saveFilter ? saveFilter.defaultOpen : typeof filter.open === 'boolean' ? filter.open : true,
          key: filter.key,
          tips: filter.tips || filter.label,
          label: filter.label,
          clearable: filter.clearable === undefined ? true : filter.clearable,
          view_type: filter.view_type,
          value_type: filter.value_type,
          option_token: filter.option_token,
          query_type: filter.query_type,
          searchNextPageToken: '',
          config: {
            contain_start: true,
            contain_end: true
          },
          selectQueryType: queryType, // 默认的query_type
          defaultSelectQueryType: queryType, // 默认的query_type
          queryTips: JT.getQueryTypeName(defaultSelectQueryType),
          option_type: 0,
          value: '',
          default: '',
          options: null
        }
        if (mv('TIME') || mv('DATE')) { // 时间/日期
          if (saveFilter && saveFilter.default || filter.default) {
            const { start, end } = (saveFilter && saveFilter.default) ? this.getPickerTime(saveFilter.default) : this.getPickerTime(filter.default)
            value = [start, end]
          } else {
            value = []
          }
        } else if (mv('OPTIONS')) { // 单选
          if (saveFilter && saveFilter.default) {
            value = saveFilter.default
          } else {
            value = mq('IN') ? [] : ''
          }
          if (has(this.selfOptions, filter.key)) {
            sear.options = this.selfOptions[filter.key]
            option_type = 'self'
          } else {
            option_type = 'remote'
          }
        } else if (mv('NORMAL') || mv('CURRENCY_RMB')) { // 普通值 or RMB
          if (mq('RANGE')) {
            value = (saveFilter && saveFilter.default) ? saveFilter.default : { start: '', end: '' }
          } else {
            value = (saveFilter && saveFilter.default) ? saveFilter.default : ''
          }
        }
        const setOriDefault = (mq, mv) => { // 范围筛选中，非日期时间筛选置为空字符串即可
          if (mv('DATE') || mv('TIME')) return ''
          return mq('RANGE') ? { start: '', end: '' } : ''
        }

        sear.option_type = option_type
        sear.value = value
        /* localStorage读取default，无则读取filter，无则置空 */
        sear.default = (saveFilter && saveFilter.default) ? saveFilter.default : (filter.default || setOriDefault(mq, mv))

        return sear
      })
      const q = clone(searchQuery, true)
      if (clearKeys) {
        const len = this.searchQuery.length
        for (let i = 0; i < len; i++) {
          const key = this.searchQuery[i].key
          if (clearKeys.includes(key)) this.$set(this.searchQuery, i, q[i])
        }
      } else { // clear all keys
        this.searchQuery = q
      }
      this.autoSearch()
    },
    freshCacheQuery() { // 更新已选标签
      const query = clone(this.searchQuery, true)
      this.cacheSearchQuery = query
      return query
    },
    _getSearchQuery() {
      if (this.searchQuery) {
        const query = this.freshCacheQuery()
        return [...query]
      } else {
        return []
      }
    }
  }
}
