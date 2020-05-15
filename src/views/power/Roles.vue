<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">
            添加角色
          </el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1, index) in scope.row.children"
              :class="['bdbottom', !index ? 'bdtop' : '', 'vcenter']"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right" />
              </el-col>

              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, index) in item1.children"
                  :class="[index ? 'bdtop' : '', 'vcenter']"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right" />
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index" />
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="角色描述" prop="roleDesc" />
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >
              删除
            </el-button>

            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >
              分配权限
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addForm.roleDesc" />
        </el-form-item>
      </el-form>

      <!-- 底部 确定/取消 按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="eidtDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="80px"
      >
        <el-form-item label="角色ID">
          <el-input v-model="editForm.roleId" disabled />
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editForm.roleDesc" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisble"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树型控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      />

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      rolesList: [], // 所有角色列表数据
      addDialogVisible: false, // 控制添加角色对话框的 显示/隐藏
      addForm: {
        // 添加角色的表单
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false, // 控制修改角色对话框的 显示/隐藏
      editForm: {}, // 查询到的用户信息
      editFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入手机号码',
            trigger: 'blur'
          }
        ]
      },
      setRightDialogVisble: false, // 控制分配权限对话框的 显示/隐藏
      rightsList: [], // 所有权限的数据
      treeProps: {
        // 树型控件的绑定对象
        label: 'authName',
        children: 'children'
      },
      defKeys: [], // 默认选中的节点id值数组
      roleId: '' // 当前即将分配权限的角色id
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    /**
     * 获取所有角色的列表
     */
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.rolesList = res.data
    },

    /**
     * 监听用户对话框关闭事件
     * 重置表单
     */
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    /**
     * 添加新角色
     */
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return // 预校验不通过
        const { data: res } = await this.$http.post('roles', this.addForm)

        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.addDialogVisible = false
        this.getRolesList()
        this.$message.success(res.meta.msg)
      })
    },

    /**
     * 编辑用户对话框
     */
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)

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
    editRoleInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.editDialogVisible = false
        this.getRolesList()
        this.$message.success(res.meta.msg)
      })
    },

    /**
     * 删除用户信息
     */
    async removeRoleById(id) {
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
        const { data: res } = await this.$http.delete('roles/' + id)

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.getRolesList()
        this.$message.success('删除成功！')
      } else if (confirmResult === 'cancel') {
        // 取消删除
        return this.$message.info('已取消删除')
      }
    },

    /**
     * 根据对应id删除权限
     */
    async removeRightById(role, rightId) {
      // 弹框
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
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        role.children = res.data
        this.$message.success('删除成功！')
      } else if (confirmResult === 'cancel') {
        // 取消删除
        return this.$message.info('已取消删除')
      }
    },

    /**
     * 展示分配权限对话框
     */
    async showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限列表
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.rightsList = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisble = true
    },

    /**
     * 获取角色下所有三级权限的id, 并保存到 defKeys 中
     */

    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },

    /**
     * 监听分配权限对话框的关闭事件
     */
    setRightDialogClosed() {
      this.defKeys = []
    },

    /**
     * 为角色分配权限
     */
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success(res.meta.msg)
      this.getRolesList()
      this.setRightDialogVisble = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
