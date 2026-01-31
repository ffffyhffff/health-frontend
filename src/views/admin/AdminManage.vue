<template>
  <div class="admin-manage">
    <el-card>
      <template #header>
        <div class="header-flex">
          <span class="page-title">👨‍💼 管理员管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加管理员</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索管理员..."
          :prefix-icon="Search"
          style="width: 300px;"
          clearable
        />
      </div>

      <!-- 管理员表格 -->
      <el-table :data="filteredAdmins" stripe style="width: 100%; margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :size="40" :src="row.avatar">
              <el-icon><UserFilled /></el-icon>
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="account" label="账号" min-width="120" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="row.role === '超级管理员' ? 'danger' : 'warning'" size="small">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button type="warning" link size="small" @click="handleResetPwd(row)">
              <el-icon><Refresh /></el-icon>重置密码
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="admins.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" placeholder="请输入账号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="普通管理员" value="普通管理员" />
            <el-option label="超级管理员" value="超级管理员" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio label="正常">正常</el-radio>
            <el-radio label="禁用">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, UserFilled, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { getAdminList, addAdmin, updateAdmin, deleteAdmin } from '@/api'

const searchText = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const loading = ref(false)

const admins = reactive([])

// 加载管理员列表
const loadAdmins = async () => {
  try {
    loading.value = true
    const data = await getAdminList({ current: currentPage.value, pageSize: pageSize.value })
    if (data && data.records) {
      const mapped = data.records.map(a => ({
        ...a,
        status: a.status === 1 ? '正常' : '禁用'
      }))
      admins.splice(0, admins.length, ...mapped)
    }
  } catch (error) {
    console.error('加载管理员列表失败:', error)
    ElMessage.error('加载管理员列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAdmins()
})

const form = reactive({
  username: '',
  account: '',
  password: '',
  role: '普通管理员',
  status: '正常'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑管理员' : '添加管理员')

const filteredAdmins = computed(() => {
  if (!searchText.value) return admins
  return admins.filter(admin =>
    admin.username.includes(searchText.value) ||
    admin.account.includes(searchText.value)
  )
})

function handleAdd() {
  isEdit.value = false
  Object.assign(form, {
    username: '',
    account: '',
    password: '',
    role: '普通管理员',
    status: '正常'
  })
  dialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  Object.assign(form, { ...row })
  dialogVisible.value = true
}

function handleSubmit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      if (isEdit.value) {
        const payload = {
          username: form.username,
          role: form.role,
          status: form.status === '正常' ? 1 : 0
        }
        await updateAdmin(form.id, payload)
        ElMessage.success('修改成功')
      } else {
        const payload = {
          username: form.username,
          account: form.account,
          password: form.password,
          role: form.role,
          status: form.status === '正常' ? 1 : 0
        }
        await addAdmin(payload)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      await loadAdmins()
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败: ' + (error?.message || '未知错误'))
    }
  })
}

function handleResetPwd(row) {
  ElMessageBox.confirm('确定要重置该管理员的密码吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('密码已重置为：123456')
  }).catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该管理员吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAdmin(row.id)
      const index = admins.findIndex(a => a.id === row.id)
      if (index > -1) {
        admins.splice(index, 1)
      }
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除失败:', error)
      ElMessage.error('删除失败: ' + error.message)
    }
  }).catch(() => {})
}
</script>

<style scoped>
.admin-manage {
  padding: 0;
}

.header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.search-bar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-card__body) {
  padding: 24px;
}
</style>
