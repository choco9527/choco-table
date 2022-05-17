<template>
  <span>
    <el-select v-if="optionType === 'self'" v-model="value" class="item-input" :size="size" :placeholder="sear.tips" :multiple="sear.selectQueryType === queryType.IN" collapse-tags :clearable="clearable" @change="change">
      <el-option v-for="opt in sear.options" :key="opt.key" :label="opt.label" :value="opt.value" />
    </el-select>
    <el-select
      v-if="optionType === 'remote'"
      v-model="value"
      :size="size"
      filterable
      :filter-method="selectFilterMethod(sear)"
      :placeholder="sear.tips"
      collapse-tags
      :clearable="clearable"
      :multiple="sear.selectQueryType === queryType.IN"
      class="item-input"
      @focus="firstFocusSearch(sear)"
      @change="change"
    >
      <el-option
        v-for="opt in options"
        :key="opt.key"
        :label="opt.label"
        :value="opt.value"
      />
      <div v-if="sear.searchNextPageToken" class="next-option" @click="nextSearchOptions(sear)"><i class="el-icon-arrow-down" /></div>
    </el-select>
  </span>

</template>

<script>
import filterOptionMixin from './options-mixins'
import { filterType, JT } from '../form-types'

export default {
  name: 'RenderOptions',
  mixins: [filterOptionMixin],
  props: {
    size: { type: String, default: 'small' },
    modelName: { type: String, default: 'value' },
    configId: { type: [Number, String], default: 0 }, // config->tableId
    clearable: { type: Boolean, default: true },
    sear: {
      type: Object,
      default() {
        return {}
      }
    },
    optionChange: {
      type: Function,
      default() {
        return undefined
      }
    },
    propVal: {
      type: [String, Array, Number],
      default: ''
    }
  },
  data() {
    return {
      value: '',
      options: [],
      ...filterType
    }
  },
  computed: {
    optionType() {
      return this.sear.option_type
    }
  },
  watch: {
    propVal(newVal, oldVal) {
      if (newVal && newVal !== oldVal) this.setValue()
    }
  },
  created() {
    this.selectFilterMethod(this.sear)()
    this.setValue()
  },
  mounted() {
  },
  methods: {
    formatValType(oriVal) {
      return this.sear
        ? typeof oriVal === 'object'
          ? oriVal : JT.$toType(this.sear.value_type)(oriVal)
        : oriVal
    },
    setValue() {
      const oriVal = this.sear[this.modelName]
      this.value = this.formatValType(oriVal)
    },
    change(val) {
      this.sear[this.modelName] = val
      this.optionChange && this.optionChange(val)
      this.$emit('optionChange')
    }
  }
}
</script>

<style lang="scss">
.next-option{
  text-align: center;
  cursor: pointer;
}
</style>
