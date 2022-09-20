<template>
  <!--  美化Dialog-->
  <vxe-modal
    ref="vxeModal"
    :value="visible"
    :destroy-on-close="destroy"
    :show-close="false"
    :class-name="`${customClass} beauty-vxe-dialog ${full?'full':''} ${transparent ? 'transparent' : ''}`"
    :fullscreen="full"
    :before-hide-method="onBeforeClose"
    :mask-closable="closeOnClickModal"
    :esc-closable="closeOnPressEscape"
    lock-scroll
    :show-footer="showFooter"
    :transfer="appendToBody"
    v-bind="$attrs"
    :mask="false"
    v-on="$listeners"
  >
    <template #title>
      <slot name="title">
        <div class="title-wrap clearfix">
          <h2 class="title">
            <slot name="titleSelf">{{ title }}</slot>
          </h2>
          <i v-if="showClose" class="title-icon">
            <svg-icon icon-class="close" @click="$emit('update:visible',false)" />
          </i>
        </div>
      </slot>
    </template>

    <slot />
    <template slot="footer">
      <footer v-show="hasFooter" class="footer">
        <slot name="footer" />
      </footer>
    </template>
  </vxe-modal>
</template>

<script>
export default {
  name: 'BeautyDialog',
  props: {
    transparent: { type: Boolean, default: false }, // 透明背景
    visible: { type: Boolean, default: false },
    title: { type: String, default: '' },
    destroy: { type: Boolean, default: false },
    showClose: { type: Boolean, default: true },
    hasFooter: { type: Boolean, default: true },
    full: { type: Boolean, default: false },
    closeOnClickModal: { type: Boolean, default: true },
    closeOnPressEscape: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true },
    appendToBody: { type: Boolean, default: false },
    customClass: { type: String, default: '' }
  },
  methods: {
    closeForm() {
      this.$emit('closeForm')
    },
    onBeforeClose() {
      this.$emit('update:visible', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss">

// 富文本z-index
.tox-tinymce-aux {
  z-index: 2030 !important;
}

/*重置beauty-vxe-dialog样式*/
.beauty-dialog,.beauty-vxe-dialog {
  display: block !important;
  visibility: hidden;
  opacity: 0;
  transition: opacity .2s ease-in-out;
  &:not(.is--active) {
    .vxe-modal--box >div{
      display: none !important;
    }
  }

  &.is--active {
    visibility: visible ;
    opacity: 1 ;
    .vxe-modal--box{
      transform: scale(1) !important;
    }
  }

  &.full .vxe-modal--box {
    border-radius: 0;
  }

  /*透明背景*/
  &.transparent .vxe-modal--box {
    background-color: transparent;
    box-shadow: none !important;
    border: none !important;
  }

  &.is--visible::before{ // 自定义遮罩层
    background-color: rgba(0, 0, 0, 0.1);
    transition: all .13s ease-in-out;
  }

  .vxe-modal--box {
    border-radius: 4px;
    transition: transform .13s cubic-bezier(.38,1.38,.85,.98) !important;
    transform: scale(0.78) !important;
    opacity: 0.4;

    > .vxe-modal--header {
      height: 50px;
      padding: 0 !important;
      margin: 0 !important;
    }

    > .vxe-modal--body {
      padding: 0 !important;
      margin: 0 !important;

      > .vxe-modal--content {
        padding: 0 !important;
        margin: 0 !important;
      }
    }

    > .vxe-modal--footer {
      padding: 0 !important;
      margin: 0 !important;
    }
  }

  p, article {
    padding: 0;
    margin: 0;
  }

  .title-wrap {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: start;
    background-color: #fff;
    padding: 0 16px;
    box-sizing: border-box;

    .title {
      font-size: 18px;
      font-weight: 400;
      color: #303133;
      line-height: 50px;
      margin: 0;
      flex: 1;
    }

    .title-icon {
      font-size: 24px;
      line-height: 50px;
      color: #D0D3D9;
      font-weight: 500;
      display: inline-block;
      cursor: pointer;
    }
  }

  .footer {
    height: 56px;
    line-height: 56px;
    background: #FAFCFF;
    border-radius: 0 0 4px 4px;
    text-align: center;
    border-top: 1px solid #F0F3FA;

    button {
      min-width: 80px;
      letter-spacing: 3px;
    }
  }
}

</style>
