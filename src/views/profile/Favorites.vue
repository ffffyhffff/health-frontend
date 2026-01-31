<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="header-flex">
          <span class="page-title">⭐ 我的收藏</span>
          <el-radio-group v-model="activeTab" @change="handleTabChange">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="news">资讯</el-radio-button>
            <el-radio-button label="recipes">食谱</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <div v-if="filteredItems.length === 0" class="empty">
        <el-empty description="还没有收藏内容" />
      </div>

      <div v-else class="favorites-grid">
        <el-card
          v-for="item in filteredItems"
          :key="item.id"
          class="favorite-item"
          shadow="hover"
          @click="goToDetail(item)"
        >
          <div class="item-cover" :style="{ backgroundImage: `url(${item.cover})` }">
            <el-tag :type="item.type === 'news' ? 'primary' : 'success'" class="item-type">
              {{ item.type === 'news' ? '资讯' : '食谱' }}
            </el-tag>
          </div>
          <div class="item-content">
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-desc">{{ item.desc }}</p>
            <div class="item-footer">
              <div class="item-info">
                <el-icon><View /></el-icon>
                <span>{{ item.views }}</span>
              </div>
              <el-button
                type="danger"
                link
                size="small"
                @click.stop="removeFavorite(item.id)"
              >
                <el-icon><Delete /></el-icon>
                取消收藏
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Delete } from '@element-plus/icons-vue'
import { getMyFavorites } from '@/api'

const router = useRouter()
const activeTab = ref('all')

// 收藏数据
const favorites = ref([])

// 加载收藏列表
const loadFavorites = async () => {
  try {
    const data = await getMyFavorites({ 
      type: activeTab.value === 'all' ? null : activeTab.value,
      current: 1, 
      pageSize: 100 
    })
    const records = Array.isArray(data?.records) ? data.records : []
    favorites.value = records.map(item => {
      const isRecipe = Object.prototype.hasOwnProperty.call(item, 'difficulty')
      const preview = item.description || item.content || ''
      return {
        id: item.id,
        type: isRecipe ? 'recipes' : 'news',
        title: item.title || '',
        desc: preview ? preview.substring(0, 50) : '',
        cover: item.cover || '',
        views: item.views || 0,
        collectTime: item.createdTime || new Date().toLocaleString('zh-CN')
      }
    })
  } catch (error) {
    console.error('加载收藏列表失败:', error)
    favorites.value = []
  }
}

onMounted(() => {
  loadFavorites()
})

const filteredItems = computed(() => {
  if (activeTab.value === 'all') return favorites.value
  return favorites.value.filter(item => item.type === activeTab.value)
})

function handleTabChange() {
  loadFavorites()
}

function goToDetail(item) {
  if (item.type === 'news') {
    router.push(`/app/news/${item.id}`)
  } else {
    router.push(`/app/recipes/${item.id}`)
  }
}

function removeFavorite(id) {
  ElMessageBox.confirm('确定要取消收藏吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = favorites.value.findIndex(item => item.id === id)
    if (index > -1) {
      favorites.value.splice(index, 1)
      ElMessage.success('已取消收藏')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.page {
  padding: 20px;
  background: transparent;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.empty {
  padding: 60px 0;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.favorite-item {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.favorite-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.favorite-item :deep(.el-card__body) {
  padding: 0;
}

.item-cover {
  width: 100%;
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
}

.item-type {
  position: absolute;
  top: 12px;
  right: 12px;
}

.item-content {
  padding: 16px;
}

.item-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

:deep(.el-card) {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-radio-button__inner) {
  border-radius: 6px;
  padding: 8px 16px;
}
</style>
