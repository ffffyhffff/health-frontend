<template>
  <div class="user-manage">
    <el-card>
      <template #header>
        <div class="header-flex">
          <span class="page-title">👥 用户管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加用户</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索用户..."
          :prefix-icon="Search"
          style="width: 300px; margin-right: 12px;"
          clearable
        />
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px;" clearable>
          <el-option label="正常" value="正常" />
          <el-option label="禁用" value="禁用" />
        </el-select>
      </div>

      <!-- 用户表格 -->
      <el-table :data="filteredUsers" stripe style="width: 100%; margin-top: 20px;">
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
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="registerTime" label="注册时间" width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button 
              :type="row.status === '正常' ? 'warning' : 'success'" 
              link 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              <el-icon><Lock /></el-icon>{{ row.status === '正常' ? '禁用' : '启用' }}
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
          :total="users.length"
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
import { Plus, Search, UserFilled, Edit, Delete, Lock } from '@element-plus/icons-vue'
import { getUserList, deleteUser, register } from '@/api'

const searchText = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const loading = ref(false)

const users = reactive([])

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true
    const data = await getUserList({ current: currentPage.value, pageSize: pageSize.value })
    if (data && data.records) {
      const mapped = data.records.map(u => ({
        ...u,
        status: u.status === 1 ? '正常' : '禁用'
      }))
      users.splice(0, users.length, ...mapped)
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

const form = reactive({
  username: '',
  account: '',
  password: '',
  status: '正常'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const dialogTitle = computed(() => isEdit.value ? '编辑用户' : '添加用户')

const filteredUsers = computed(() => {
  let result = users
  
  if (searchText.value) {
    result = result.filter(user =>
      user.username.includes(searchText.value) ||
      user.account.includes(searchText.value)
    )
  }
  
  if (statusFilter.value) {
    result = result.filter(user => user.status === statusFilter.value)
  }
  
  return result
})

function handleAdd() {
  isEdit.value = false
  Object.assign(form, {
    username: '',
    account: '',
    password: '',
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
        const index = users.findIndex(u => u.id === form.id)
        if (index > -1) {
          Object.assign(users[index], form)
          ElMessage.success('修改成功')
        }
      } else {
        const payload = {
          username: form.username,
          account: form.account,
          password: form.password,
          confirm: form.password
        }
        await register(payload)
        ElMessage.success('添加成功')
      }
      dialogVisible.value = false
      await loadUsers()
    } catch (error) {
      console.error('添加失败:', error)
      ElMessage.error('添加失败: ' + (error?.message || '未知错误'))
    }
  })
}

function handleToggleStatus(row) {
  const newStatus = row.status === '正常' ? '禁用' : '正常'
  ElMessageBox.confirm(`确定要${newStatus}该用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = newStatus
    ElMessage.success(`已${newStatus}`)
  }).catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteUser(row.id)
      const index = users.findIndex(u => u.id === row.id)
      if (index > -1) {
        users.splice(index, 1)
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
.user-manage {
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
  display: flex;
  align-items: center;
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
