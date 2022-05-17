// 处理筛选项 options逻辑
import { searchPageOptions } from '../api/global-table'

export default {
  methods: {
    // filter options
    firstFocusSearch(sear) { // 首次筛选
      if (!sear.value && sear.option_token) {
        this.selectFilterMethod(sear)()
      }
    },
    selectFilterMethod(sear) {
      const obj = { sear }
      const that = this
      const filterSearchMethod = function(val = '') {
        const { sear } = this
        const params = {
          keyword: val,
          optionToken: sear.option_token || '',
          searchNextPageToken: sear.searchNextPageToken || '',
          searchNumPerPage: 20
        }
        if (!val && that.storageOptions(sear.key)) { // no val load sessionStorage
          sear.options = that.storageOptions(sear.key)
        } else {
          searchPageOptions(params).then(({ list }) => {
            const { next_page_token, options } = list
            sear.options = options.map(opt => ({
              key: opt.value,
              value: opt.value,
              label: opt.label
            }))

            if (!val && !next_page_token && !sear.searchNextPageToken) { // no search val && no next page && no prev token
              that.storageOptions(sear.key, sear.options)
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
        const opts = options.map(opt => ({
          key: opt.value,
          value: opt.value,
          label: opt.label
        }))
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
        let tableOptions = {}
        if (tableOptionsJson) {
          tableOptions = JSON.parse(tableOptionsJson)
        }
        tableOptions[key] = value
        sessionStorage.setItem(optionKey, JSON.stringify(tableOptions))
      }
    }
  }
}
