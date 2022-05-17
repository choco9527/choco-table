<template>
  <div class="global-export">
    <div class="flex-wrap">
      <el-button class="button" type="primary" size="mini" @click="pageExport()">导出表格</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GlobalExport',
  methods: {
    pageExport() {
      this.$emit('pageExport')
    }
  }
}
</script>

<style lang="scss" scoped>
.global-export{
  height: 50px;
  float: left;
  margin-left: 20px;
  .flex-wrap{
    height: 100%;
    display: flex;
    justify-content: start;
    align-items: center;

  }
}
</style>
