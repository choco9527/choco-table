<!--该组件可直接通过columns data控制数据-->
<template>
  <vxe-table
    ref="vxeTable"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <lb-column v-for="(item, index) in columns" :key="index" v-bind="$attrs" :column="item" />
    <template #empty>
      <span>
        <h2 style="opacity: 0;line-height: calc(var(--gutter_10-40,40px) + 20px)">-</h2>
        <p class="empty-wrap">
          <svg-icon icon-class="empty" />
        </p>
        <p class="lh-14 mt--10">{{ noContent }}</p>
        <h2 style="opacity: 0;line-height: calc(var(--gutter_10-40,40px) + 20px)">-</h2>
      </span>
    </template>
  </vxe-table>
</template>

<script>
import LbColumn from './lb-column'
import VxeTableMixin from '../mixins/vxe-table-mixins'

export default {
  name: 'PureTable',
  components: { LbColumn },
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

//表格样式

.vxe-custom-row {
  position: relative;
  &.active:after {
    content: "";
    display: block;
    width: 3px;
    height: 100%;
    background: $lighter-blue;
    position: absolute;
    left: 0;
    top: 0;
  }
}

.vxe-table--fixed-wrapper{
  .vxe-table--fixed-left-wrapper,.vxe-table--fixed-right-wrapper{
    z-index: 10;

    .vxe-table--header-wrapper,.vxe-table--body-wrapper,.vxe-table--footer-wrapper{
      overflow-x: hidden !important;
    }
  }

}

.vxe-table--footer-wrapper{
  &.sticky-footer {
    position: fixed !important;
    bottom: 0;
    &.fixed-left--wrapper,&.fixed-right--wrapper {
      top: auto !important;
      bottom: 9px;
      height: 40px;
    }
    &.fixed-left--wrapper {
      >table.vxe-table--footer {
        position: absolute !important;
        left: 0;
        bottom: 0;
      }
    }
    &.fixed-right--wrapper {
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

.vxe-table--render-default .vxe-table--expanded .vxe-table--expand-btn {
  color: $color-primary;
}

.vxe-body--expanded-cell {
  padding: 15px;
}

.vxe-table--empty-content{
  color: $border-white-3;

  .empty-wrap{
    color: #e1e4eb;
    font-size: calc(48px + var(--gutter_32-48, 48px));
    line-height: calc(24px + var(--gutter_32-48, 48px));
  }
}

// 表格右键menu样式
.vxe-table--context-menu-wrapper{
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 3px 3px 4px -2px rgba(0, 0, 0, 0.1);
  .vxe-context-menu--option-wrapper{

    >li {
      overflow: hidden;
      border: none;
      &>.vxe-context-menu--link {
        overflow: hidden;
        width: 150px;
        transition: all .1s var(--ease-in-out);
        background-color: #fff;
        color: $color-text-regular;

        &:hover {
          background-color: $lightest-blue;
        }
      }
    }
  }
}

</style>
