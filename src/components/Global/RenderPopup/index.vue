<template>
  <el-popconfirm
    confirm-button-text="确定"
    cancel-button-text="取消"
    :title="popupTitle"
    class="render-popup"
    @confirm="onConfirm"
    @cancel="onCancel"
  >
    <template slot="reference">
      <slot name="reference">
        <el-button type="text" size="mini" class="svg-wrap danger">
          <svg-icon class="delete fs-14" icon-class="delete" />
        </el-button>
      </slot>
    </template>
  </el-popconfirm>
</template>

<script>
export default {
  name: 'RenderPopup',
  props: {
    popupTitle: { type: String, default: '确认删除？' },
    handleConfirm: { type: Function, default: null },
    handleCancel: { type: Function, default: null }
  },
  data() {
    return {

    }
  },
  methods: {
    onConfirm() {
      this.handleConfirm && this.handleConfirm()
    },
    onCancel() {
      this.handleCancel && this.handleCancel()
    }
  }
}
</script>

<style scoped>

</style>
