# choco-table
 基于Vue Vxe table 的2次开发表格组件

> base on vxe table

## install

``` bash
npm install choco-table
```

## 使用

``` bash
// main.js
import GlobalTable from 'choco-table'
import '@choco-table/lib/packages.css'

/* 定义默认请求方法，（在非自定义组件方法时使用） */
import { getConfig, getList, searchPageOptions, exportTable, submitForm } from '@/mock-api/table'
const options = {
  getConfig, // 全局获取tableConfig方法
  getData: getList, // 全局获取tableData方法
  submitForm, // 提交表单
  searchOptions: searchPageOptions, // 搜索selectOption选项
  exportTable // 导出表格
}

Vue.use(GlobalTable, options) // 加载全局配置

// App.vue
<global-table :config="{ tableId: '8848' }" />
```

![assets/images/img.png](assets/images/img.png)
![assets/images/img2.png](assets/images/img2.png)

## 示例项目
``` bash
npm i
npm run dev // 启动示例项目
```
