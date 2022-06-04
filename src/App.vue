<template>
  <div id="app">
    <h2>TABLE</h2>
    <div class="table-wrap">
      <global-table
        ref="globalTable"
        show-context-menu
        :show-setting-export="false"
        :show-menu-edit="false"
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
        :row-config="{isCurrent: true, isHover: true}"
        @handleTableSelectionChange="selectionChange"
      >
        <template v-slot:filterBack>
          <span class="batch">
            <!--     使用 class batch 维持样式-->
            <el-button type="primary" size="mini" @click="setCurrentRow">标记指定行</el-button>
            <el-button type="primary" size="mini" @click="clearCurrentRow">清除指定行</el-button>
          </span>
        </template>
        <template v-slot:tableBack>
          <span style="color: #999">数据不是实时的。过去3小时内的数据可能会有延时</span>
        </template>
      </global-table>
    </div>
    <!--    全局安装可使用内置beauty-dialog组件-->
    <beauty-dialog :append-to-body="false" top="50px" width="635px" :visible.sync="showWordInfoDialog">
      <template v-slot:titleSelf>
        <span>关键词</span>
      </template>
      <div style="height: 300px;padding: 12px 20px">
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
import { getConfig, getList } from '@/mock-api/table'
import { pureColumns, pureData } from './utils/tableData'

export default {
  name: 'App',
  data() {
    return {
      msg: '',
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
      },
      colConfigMap: {
        name: { minWidth: 220, align: 'left' },
        cp_id: { width: 120 },
        date: { minWidth: 100 },
        images: { minWidth: 150 },
        keywords: { width: 120, fixed: 'right' }
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
      console.log('show')
      this.showWordInfoDialog = true
    },
    closeWordDialog() {
      this.showWordInfoDialog = false
    },
    setCurrentRow() {
      const data = this.$refs['globalTable'].getData()
      const ids1 = data.filter(v => v.num > 600).map(v => v._X_ROW_KEY)
      const ids2 = data.filter(v => v.num > 500 && v.num < 600).map(v => v._X_ROW_KEY)
      this.$refs['globalTable'].setActiveRows(ids1, 'warning')
      // this.$refs['globalTable'].setActiveRows(ids2, 'blue')
    },
    clearCurrentRow() {
      // this.$refs['globalTable'].clearActiveRows('blue')
      this.$refs['globalTable'].clearActiveRows('warning')
    }
  }
}
</script>

<style lang="scss">
body{
  #app {
    padding: var(--gutter_14-16) var(--gutter_24-48);
    background: #fff;
    min-height: calc(100vh - 180px);
    height: calc(100vh - 18px);
    box-sizing: border-box;
    margin: 0;
    >h2{
      color: #3e3d3d;
      margin: 10px 0;
    }
    .table-wrap{
      height: calc(100% - 40px);
    }
    img{
      vertical-align: middle;
    }
  }
}

</style>
