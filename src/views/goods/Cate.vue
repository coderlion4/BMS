<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">
            添加分类
          </el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i
            v-if="!scope.row.cat_delete"
            class="el-icon-success"
            style="color: lightgreen;"
          />
          <i v-else class="el-icon-error" style="color: red;" />
        </template>

        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">
            一级
          </el-tag>
          <el-tag
            v-else-if="scope.row.cat_level === 1"
            type="success"
            size="mini"
          >
            二级
          </el-tag>
          <el-tag v-else type="warning" size="mini">
            三级
          </el-tag>
        </template>

        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.cat_id)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="removeCateById(scope.row.cat_id)"
          >
            删除
          </el-button>
        </template>
      </tree-table>

      <!-- 分类区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      />
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name" />
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedKeys"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">
          取 消
        </el-button>
        <el-button type="primary" @click="addCate">
          确 定
        </el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog
      title="修改分类"
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
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      queryInfo: {
        // 查询条件
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      cateList: [], // 商品分类数据列表
      columns: [
        // tree-table 列的定义
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template', // 将当前列定义为模版列
          template: 'isOk' // 当前列使用的模版名称
        },
        {
          label: '排序',
          type: 'template', // 将当前列定义为模版列
          template: 'order' // 当前列使用的模版名称
        },
        {
          label: '操作',
          type: 'template', // 将当前列定义为模版列
          template: 'opt' // 当前列使用的模版名称
        }
      ],
      addCatedialogVisible: false, // 控制添加分类对话框的 显示/隐藏
      addCateForm: {
        // 添加分类的表单数据
        cat_name: '',
        cat_pid: 0,
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },
      parentCateList: [], // 父级分类数据列表
      cascaderProps: {
        // 指定级联选择器的配置
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      selectedKeys: [], // 选中的父级分类的 id 列表
      editDialogVisible: false, // 控制修改分类对话框的 显示/隐藏
      editForm: {}, // 查询到的分类信息
      editFormRules: {
        cat_name: [
          {
            required: true,
            message: '分类名称不能为空',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    /**
     * 获取商品分类数据
     */
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.cateList = res.data.result
      this.total = res.data.total
    },

    /**
     * 监听 pagesize 改变
     */
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    /**
     * 监听 pagnum 改变
     */
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    /**
     * 添加分类按钮点击事件
     */
    showAddCateDialog() {
      this.getParentCateList()
      this.addCatedialogVisible = true
    },

    /**
     * 父级分类的数据列表
     */
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.parentCateList = res.data
    },

    /**
     * 选择项发生改变
     */
    parentCateChange() {
      if (this.selectedKeys.length) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },

    /**
     * 添加新分类
     */
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.getCateList()
        this.addCatedialogVisible = false
        this.$message.success(res.meta.msg)
      })
    },

    /**
     * 监听对话框关闭事件，重置表单数据
     */
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },

    /**
     * 编辑分类对话框
     */
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.editForm = res.data
      this.editDialogVisible = true
    },

    /**
     * 监听修改分类对话框的关闭事件
     */
    eidtDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    /**
     * 修改分类信息并提交
     */
    editCateInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.editDialogVisible = false
        this.getCateList()
        this.$message.success(res.meta.msg)
      })
    },

    /**
     * 删除分类信息
     */
    async removeCateById(id) {
      // 弹框确定
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类，是否继续？',
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
      const { data: res } = await this.$http.delete('categories/' + id)

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.getCateList()
      this.$message.success('删除成功！')
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
</style>
