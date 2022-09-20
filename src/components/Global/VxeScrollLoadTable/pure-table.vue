<!--该组件可直接通过columns data控制数据-->
<template>
  <c-vxe-table
    ref="vxeTable"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <lb-column v-for="(item, index) in columns" :key="index" v-bind="$attrs" :column="item" />
    <template #empty>
      <span>
        <h6 style="opacity: 0;line-height: calc(var(--gutter_10-40,40px) + 20px)">-</h6>
        <p class="empty-wrap">
          <svg-icon icon-class="empty" />
        </p>
        <p class="lh-14 mt--10">{{ noContent }}</p>
        <h6 style="opacity: 0;line-height: calc(var(--gutter_10-40,40px) + 20px)">-</h6>
      </span>
    </template>
  </c-vxe-table>
</template>

<script>
import LbColumn from './lb-column'
import VxeTableMixin from '../mixins/vxe-table-mixins'
import { Table } from 'vxe-table'

export default {
  name: 'PureTable',
  components: { LbColumn, 'c-vxe-table': Table },
  mixins: [VxeTableMixin],
  props: {
    columns: { type: Array, default() { return [] } },
    noContent: { type: String, default: '暂无数据' }
  },
  data() {
    this.refName = 'vxeTable'
    return {

    }
  },
  mounted() {
  }
}
</script>

<style lang="scss">
@import "../assets/table-base";

/*
表格样式
*/

/*标记行样式*/
.vxe-custom-row {
  position: relative;
  &.active {
    @mixin colorType($i,$a){
      @if($i == 1){
        background-color: rgba($color-primary,$a*1%);
      }
      @if($i == 2){
        background-color: rgba($color-success,$a*1%);
      }
      @if($i == 3){
        background-color: rgba($color-warning,$a*1%);
      }
      @if($i == 4){
        background-color: rgba($color-danger,$a*1%);
      }
    }
    @for $i from 0 through 4{
      &-#{$i}{
        @include colorType($i,6);
      }
      &-#{$i}:after {
        content: "";
        display: block;
        width: 3px;
        height: 100%;
        position: absolute;
        left: 0;
        top: 0;
        @include colorType($i,100);
      }
    }
  }
}

/*合计行样式*/
.vxe-table--render-wrapper{
  .vxe-table--fixed-wrapper{
    .vxe-table--fixed-left-wrapper,.vxe-table--fixed-right-wrapper{
      z-index: 10;
      .vxe-table--header-wrapper,.vxe-table--body-wrapper,.vxe-table--footer-wrapper{
        overflow-x: hidden !important;
      }
    }
  }
  .vxe-table--footer-wrapper{
    //transition: all .2s ease-in-out;
    &.sticky-footer {
      position: fixed !important;
      bottom: 0;

      &.fixed-left--wrapper,&.fixed-right--wrapper {
        top: auto !important;
        bottom: 9px;
        height: 40px;
      }
      &.body--wrapper{
        z-index: 9;
      }
      &.fixed-left--wrapper {
        z-index: 10;
        >table.vxe-table--footer {
          position: absolute !important;
          left: 0;
          bottom: 0;
        }
      }
      &.fixed-right--wrapper {
        z-index: 10;
        >table.vxe-table--footer {
          position: absolute;
          right: 0;
          bottom: 0;
        }
      }
    }

    .vxe-custom-footer-row{
      .vxe-custom-footer-cell {
        height: 40px;
        padding: 0 !important;
        margin: 0 !important;
        line-height: 16px;
      }
    }
  }
}

.vxe-body--expanded-cell {
  padding: 15px;
}

/*空数据样式*/
.vxe-table--empty-content{
  color: $border-white-3;

  .empty-wrap{
    color: #e1e4eb;
    font-size: calc(48px + var(--gutter_32-48, 48px));
    line-height: calc(24px + var(--gutter_32-48, 48px));
  }
}

/*表格右键menu样式*/
.vxe-table--context-menu-wrapper.choco-right-menu{
  background-color: $bg-white-1;
  border-radius: 3px;
  box-shadow: 1px 1px 6px 2px rgba(0, 0, 0, 0.1);
  border: none;
  outline: none;
  .vxe-context-menu--option-wrapper{
    >li {
      overflow: hidden;
      border: none;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      height: auto;
      &>.vxe-context-menu--link {
        width: 128px;
        overflow: hidden;
        transition: all .06s ease-in-out;
        background-color: #fff;
        color: $color-text-regular;
        font-size: 13px;
        padding: 6px 14px !important;
        box-sizing: border-box;
        &:hover {
          background-color: #F8F1FF;
        }
        .vxe-context-menu--link-content{
          line-height: 18px;
        }
      }
    }
  }
}

</style>
