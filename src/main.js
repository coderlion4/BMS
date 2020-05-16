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

// 富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.use(VueQuillEditor)

Vue.filter('dateFormat', function(originVal) {
  originVal *= 1000
  const dt = new Date(originVal)
  const year = dt.getFullYear()
  const month = (dt.getMonth() + 1 + '').padStart(2, '0')
  const day = (dt.getDate() + '').padStart(2, '0')
  const hour = (dt.getHours() + '').padStart(2, '0')
  const minute = (dt.getMinutes() + '').padStart(2, '0')
  const second = (dt.getSeconds() + '').padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
