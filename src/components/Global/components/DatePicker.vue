<template>
  <el-date-picker
    v-model="sear.value"
    :clearable="clearable"
    :type="getPickerConfig(sear.view_type).type"
    :size="size"
    :default-time="['00:00:00','23:59:59']"
    range-separator="~"
    :start-placeholder="sear.tips"
    :end-placeholder="sear.tips"
    :class="['item-input',getPickerConfig(sear.view_type).type]"
    :picker-options="pickerOptions"
    @change="search"
  />
</template>

<script>
export default {
  name: 'DatePicker',
  props: {
    sear: { type: Object, default() { return { value: '' } } },
    pickerOptions: { type: Object, default() { return { } } },
    getPickerConfig: { type: Function, default() { return () => {} } },
    size: { type: String, default: 'small' },
    clearable: { type: Boolean, default: true }
  },
  methods: {
    search() {
      this.$emit('search')
    }
  }
}
</script>

<style scoped>

</style>
