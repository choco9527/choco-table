<template>
  <div class="table-wrap pl-42 pr-42">
    <h2>表格组件 GlobalTable</h2>
    <p>包含内置组件 BeautyDialog、PureTable、VxeScrollLoadTable、CColSet</p>
    <p>import GlobalTable, { PureTable, VxeScrollLoadTable, CColSet } from '@yl/packages'</p>
    <global-table
      ref="globalTable"
      :config="{tableId: 'self_application_list'}"
      :self-cell-formats="selfCellFormats"
      :col-config-map="colConfigMap"
      :self-options="selfOptions"
      :auto-height="false"
      :max-tb-height="3000"
      show-table-summary
      selectable
      show-index
      sticky-footer
      use-slot-footer
      show-setting-export
      show-remote-export
      :row-config="{isCurrent: true, isHover: true}"
      @handleTableSelectionChange="selectionChange"
    >
      <template v-slot:filterBack>
        <span class="batch">
          <!--     使用 class batch 维持样式-->
          <el-button type="primary" size="mini" @click="setCurrentRow">标记指定行</el-button>
          <el-button type="info" size="mini" @click="clearCurrentRow">清除指定行</el-button>
          <el-button size="mini" @click="getTable">获取原始table</el-button>
        </span>
      </template>
      <template v-slot:tableBack>
        <span class="color-secondary">数据不是实时的。过去3小时内的数据可能会有延时</span>
      </template>
    </global-table>
    <!--    全局安装可使用内置beauty-dialog组件-->
    <beauty-dialog :position="{top: 140}" width="635px" :visible.sync="showWordInfoDialog" title="关键词">
      <div class="p-12" style="height: 300px">
        <!--        全局安装可使用内置pure-table，语法与vxe相同，可用于同步最基础表格数据渲染-->
        <pure-table
          header-row-class-name="vxe-custom-head"
          max-height="94%"
          height="auto"
          border
          align="center"
          size="small"
          :data="wordInfos"
          :columns="wordColumns"
        />
      </div>
      <template slot="footer">
        <el-button class="btn" size="small" type="primary" @click="()=>{closeWordDialog()}">好的</el-button>
      </template>
    </beauty-dialog>
  </div>
</template>

<script>
import { getConfig, getList } from '@/mock-api/tableMethods'
import { pureColumns } from '@/mock-api/tableConfigs'
import { pureData } from '@/mock-api/tableDatas'
import { PureTable } from '@'

export default {
  name: 'Table',
  components: { PureTable },
  data() {
    return {
      showWordInfoDialog: false,
      getConfig: async() => { // 如未在全局options指定getConfig方法 则需要使用该方法
        try {
          const configData = await getConfig()
          console.log('自定义的config', configData)
          return configData
        } catch (e) {
          console.log(e)
        }
      },
      getList: async(query) => { // 如未在全局options指定getList方法 则需要使用该方法
        try {
          console.log('请求参数', query) // 如有需要请自行合并
          const resData = await getList(query)
          console.log('自定义的data', resData)
          return resData
        } catch (e) {
          console.log(e)
        }
      },
      selfCellFormats: {
        name: ({ row }) => {
          const name = row.name
          const icon = row.icon
          const img = <img class='br-4 mr-6' src={icon} alt={name} width='30' height='30'/>
          return <span>{icon && img}{name}</span>
        },
        keywords: () => {
          return (<el-button type='text' onClick={() => { this.showWordInfo() }}>查看关键词</el-button>)
        }
        // text: ({ item }) => {
        //   return (<p class='big-cell'>{item.value}</p>)
        // }
      },
      colConfigMap: {
        // expand: { fixed: 'left' }, // checkbox seq expand可分别控制 复选 序列 展开 三列的行为
        name: { minWidth: 220, align: 'left' },
        cp_id: { width: 120 },
        date: { minWidth: 100 },
        // images: { minWidth: 120 },
        text: { minWidth: 200 },
        keywords: { width: 120/* fixed: 'right'*/ }
      },
      selfOptions: { // 自定义option，不发送请求
        'delete': [{ label: '未删除', value: 1, key: '1' }, { label: '已删除', value: 2, key: '2' }]
      },
      wordInfos: pureData,
      wordColumns: pureColumns(this)
    }
  },
  methods: {
    selectionChange(val) {
      console.log(val)
    },
    showWordInfo() {
      this.showWordInfoDialog = true
    },
    closeWordDialog() {
      this.showWordInfoDialog = false
    },
    setCurrentRow() {
      const rows = this.$refs['globalTable'].getData()
      /* 提取 _X_ROW_KEY */
      const keys1 = rows.filter(v => v.num > 600).map(v => v._X_ROW_KEY)
      // const keys2 = rows.filter(v => v.num > 500 && v.num < 600).map(v => v._X_ROW_KEY)
      this.$refs['globalTable'].setActiveRows(keys1, 'warning')
      // this.$refs['globalTable'].setActiveRows(ids2, 'blue')
    },
    clearCurrentRow() {
      // this.$refs['globalTable'].clearActiveRows('blue')
      this.$refs['globalTable'].clearActiveRows('warning')
    },
    getTable() { // 可以如此调用vxe-table方法
      const vxeTable = this.$refs['globalTable']._vxeTable()
      console.log(vxeTable)
    }
  }
}
</script>

<style scoped>

</style>
