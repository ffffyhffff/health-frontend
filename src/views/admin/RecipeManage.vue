<template>
  <div class="recipe-manage">
    <el-card>
      <template #header>
        <div class="header-flex">
          <span class="page-title">🍳 食谱管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加食谱</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索食谱标题..."
          :prefix-icon="Search"
          style="width: 300px; margin-right: 12px;"
          clearable
        />
        <el-select v-model="categoryFilter" placeholder="分类筛选" style="width: 120px; margin-right: 12px;" clearable>
          <el-option label="早餐" value="早餐" />
          <el-option label="午餐" value="午餐" />
          <el-option label="晚餐" value="晚餐" />
          <el-option label="小吃" value="小吃" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px;" clearable>
          <el-option label="已发布" value="已发布" />
          <el-option label="草稿" value="草稿" />
        </el-select>
      </div>

      <!-- 食谱表格 -->
      <el-table :data="filteredRecipes" stripe style="width: 100%; margin-top: 20px;">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              :src="row.cover"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 6px;"
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="120" />
        <el-table-column prop="category" label="分类" width="100">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="100">
          <template #default="{ row }">
            <el-tag 
              size="small" 
              :type="row.difficulty === '简单' ? 'success' : (row.difficulty === '中等' ? 'warning' : 'danger')"
            >
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="views" label="浏览" width="100" />
        <el-table-column prop="likes" label="点赞" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已发布' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>查看
            </el-button>
            <el-button type="success" link size="small" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button 
              :type="row.status === '已发布' ? 'warning' : 'success'" 
              link 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === '已发布' ? '下架' : '发布' }}
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
          :total="recipes.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="食谱详情"
      width="800px"
    >
      <div class="recipe-detail">
        <el-image
          :src="currentRecipe.cover"
          fit="cover"
          style="width: 100%; height: 300px; border-radius: 12px; margin-bottom: 20px;"
        />
        <h2>{{ currentRecipe.title }}</h2>
        <div class="meta-info">
          <el-tag size="small" type="success">{{ currentRecipe.category }}</el-tag>
          <el-tag size="small" style="margin-left: 8px;">{{ currentRecipe.difficulty }}</el-tag>
          <span style="margin-left: 16px; color: #6b7280;">作者：{{ currentRecipe.author }}</span>
        </div>
        <el-divider />
        <div class="content">{{ currentRecipe.description }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, View, Edit, Delete } from '@element-plus/icons-vue'
import { getAdminRecipeList, deleteRecipe } from '@/api'
import { resolveImageUrl } from '@/utils/image'

const searchText = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const viewDialogVisible = ref(false)
const loading = ref(false)

const recipes = reactive([])

// 加载食谱列表
const loadRecipes = async () => {
  try {
    loading.value = true
    const data = await getAdminRecipeList({ current: currentPage.value, pageSize: pageSize.value })
    if (data && data.records) {
      const records = data.records.map(r => ({
        ...r,
        cover: resolveImageUrl(r.cover),
        author: r.author || r.username || ''
      }))
      recipes.splice(0, recipes.length, ...records)
    }
  } catch (error) {
    console.error('加载食谱列表失败:', error)
    ElMessage.error('加载食谱列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecipes()
})

const currentRecipe = reactive({
  title: '',
  author: '',
  cover: '',
  category: '',
  difficulty: '',
  description: ''
})

const filteredRecipes = computed(() => {
  let result = recipes
  
  if (searchText.value) {
    result = result.filter(r => r.title.includes(searchText.value))
  }
  
  if (categoryFilter.value) {
    result = result.filter(r => r.category === categoryFilter.value)
  }
  
  if (statusFilter.value) {
    result = result.filter(r => r.status === statusFilter.value)
  }
  
  return result
})

function handleAdd() {
  ElMessage.info('跳转到食谱编辑页面')
}

function handleView(row) {
  Object.assign(currentRecipe, row)
  viewDialogVisible.value = true
}

function handleEdit(row) {
  ElMessage.info('编辑食谱：' + row.title)
}

function handleToggleStatus(row) {
  const newStatus = row.status === '已发布' ? '草稿' : '已发布'
  const action = newStatus === '已发布' ? '发布' : '下架'
  
  ElMessageBox.confirm(`确定要${action}这个食谱吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = newStatus
    ElMessage.success(`已${action}`)
  }).catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这个食谱吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteRecipe(row.id)
      const index = recipes.findIndex(r => r.id === row.id)
      if (index > -1) {
        recipes.splice(index, 1)
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
.recipe-manage {
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

.recipe-detail h2 {
  margin: 0 0 12px;
  color: #111827;
  font-size: 24px;
}

.meta-info {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.content {
  color: #6b7280;
  line-height: 1.8;
  font-size: 14px;
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-card__body) {
  padding: 24px;
}
</style>
