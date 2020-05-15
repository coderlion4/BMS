<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        type="warning"
        :closable="false"
        show-icon
      />

      <!-- 选择商品分类区域 -->
      <el-row class="cat-opt">
        <el-col>
          <span>选择商品分类：</span>

          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >
            添加参数
          </el-button>

          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(scope.row, index)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" />
            <el-table-column label="参数名称" prop="attr_name" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >
            添加属性
          </el-button>

          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(scope.row, index)"
                >
                  {{ item }}
                </el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                />
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >
                  + New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#" />
            <el-table-column label="属性名称" prop="attr_name" />
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="addParams">
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="editParams">
          确 定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      cateList: [], // 商品分类列表
      cateProps: {
        // 级联选择框配置
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      selectedCateKeys: [], // 级联选择框双向绑定
      activeName: 'many', // 激活的页签名称
      manyTableData: [], // 动态参数数据
      onlyTableData: [], // 静态属性数据
      addDialogVisible: false, // 控制添加对话框的 显示/隐藏
      addForm: {
        // 添加参数的表单数据
        attr_name: ''
      },
      addFormRules: {
        // 添加参数的表单数据
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormRules: {
        // 添加参数的表单数据
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },
      inputVisible: false,
      inputValue: ''
    }
  },
  computed: {
    isBtnDisabled() {
      return this.selectedCateKeys.length !== 3
    },

    cateId() {
      return this.isBtnDisabled ? null : this.selectedCateKeys[2]
    },

    titleText() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    /**
     * 获取所有商品分类列表
     */
    async getCateList() {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.cateList = res.data
    },

    /**
     * 级联选择框选中项变化
     */
    handleChange() {
      this.getParamsDate()
    },

    /**
     * tab 页签点击事件
     */
    handleTabClick() {
      this.getParamsDate()
    },

    /**
     * 获取参数的列表数据
     */
    async getParamsDate() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
      } else {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: this.activeName
            }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
          item.inputVisible = false
          item.inputValue = ''
        })

        if (this.activeName === 'many') {
          this.manyTableData = res.data
        } else {
          this.onlyTableData = res.data
        }
      }
    },

    /**
     * 监听添加对话框的关闭事件
     */
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    /**
     * 添加参数
     */
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.addDialogVisible = false
        this.getParamsDate()
        this.$message.success(res.meta.msg)
      })
    },

    /**
     * 展示修改的对话框
     */
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: {
            attr_sel: this.activeName
          }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },

    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.getParamsDate()
        this.$message.success(res.meta.msg)
        this.editDialogVisible = false
      })
    },

    async removeParams(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult === 'cancel') {
        // 取消删除
        return this.$message.info('已取消删除')
      }

      // 确定删除
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.getParamsDate()
      this.$message.success('删除成功！')
    },

    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }

      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      this.saveAttrVals(row)
    },

    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success(res.meta.msg)
    },

    showInput(row) {
      row.inputVisible = true
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },

    handleClose(row, index) {
      row.attr_vals.splice(index, 1)

      this.saveAttrVals(row)
    }
  }
}
</script>

<style lang="less" scoped>
.cat-opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
