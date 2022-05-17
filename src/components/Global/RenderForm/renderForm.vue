<template>
  <single-form :items="items" :output-form-data="outputFormData" v-bind="$attrs" />
</template>

<script>
import SingleForm from './singleForm'
import formMixin from '../RenderForm/form-mixins'
import { filterType, JT } from '../form-types'

export default {
  name: 'RenderForm',
  components: { SingleForm },
  mixins: [formMixin],
  props: {
    configId: { type: [Number, String], default: 0 }, // config->tableId
    itemsRaw: { // 原始items
      type: Array,
      default() {
        return []
      }
    },
    formData: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  data() {
    return {
      outputFormData: {} // { key: {value: ''}, }
    }
  },
  created() {
    // this.freshOutputFormData()
  },
  methods: {
    freshOutputFormData(formData, formConfig) {
      const data = formData || this.formData
      this.outputFormData = {}

      formConfig.form.items.forEach(conf => {
        if (conf.view_type === filterType.viewType.CURRENCY_RMB) {
          const valObj = data[conf.key] ? { value: data[conf.key].source_value ? data[conf.key].source_value / 100 : '' } : { value: '' }
          this.$set(this.outputFormData, conf.key, valObj)
        } else {
          const valObj = data[conf.key] ? { value: data[conf.key].value, tempVal: '' } : { value: '', tempVal: '' }
          this.$set(this.outputFormData, conf.key, valObj)
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
