<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  name: 'Home',
  methods: {
    logout() {
      // 清空客户端 token
      window.sessionStorage.clear()
      // 重定向到登陆页
      this.$router.push('/login')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped></style>
