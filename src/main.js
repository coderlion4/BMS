import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './plugins/element.js'
import './network'

// 全局样式
import 'assets/css/global.css'

// 字体图标
import 'assets/fonts/iconfont.css'

// 树型表格
import TreeTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', TreeTable)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
