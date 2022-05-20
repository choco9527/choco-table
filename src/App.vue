<template>
  <div id="app">
    <h2>TABLE</h2>
    <global-table
      ref="globalTable"
      show-context-menu
      :show-setting-export="false"
      :show-menu-edit="false"
      :config="{tableId: 'self_application_list'}"
      :self-cell-formats="selfCellFormats"
      :col-config-map="colConfigMap"
      :self-options="selfOptions"
      el-size="mini"
      table-size="small"
    />
    <!--    <global-table-->
    <!--      ref="globalTable"-->
    <!--      show-context-menu-->
    <!--      :show-setting-export="false"-->
    <!--      :show-menu-edit="false"-->
    <!--      :self-get-config="getConfig"-->
    <!--      :self-get-list="getList"-->
    <!--      :config="{tableId: 'self_application_list'}"-->
    <!--      :self-cell-formats="selfCellFormats"-->
    <!--      :col-config-map="colConfigMap"-->
    <!--      :self-options="selfOptions"-->
    <!--      el-size="mini"-->
    <!--      table-size="small"-->
    <!--    />-->
  </div>
</template>

<script>
import { getConfig, getList } from '@/mock-api/table'

export default {
  name: 'App',
  data() {
    return {
      msg: '',
      getConfig: async() => {
        try {
          const config = await getConfig()
          console.log(config)
          return { config }
        } catch (e) {
          console.log(e)
        }
      },
      getList: async(query) => {
        try {
          console.log('请求参数', query) // 如有需要请自行合并
          const resData = await getList(query)
          return { data: resData }
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
        }
      },
      colConfigMap: {
        name: { minWidth: 120, align: 'left' },
        cp_id: { width: 120 }
      },
      selfOptions: {}
    }
  }
}
</script>

<style lang="scss">
#app {
  margin: var(--gutter_14-16) var(--gutter_24-48);
  background: #fff;
  min-height: calc(100vh - 180px);
  >h2{
    color: #3e3d3d;
    margin: 10px 0;
  }
  img{
    vertical-align: middle;
  }
}

</style>
