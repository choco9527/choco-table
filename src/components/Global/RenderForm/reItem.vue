<template>
  <div class="re-item">
    <el-form-item
      :prop="item.prop || ''"
      :label-width="item.labelWidth || ''"
      :required="item.required || false"
      :rules="item.rules"
      :label="item.label"
      :error="item.error"
      :show-message="item.showMessage"
      :inline-message="item.inlineMessage"
      :size="item.size || 'small'"
    >
      <template v-if="item.labelRender" #label="scope">
        <item-render :scope="scope" :render="item.labelRender" />
      </template>
      <template v-slot="scope">
        <item-render :scope="scope" :render="item.render" />
      </template>
    </el-form-item>
  </div>
</template>

<script>
import ItemRender from './itemRender'

export default {
  name: 'ReItem',
  components: {
    ItemRender
  },
  props: {
    item: Object
  }
}
</script>

<style lang="scss">
@import "@/styles/variables.scss";

.re-item{
  min-height: 60px;
  .el-form-item{
    .el-form-item__label{
      position: relative;
      &:before{
        position: absolute;
        content: "*";
        color: #FF5533;
        right:0;
        top: -4px;
      }
    }
  }
  .label{
    color: $color-text-regular;
    font-weight: 400;
  }
}
</style>
