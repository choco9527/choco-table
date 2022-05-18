<template>
  <div id="app">
    <h2>APP表格</h2>
    <global-table
      ref="globalTable"
      show-context-menu
      :show-setting-export="false"
      :show-menu-edit="false"
      :self-get-config="getConfig"
      :self-get-list="getList"
      :config="{tableId: 'self_application_list', isSelf:true}"
      :self-cell-formats="selfCellFormats"
      :col-config-map="colConfigMap"
      :self-options="selfOptions"
      el-size="mini"
      table-size="small"
    />
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
          return { config }
        } catch (e) {
          console.log(e)
        }
      },
      getList: async(data) => {
        try {
          const resData = await getList(data)
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

  img{
    vertical-align: middle;
  }
}

</style>
