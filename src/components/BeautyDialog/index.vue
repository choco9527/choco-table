<template>
  <!--  美化Dialog-->
  <main class="beauty-dialog">
    <el-dialog
      :destroy-on-close="destroy"
      :top="full ? '0' :top"
      v-bind="$attrs"
      :before-close="onBeforeClose"
      :show-close="false"
      :custom-class="`beauty-el-dialog ${full ? 'full' : ''}`"
      v-on="$listeners"
    >
      <slot name="title">
        <div class="title-wrap clearfix">
          <h2 class="title">
            <slot name="titleSelf">{{ title }}</slot>
          </h2>
          <i class="title-icon">
            <svg-icon icon-class="close" @click="$emit('update:visible',false)" />
          </i>
        </div>
      </slot>
      <slot />
      <template slot="footer">
        <footer v-show="hasFooter" class="footer">
          <slot name="footer" />
        </footer>
      </template>
    </el-dialog>
  </main>
</template>

<script>
export default {
  name: 'BeautyDialog',
  props: {
    title: {
      type: String,
      default: ''
    },
    top: {
      type: String,
      default: '15vh'
    },
    destroy: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    hasFooter: {
      type: Boolean,
      default: true
    },
    full: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    closeForm() {
      this.$emit('closeForm')
    },
    onBeforeClose(done) {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang="scss">

// 富文本z-index
.tox-tinymce-aux{
  z-index: 2030 !important;
}
.beauty-el-dialog {
  &.full{
    width: 100%;
    height: 100%;
    border-radius: 0;
  }
    p,article{
      padding: 0;
      margin: 0;
    }
    border-radius: 4px;
    overflow: hidden;
    &.is-fullscreen{
      overflow: auto;
    }

    >.el-dialog__header {
      height: auto;
      padding: 0;
      margin: 0;
    }

    >.el-dialog__body {
      padding: 0;
      margin: 0;
    }

    >.el-dialog__footer {
      padding: 0;
      margin: 0;
    }

    .title-wrap {
      height: 50px;
      line-height: 50px;
      width: 100%;
      display: inline-block;
      background-color: #fff;
      border-bottom: 1px solid #F0F3FA;
      padding: 0 16px;
      box-sizing: border-box;

      .title {
        float: left;
        font-size: 18px;
        font-weight: 400;
        color: #303133;
        line-height: 50px;
        margin: 0;
      }
      .title-icon {
        float: right;
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
      button{
        min-width: 80px;
        letter-spacing: 3px;
      }
    }

    //自定义弹窗动画
    .el-dialog__wrapper {
      transition-duration: 0.2s;
      backdrop-filter: saturate(180%) blur(0.99px);
    }
    .dialog-fade-enter-active{
      animation: none !important;
    }
    .dialog-fade-leave-active {
      transition-duration: 0.1s !important;
      animation: none !important;
    }
    .dialog-fade-enter-active .el-dialog,
    .dialog-fade-leave-active .el-dialog{
      animation-fill-mode: forwards;
    }
    .dialog-fade-enter-active .el-dialog{
      animation-duration: 0.2s;
      animation-name: anim-open;
      animation-timing-function: cubic-bezier(0.08,0.82,0.17,1);
    }
    .dialog-fade-leave-active .el-dialog{
      animation-duration: 0.2s;
      animation-name: anim-close;
      animation-timing-function: cubic-bezier(0.78,0.14,0.15,0.86);
    }

    @keyframes anim-open {
      0% { opacity: 0;  transform: scale3d(0, 0, 1); }
      100% { opacity: 1; transform: scale3d(1, 1, 1); }
    }

    @keyframes anim-close {
      0% { opacity: 1; }
      100% { opacity: 0; transform: scale3d(.2, .2, 1); }
    }
  }

</style>
