<template>
  <span>
    <template v-if="sear[sType] === queryType.RANGE">
      <el-input v-model="sear[modelName].start" :clearable="clearable" :size="size" :type="getInputType(sear.value_type)" :placeholder="notDefault ? sear.tips : '最小'" class="item-input short" @input="handleSearch" @clear="search" @change="onChange" />
      <span class="space" />
      <el-input v-model="sear[modelName].end" :clearable="clearable" :size="size" :type="getInputType(sear.value_type)" :placeholder="notDefault ? sear.tips : '最大'" class="item-input short" @input="handleSearch" @clear="search" @change="onChange" />
    </template>
    <template v-else>
      <el-input v-model="sear[modelName]" :clearable="clearable" :size="size" :type="getInputType(sear.value_type)" :placeholder="notDefault ? sear.tips : '输入默认值'" class="item-input" @input="handleSearch" @clear="search" @change="onChange" />
    </template>
  </span>
</template>

<script>
import { debounce } from 'xe-utils'

export default {
  name: 'NormalInput',
  props: {
    sear: { type: Object, default() { return { value: '' } } },
    queryType: { type: Object, default() { return {} } },
    getInputType: { type: Function, default() { return () => {} } },
    modelName: { type: String, default: 'value' }, // value or default
    size: { type: String, default: 'small' },
    clearable: { type: Boolean, default: true }
  },
  computed: {
    notDefault() {
      return this.modelName === 'value'
    },
    sType() {
      return this.notDefault ? 'selectQueryType' : 'defaultSelectQueryType'
    }
  },
  methods: {
    handleSearch: debounce(function(e) {
      this.search()
    }, 600),
    search() {
      this.$emit('search')
    },
    onChange() {
      this.$emit('onChange')
    }
  }
}
</script>

<style scoped>

</style>
