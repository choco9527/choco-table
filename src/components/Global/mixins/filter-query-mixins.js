import { has, isEmpty } from 'xe-utils'
import { JT } from '../form-types'
import dayjs from '@/utils/dayjs'
import { _local, cloneDeep } from '@/utils/tools'

export default {
  data() {
    return {
      cacheSearchQuery: []
    }
  },
  computed: {
    // cacheSearchQuery() {
    //   return cloneDeep(this.searchQuery)
    // },
    queryTags() { // 搜索参数已选标签
      const tags = []
      try {
        if (this.cacheSearchQuery) {
          this.cacheSearchQuery.forEach(query => {
            if (typeof query.value === 'number' || (typeof query.value !== 'object' && query.value) || (typeof query.value === 'object' && !isEmpty(query.value))) {
              const mv = JT.$getType(query.view_type, 'viewType') // match viewType
              const mq = JT.$getType(query.selectQueryType, 'queryType') // match queryType
              const val = query.value
              const tag = {
                key: query.key,
                label: query.label,
                clearable: query.clearable
              }
              const _push = () => tags.push(tag)
              const _set = v => { tag.value = v }
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
              } else if (mv('OPTIONS') && query.options) {
                if (mq('IN')) { // 多选
                  const labels = query?.options.filter(opt => val.includes(opt.value))
                  _set(labels.map(l => l.label).join(','))
                } else { // 单选
                  const label = query?.options.find(opt => opt.value === val)
                  _set(label && label.label)
                }
                _push()
              }
            }
          })
        }
        return tags
      } catch (e) {
        console.log('已选标签筛选Error:', e)
        return tags
      }
    }
  },
  methods: {
    clearAllQuery() { // 清空所有筛选
      this.freshSearch()
      this.search()
    },
    clearQuery(key) { // 清空指定筛选
      this.searchQuery.forEach((filter, $i) => {
        if (filter.key === key) {
          let value = ''
          const { mv, mq } = this.getPreFilterInfo(filter)

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
    getPreFilterInfo(filter) {
      const saveFilter = _local.get(this.filterKey)?.find(f => f.key === filter.key) // 获取默认值
      const defaultSelectQueryType = saveFilter ? saveFilter.defaultSelectQueryType : '' // 默认选择类型
      const queryType = typeof defaultSelectQueryType === 'number' ? defaultSelectQueryType : filter.query_type[0]

      const mv = JT.$getType(filter.view_type, 'viewType') // match viewType
      const mq = JT.$getType(queryType, 'queryType') // match queryType
      return { saveFilter, defaultSelectQueryType, queryType, mv, mq }
    },

    /*
    * 根据配置渲染搜索项
    * @param{array|null}filters filters初始配置信息
    * @param{array|null}clearKeys 可指定需要清空的key
    * */
    freshSearch(filters = null, clearKeys = null) { /* filters -> searchData */
      filters = filters || this.filters

      const searchQuery = filters.map(filter => {
        const { saveFilter, defaultSelectQueryType, queryType, mv, mq } = this.getPreFilterInfo(filter)

        let value = ''; let option_type = ''

        const canOpen = filter => {
          if (typeof filter.open === 'boolean') return filter.open // open优先级最高
          if (typeof filter.collapse_default === 'boolean') return !filter.collapse_default // collapse折叠，展开即打开，与open相同意思，优先级更低
          return true // 默认展开
        }

        const sear = {
          open: saveFilter ? saveFilter.defaultOpen : canOpen(filter),
          defaultOpen: saveFilter ? saveFilter.defaultOpen : canOpen(filter), // 浏览器缓存open，比open优先级更高
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
        } else if (mv('OPTIONS')) { // 下拉选择
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
            value = (saveFilter && saveFilter.default) ? saveFilter.default
              : filter.default ? { start: filter.default.start, end: filter.default.end } : { start: '', end: '' }
          } else {
            value = (saveFilter && saveFilter.default) ? saveFilter.default : filter.default || ''
          }
        }

        sear.option_type = option_type
        sear.value = value

        const setOriDefault = (mq, mv) => { // 范围筛选中，非日期时间筛选置为空字符串即可
          if (mv('DATE') || mv('TIME')) return ''
          return mq('RANGE') ? { start: '', end: '' } : ''
        }
        /* localStorage读取default，无则读取filter，无则置空 */
        sear.default = (saveFilter && saveFilter.default) ? saveFilter.default : (filter.default || setOriDefault(mq, mv))

        return sear
      })
      const q = cloneDeep(searchQuery)
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
    _getSearchQuery() {
      if (this.searchQuery) {
        const q = cloneDeep(this.searchQuery)
        this.$nextTick(() => {
          this.cacheSearchQuery = q
        })
        return q
      } else {
        return []
      }
    }
  }
}
