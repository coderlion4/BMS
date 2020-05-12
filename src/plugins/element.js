import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.prototype.$message = Message
Vue.use(Button).use(Form).use(FormItem).use(Input)
