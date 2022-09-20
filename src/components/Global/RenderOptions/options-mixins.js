// 处理筛选项 options逻辑
import { searchPageOptions } from '../api/global-table'
import { isEmpty } from 'xe-utils'
import { _session, cloneDeep } from '@/utils/tools'

export default {
  methods: {
    // filter options
    handleSearFocus(sear) { // 下拉focus进行初始化
      if (sear.value !== undefined && sear.value !== null && sear.option_token) {
        this.selectFilterMethod(sear)()
      }
    },
    getOptions(options) { // 处理转化options的key类型
      return options.map(opt => {
        return {
          key: opt.key || opt.value,
          value: this.formatValType(opt.value),
          label: opt.label
        }
      })
    },
    setOptions(options, sear) {
      if (!sear) return
      const that = this
      const o = cloneDeep(options)
      that.$set(that, 'options', o)
      sear.options = o
    },
    selectFilterMethod(sear) { // 将sear运用到renderOption内部
      const that = this
      const setOptions = options => {
        that.setOptions(options, sear)
      }

      if (isEmpty(sear) || !sear.option_token) {
        if (sear.options) setOptions(that.getOptions(sear.options))
        return () => {}
      }
      const obj = { sear }
      const filterSearchMethod = function(val = '') {
        const { sear } = this
        const params = {
          keyword: val,
          optionToken: sear.option_token || '',
          searchNextPageToken: sear.searchNextPageToken || '',
          searchNumPerPage: 20
        }
        if (!val && that.storageOptions(sear.key)) { // no value && has sessionStorage
          // get storage
          const opts = that.getOptions(that.storageOptions(sear.key))
          setOptions(opts)
        } else {
          searchPageOptions(params, that).then(({ list }) => {
            const { next_page_token, options } = list
            const mapOptions = that.getOptions(options)
            setOptions(mapOptions)

            if (!val && !next_page_token && !sear.searchNextPageToken) { // no val && no next page && no prev token
              // set storage
              that.storageOptions(sear.key, mapOptions)
            }
            sear.searchNextPageToken = next_page_token
          })
        }
      }
      return filterSearchMethod.bind(obj)
    },
    nextSearchOptions(sear) { // 下一页
      const params = {
        searchNextPageToken: sear.searchNextPageToken
      }
      searchPageOptions(params, this).then(({ list }) => {
        const { next_page_token, options } = list
        const opts = this.getOptions(options)
        if (sear.options) {
          sear.options.push(...opts)
          sear.searchNextPageToken = next_page_token
        }
      })
    },
    storageOptions(key = '', value = null) { // 使用sessionstorage缓存options
      if (!key) return
      const optionKey = this.configId + '-options'
      const tableOptions = _session.get(optionKey)

      if (!value && tableOptions) { // 读
        return tableOptions[key]
      } else if (value) { // 写
        if (isEmpty(value)) return // 数据为空不写入
        const setTableOptions = tableOptions || {}
        setTableOptions[key] = value
        _session.set(optionKey, setTableOptions, 60 * 1000) // 缓存1min
      }
    }
  }
}
