<template>
  <transition name="context-menu">
    <div v-show="show" class="menu-container" :style="menuStyle" :menu-id="menuId" @mousedown.stop @contextmenu.prevent>
      <ul class="choco-table-menu">
        <li v-for="menuItem in menuList" :key="menuItem.param" class="context-item" @click="menuClick(menuItem.param)">
          <div class="inner-item">
            {{ menuItem.title }}
          </div>
        </li>
      </ul>
    </div>
  </transition>

</template>

<script>
import { debounce } from 'xe-utils'
export default {
  name: 'GlobalTableMenu',
  props: {
    menuId: String,
    show: Boolean,
    menuList: {
      type: Array,
      default() {
        return [
          { title: '全选', param: 'selectAll' },
          { title: '取消全选', param: 'cancelAll' }
        ]
      }
    },
    menuStyle: {
      type: Object,
      default() {
        return {
          top: '50%',
          left: '50%',
          zIndex: '-100'
        }
      }
    }
  },
  data() {
    return {

    }
  },
  mounted() {
    document.addEventListener('mousedown', debounce(this.clickDocumentHandler, 100))
  },
  methods: {
    clickDocumentHandler(e) {
      if (e.button !== 2) {
        this.$emit('toggleMenu', false)
      }
    },
    menuClick(param) {
      this.$emit('menuClick', param)
    }
  }
}
</script>

<style scoped lang="scss">

.context-menu {
  z-index: 1000;
  display: block;
  position: absolute;
  &-enter,
  &-leave-to {
    opacity: 0;
  }

  &-enter-active,
  &-leave-active {
    transition: opacity .4s cubic-bezier(0.23, 1, 0.32, 1);
  }
}

.menu-container{
  width: 100px;
  height: auto;
  position: fixed;
  top: -50%;
  left: -50%;
  z-index: 100;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 12px 15px 0 rgba(0, 0, 0, 0.24);
  .choco-table-menu{
    font-size: 1.1em;
    width: 100%;
    height: auto;
    padding: 5px 0;
    margin: 0;
    color: #3e3d3d;
    overflow: auto;
    display: flex;
    justify-content: start;
    flex-direction: column;
    align-items: center;
    .context-item {
      width: 100%;
      height: 32px;
      line-height: 32px;
      font-size: var(--gutter_13-14);
      cursor: pointer;
      text-overflow: ellipsis;
      white-space: nowrap;
      list-style: none;
      transition: all .3s linear;
      text-align: left;
      padding-left: 15px;

      &:hover{
        background-color: #ddd;
      }
    }
  }
}
</style>
