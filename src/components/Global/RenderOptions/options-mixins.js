// 处理筛选项 options逻辑
import { searchPageOptions } from '../api/global-table'
import { isEmpty } from 'xe-utils'

export default {
  methods: {
    // filter options
    firstFocusSearch(sear) { // 首次筛选
      if (!sear.value && sear.option_token) {
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
    selectFilterMethod(sear) { // 将sear运用到renderOption内部
      const that = this
      if (isEmpty(sear) || !sear.option_token) {
        if (sear.options) that.$set(that, 'options', that.getOptions(sear.options))
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
        console.log('selectFilterMethod')
        if (!val && that.storageOptions(sear.key)) { // not val load sessionStorage
          const opts = that.getOptions(that.storageOptions(sear.key))
          that.$set(that, 'options', opts)
        } else {
          searchPageOptions(params).then(({ list }) => {
            const { next_page_token, options } = list
            const mapOptions = that.getOptions(options)
            that.$set(that, 'options', mapOptions)

            if (!val && !next_page_token && !sear.searchNextPageToken) { // no search val && no next page && no prev token
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
      searchPageOptions(params).then(({ list }) => {
        const { next_page_token, options } = list
        const opts = this.getOptions(options)
        sear.options.push(...opts)
        sear.searchNextPageToken = next_page_token
      })
    },
    storageOptions(key = '', value = null) { // 缓存options
      if (!key) return
      const optionKey = this.configId + '-options'
      const tableOptionsJson = sessionStorage.getItem(optionKey)

      if (!value && tableOptionsJson) { // 读
        const tableOptions = JSON.parse(tableOptionsJson)
        return tableOptions[key]
      } else if (value) { // 写
        if (isEmpty(value)) return // 数据为空不写入
        let tableOptions = {}
        if (tableOptionsJson) tableOptions = JSON.parse(tableOptionsJson)
        tableOptions[key] = value
        sessionStorage.setItem(optionKey, JSON.stringify(tableOptions))
      }
    }
  }
}
