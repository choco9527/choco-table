import { JT } from '../form-types'
import { objectEach } from 'xe-utils'

export default {
  data() {
    return {
      richSetting: {
        toolbar_mode: 'wrap',
        toolbar: 'undo redo | fullscreen | formatselect alignleft aligncenter alignright alignjustify | link unlink | numlist bullist | image media table | fontselect fontsizeselect forecolor backcolor | bold italic underline strikethrough | indent outdent | superscript subscript | removeformat',
        toolbar_drawer: 'sliding',
        quickbars_selection_toolbar: 'removeformat | bold italic underline strikethrough | fontsizeselect forecolor backcolor',
        plugins: 'link image media table lists fullscreen quickbars powerpaste',
        language: 'zh_CN', // 本地化设置
        height: 550,
        powerpaste_allow_local_images: true,
        powerpaste_html_import: 'clean',
        powerpaste_word_import: 'clean'
      }
    }
  },
  computed: {
    items() {
      const len = this.itemsRaw && this.itemsRaw.length
      const items = []
      if (len > 0) {
        this.itemsRaw.forEach(config => {
          const mv = JT.$getType(config.view_type, 'viewType') // match viewType

          const item = {
            prop: config.key,
            label: config.label,
            required: config.required || true,
            labelRender: this.labelRender(config),
            render: this.itemRender(config, mv),
            fullRow: mv('RICH_TEXT'), // 富文本格式需要占用整行
            richText: mv('RICH_TEXT') || false
          }
          items.push(item)
        })
      }
      return items
    }
  },
  methods: {
    labelRender(config) { // 渲染表单labels
      return (h, scope) => {
        const labelEl = <el-tooltip open-delay={300} className='item' effect='light' content={config.tips} placement='top'>
          <span class='label'>{ config.label }</span>
        </el-tooltip>
        return <div>{labelEl}</div>
      }
    },
    itemRender(config, mv) { // 处理表单item显示
      const outObj = this.outputFormData[config.key]
      const valueV = JT.$getType(config.value_type, 'valueType') // match valueType
      const style = { width: config.width }

      return (h, scope) => this.formatValEle(config, mv, valueV, outObj, style)
    },
    formatValEle(config, mv, valueV, outObj, style) {
      let insertEl = ''

      if (mv('NORMAL')) { // 普通值
        insertEl = this.getNormalEl(outObj, config, valueV)
      } else if (mv('DATE')) { // 日期
        insertEl = this.getDateEl(outObj, config)
      } else if (mv('OPTIONS')) { // 下拉
        insertEl = this.getOptionsEl(outObj, config)
      } else if (mv('MULTILINE_TEXT')) { // 多行文本
        insertEl = this.getTextEl(outObj, config)
      } else if (mv('CURRENCY_RMB')) { // 货币（人民币类型）
        insertEl = this.getCurrencyEl(outObj, config)
      } else if (mv('IMAGE')) { // 图片链接
        insertEl = this.getImageEl(outObj, config)
      } else if (mv('JSON')) { // JSON编辑框
        insertEl = this.getJsonEl(outObj, config)
      } else if (mv('LINK')) { // 链接
        insertEl = this.getLinkEl(outObj, config)
      } else if (mv('RICH_TEXT')) { // 富文本类型在reItem.vue中处理
        insertEl = this.getRichTextEl(outObj, config)
      }
      return (<div style={style}>{insertEl}</div>)
    },
    formatFormDataMethod() { /* outputFormData -> outputData 将outputFormData处理为上传的data */
      const outData = {}
      objectEach(this.outputFormData, (item, key) => {
        const config = this.itemsRaw?.find(raw => raw.key === key)
        if (config) {
          const mv = JT.$getType(config.view_type, 'viewType') // 展示形式
          const format = JT.$toType(config.value_type) // 值形式

          if (mv('CURRENCY_RMB')) { // RMB类型需要特殊处理
            outData[key] = this.toRMBFixed(item.value * 100)
          } else if (mv('JSON')) { // JSON类型需要特殊处理
            outData[key] = item.tempVal || item.value
          } else if (mv('RICH_TEXT')) { // 富文本类型需要特殊处理
            outData[key] = item.tempVal || item.value
          } else {
            outData[key] = format(item.value)
          }
        }
      })
      // console.log(outData)
      return outData
    },
    toRMBFixed(str) {
      const num = parseFloat(str)
      if (isNaN(num)) {
        return ''
      } else {
        return num.toFixed(0)
      }
    },
    getNormalEl(outObj, config, valueV) {
      if (valueV('BOOL')) {
        return (<el-switch v-model={outObj.value}/>)
      } else {
        return (<el-input clearable v-model={outObj.value} placeholder={config.tips}/>)
      }
    },
    getDateEl(outObj, config) {
      return (<el-date-picker v-model={outObj.value} type='datetime' placeholder={config.tips}/>)
    },
    getOptionsEl(outObj, config) {
      const optionChange = val => { outObj.value = val }
      if (!config.value) config.value = outObj.value || ''
      return (<render-options config-id={this.configId} sear={config} optionChange={optionChange} />)
    },
    getTextEl(outObj, config) {
      return (<el-input type='textarea' clearable autosize v-model={outObj.value} placeholder={config.tips}/>)
    },
    getCurrencyEl(outObj, config) {
      return (<div>
        <el-input class='input-short' clearable v-model={outObj.value} placeholder={config.tips}/>
        <span>元</span>
      </div>)
    },
    getImageEl(outObj, config) {
      return (<el-input clearable v-model={outObj.value} placeholder={config.tips}/>)
    },
    getJsonEl(outObj) {
      let jsonVal = null
      try {
        jsonVal = JSON.parse(outObj.value)
      } catch (e) {
        console.log('不是有效的json格式, 重置为null')
        jsonVal = null
      }
      return (<div class='json-wrap'>
        <v-json-edit mode='code' drag lang='zh-CN' v-model={jsonVal} mainMenuBar={false} edit onChange={(val) => {
          outObj.tempVal = JSON.stringify(val)
        }}/>
      </div>)
    },
    getLinkEl(outObj, config) {
      return (<el-input clearable v-model={outObj.value} placeholder={config.tips}/>)
    },
    getRichTextEl(outObj, config) {
      const richContainer = <div class='tinymce-container'>
        <vue-tinymce v-model={outObj.tempVal} setup={this.setup} setting={this.richSetting} />
      </div>
      return (<main>{richContainer}</main>)
    },
    setup(editor) {
      console.log(editor)
    }
  },
  mounted() {

  }
}
