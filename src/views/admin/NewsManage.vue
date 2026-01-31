<template>
  <div class="news-manage">
    <el-card>
      <template #header>
        <div class="header-flex">
          <span class="page-title">📰 资讯管理</span>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加资讯</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchText"
          placeholder="搜索资讯标题..."
          :prefix-icon="Search"
          style="width: 300px; margin-right: 12px;"
          clearable
        />
        <el-select v-model="categoryFilter" placeholder="分类筛选" style="width: 120px; margin-right: 12px;" clearable>
          <el-option label="健康知识" value="健康知识" />
          <el-option label="营养饮食" value="营养饮食" />
          <el-option label="运动健身" value="运动健身" />
          <el-option label="疾病预防" value="疾病预防" />
        </el-select>
        <el-select v-model="statusFilter" placeholder="状态筛选" style="width: 120px;" clearable>
          <el-option label="已发布" value="已发布" />
          <el-option label="草稿" value="草稿" />
        </el-select>
      </div>

      <!-- 资讯表格 -->
      <el-table :data="filteredNews" stripe style="width: 100%; margin-top: 20px;">
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
            <el-tag size="small" type="primary">{{ row.category }}</el-tag>
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
          :total="newsList.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </el-card>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="viewDialogVisible"
      title="资讯详情"
      width="800px"
    >
      <div class="news-detail">
        <el-image
          :src="currentNews.cover"
          fit="cover"
          style="width: 100%; height: 300px; border-radius: 12px; margin-bottom: 20px;"
        />
        <h2>{{ currentNews.title }}</h2>
        <div class="meta-info">
          <el-tag size="small" type="primary">{{ currentNews.category }}</el-tag>
          <span style="margin-left: 16px; color: #6b7280;">作者：{{ currentNews.author }}</span>
        </div>
        <el-divider />
        <div class="content">{{ currentNews.content }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, View, Edit, Delete } from '@element-plus/icons-vue'
import { getAdminNewsList, deleteNews, updateNews } from '@/api'
import { resolveImageUrl } from '@/utils/image'

const searchText = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const viewDialogVisible = ref(false)
const loading = ref(false)

const newsList = reactive([])

// 加载资讯列表
const loadNews = async () => {
  try {
    loading.value = true
    const data = await getAdminNewsList({ current: currentPage.value, pageSize: pageSize.value })
    if (data && data.records) {
      const records = data.records.map(r => ({
        ...r,
        cover: resolveImageUrl(r.cover),
        author: r.author || r.username || ''
      }))
      newsList.splice(0, newsList.length, ...records)
    }
  } catch (error) {
    console.error('加载资讯列表失败:', error)
    ElMessage.error('加载资讯列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNews()
})

const currentNews = reactive({
  title: '',
  author: '',
  cover: '',
  category: '',
  content: ''
})

const filteredNews = computed(() => {
  let result = newsList
  
  if (searchText.value) {
    result = result.filter(n => n.title.includes(searchText.value))
  }
  
  if (categoryFilter.value) {
    result = result.filter(n => n.category === categoryFilter.value)
  }
  
  if (statusFilter.value) {
    result = result.filter(n => n.status === statusFilter.value)
  }
  
  return result
})

function handleAdd() {
  ElMessage.info('跳转到资讯编辑页面')
}

function handleView(row) {
  Object.assign(currentNews, row)
  viewDialogVisible.value = true
}

function handleEdit(row) {
  ElMessage.info('编辑资讯：' + row.title)
}

function handleToggleStatus(row) {
  const newStatus = row.status === '已发布' ? '草稿' : '已发布'
  const action = newStatus === '已发布' ? '发布' : '下架'
  
  ElMessageBox.confirm(`确定要${action}这篇资讯吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await updateNews(row.id, { status: newStatus })
      row.status = newStatus
      ElMessage.success(`已${action}`)
    } catch (error) {
      console.error('操作失败:', error)
      ElMessage.error('操作失败: ' + error.message)
    }
  }).catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm('确定要删除这篇资讯吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteNews(row.id)
      const index = newsList.findIndex(n => n.id === row.id)
      if (index > -1) {
        newsList.splice(index, 1)
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
.news-manage {
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

.news-detail h2 {
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
