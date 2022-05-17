<template>
  <vxe-column
    :type="column.type"
    :field="column.field"
    :visible="column.visible"
    :title="column.title"
    :title-help="column.titleHelp"
    :index="column.index"
    :width="column.width"
    :min-width="column.minWidth"
    :fixed="column.fixed"
    :sortable="column.sortable || false"
    :sort-method="column.sortMethod"
    :sort-by="column.sortBy || ''"
    :resizable="column.resizable"
    :formatter="column.formatter"
    :align="column.align || align || 'left'"
    :header-align="column.headerAlign || headerAlign || column.align || align || 'left'"
    :class-name="column.className || ''"
    :label-class-name="column.labelClassName || ''"
    :selectable="column.selectable || false"
    :reserve-selection="column.reserveSelection || false"
    :filters="column.filters"
    :filter-multiple="column.filterMultiple || false"
    :filter-method="column.filterMethod"
    :show-overflow="column.showOverflow || false"
    v-bind="$attrs"
    v-on="$listeners"
  >

    <template v-if="column.renderHeader" #header="scope">
      <lb-render :scope="scope" :render="column.renderHeader" />
    </template>

    <template v-if="column.render && !column.noRender" #default="scope">
      <lb-render :scope="scope" :render="column.render" />
    </template>

    <template v-if="column.renderContent" #content="scope"> <!--展开行-->
      <lb-render :scope="scope" :render="column.renderContent" />
    </template>

    <template v-if="column.renderFooter" #footer="scope"> <!--表尾-->
      <lb-render :scope="scope" :render="column.renderFooter" />
    </template>

    <template v-if="column.renderCheckbox" #checkbox="scope"> <!--复选-->
      <lb-render :scope="scope" :render="column.renderCheckbox" />
    </template>

    <template v-if="column.children">
      <lb-column v-for="(col, index) in column.children" :key="index" :column="col" />
    </template>
  </vxe-column>
</template>

<script>
import LbRender from './lb-render'
export default {
  name: 'LbColumn',
  components: {
    LbRender
  },
  props: {
    column: Object,
    headerAlign: String,
    align: String
  },
  data() {
    return {
    }
  },
  // watch: {
  //   column: {
  //     handler() {
  //       this.setColumn()
  //     },
  //     immediate: true
  //   }
  // },
  methods: {

    // setColumn() { // 影响性能，故去除
    //   if (this.column.formatter) {
    //     this.column.render = (h, scope) => {
    //       return <span>{ scope.column.formatter(scope.row, scope.column, scope.row, scope.$index) }</span>
    //     }
    //   }
    // }
  }
}
</script>
