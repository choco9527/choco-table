<template>
  <div class="global-form" :style="{width,height}">
    <article v-if="showLeft" class="left-tabs">
      <!--      <template v-for="(conf,index) in formConfig">-->
      <!--        <div :key="conf.form.form_token" class="tab" :class="{active: tabIndex === index}" @click="tabClick(index)">-->
      <!--          <p class="title">{{ conf.form.title }}</p>-->
      <!--        </div>-->
      <!--      </template>-->
    </article>
    <article class="right-forms">
      <render-form ref="renderForm" :config-id="configId" :items-raw="formItems" :form-data="formData" v-bind="$attrs" />
    </article>
  </div>
</template>

<script>
// 表单数据全部由formConfig驱动
import RenderForm from './RenderForm/renderForm'
import { objectEach } from 'xe-utils'
import { cloneDeep } from '../../utils/tool'
import { submitForm } from './api/global-table'
import formConfigMap from './config-map'

export default {
  name: 'GlobalForm',
  components: { RenderForm },
  props: {
    selfSubmit: { type: Function, default: null }, // 自定义提交方法 替换global-form -> submitForm
    configId: { type: [Number, String], default: 0 }, // config->tableId
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    }
  },
  data() {
    return {
      formConfig: null,
      formData: {},
      pks: []
    }
  },
  computed: {
    widthMap() { // to be delete
      const res = {}
      objectEach(formConfigMap, (item, key) => {
        res[key] = item.width || ''
      })
      return res
    },
    formItems() {
      return this.formConfig ? this.formatFormItems(this.formConfig.form.items) : []
    },
    showLeft() {
      return false
    }
  },
  created() {
  },
  methods: {
    formatFormItems(formItems) {
      return formItems.map(item => {
        return {
          ...item,
          option_type: 'remote'
        }
      })
    },
    $getFormConfig(formConfig, pks) { // 表单配置
      if (formConfig) {
        this.pks = [...pks]
        const config = cloneDeep(formConfig)
        config.form.items && config.form.items.forEach(item => {
          item.width = this.widthMap[item.key] || '100%'
        })
        this.formConfig = config
      }
    },
    $getFormData(formData, formConf) { // 表单数据
      if (!isEmpty(formData) && !isEmpty(formConf)) {
        this.formData = cloneDeep(formData)
        const config = cloneDeep(formConf)
        this.$refs.renderForm.freshOutputFormData(this.formData, config)
      }
    },
    async $submit(data = null) {
      try {
        if (!data) {
          const submitFormData = cloneDeep(this.$refs.renderForm.formatFormDataMethod())
          const form = this.formConfig.form
          const vals = form.items.filter(item => {
            const type = submitFormData[item.key] + ''
            return (type !== 'undefined' && type !== 'null')
          })
          const commitValue = {
            form_token: form.form_token,
            values: vals.map(item => ({ key: item.key, values: [submitFormData[item.key]] }))
          }
          data = { pks: this.pks, commitValue }
        }
        if (this.selfSubmit) {
          return await this.selfSubmit()
        } else {
          const res = await submitForm(data, this)
          this.$choco_msg.success('提交成功')
          return { code: 0, res }
        }
      } catch (e) {
        console.log('$submit error', e)
      }
    }
  }
}
</script>

<style lang="scss">
.global-form{
  overflow-y: auto;
  display: flex;
  justify-content: start;
  padding: 20px 20px 0 0;
  p{
    margin:0;
    padding: 0;
  }
  .left-tabs{
    width: 100px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: start;
    box-sizing: content-box;
    border-right: .5px solid #ededed;
    .tab{
      width: 100%;
      cursor: pointer;
      &.active{
        background-color: #fafafa;
        border-right: 2px solid #d7aeae;
      }
      .title{
        color: #474747;
        display: inline-block;
        line-height: 40px;
        height: 40px;
        width: 100%;
        text-align: center;
        font-weight: 600;
      }
    }
  }
  .right-forms{
    padding: 6px;
    height: 100%;
    flex: 1;
    overflow-y: auto;
    .label{
      color: #303030;
      font-size:14px;
      font-weight: 600;
      line-height: 1.5;
      padding-top: calc(0.375rem + 1px);
      padding-bottom: calc(0.375rem + 1px);
    }
    .input-short{
      width: 140px;
    }

  }
}
</style>
