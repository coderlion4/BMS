<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column label="#" type="index" />
        <el-table-column label="姓名" prop="username" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="电话" prop="mobile" />
        <el-table-column label="角色" prop="role_name" />
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            />
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            />
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button type="warning" icon="el-icon-setting" size="mini" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile" />
        </el-form-item>
      </el-form>

      <!-- 底部 确定/取消 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="eidtDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    return {
      queryInfo: {
        // 请求用户列表的参数
        query: '',
        pagenum: 1, // 当前页码
        pagesize: 2 // 每页显示的数据量
      },
      userList: [], // 用户列表
      total: 0, // 数据总数
      addDialogVisible: false, // 控制添加用户对话框的显示/隐藏
      addForm: {
        // 添加用户的表单
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      addFormRules: {
        // 添加表单验证规则对象
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '密码的长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请输入邮箱地址',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+([a-zA-Z0-9_-])+/
              if (regEmail.test(value)) return callback()
              callback(new Error('邮箱格式不合法'))
            },
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
              if (regMobile.test(value)) return callback()
              callback(new Error('手机格式不合法'))
            },
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false, // 控制修改用户对话框的 显示/隐藏
      editForm: {}, // 查询到的用户信息
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱地址',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+([a-zA-Z0-9_-])+/
              if (regEmail.test(value)) return callback()
              callback(new Error('邮箱格式不合法'))
            },
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
          },
          {
            validator: (rule, value, callback) => {
              const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
              if (regMobile.test(value)) return callback()
              callback(new Error('手机格式不合法'))
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    /**
     * 请求用户数据
     */
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.userList = res.data.users
      this.total = res.data.total
    },

    /**
     * 监听 switch 开关状态的改变
     */
    async userStateChanged(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )

      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      return this.$message.success(res.meta.msg)
    },

    /**
     * 监听 pagesize 改变事件
     */
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },

    /**
     * 监听 页码值 改变事件
     */
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    /**
     * 监听用户对话框关闭事件
     * 重置表单
     */
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    /**
     * 添加新用户
     */
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return // 预校验不通过
        const { data: res } = await this.$http.post('users', this.addForm)

        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        // 隐藏对话框
        this.addDialogVisible = false
        // 重新获取用户列表
        this.getUserList()
        this.$message.success(res.meta.msg)
      })
    },

    /**
     * 编辑用户对话框
     */
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    /**
     * 监听修改用户对话框的关闭事件
     */
    eidtDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    /**
     * 修改用户信息并提交
     */
    editUserInfo(id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success(res.meta.msg)
      })
    },

    /**
     * 删除用户信息
     */
    async removeUserById(id) {
      // 弹框确定
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult === 'confirm') {
        // 确定删除
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.getUserList()
        this.$message.success('删除成功！')
      } else if (confirmResult === 'cancel') {
        // 取消删除
        return this.$message.info('已取消删除')
      }
    }
  }
}
</script>

<style lang="less" scoped></style>
