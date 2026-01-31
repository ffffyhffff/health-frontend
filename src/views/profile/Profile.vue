<template>
  <div class="page">
    <!-- 用户信息卡片 -->
    <el-card class="user-card">
      <div class="user-header">
        <el-avatar :size="80" :src="userInfo.avatar">
          <el-icon :size="40"><UserFilled /></el-icon>
        </el-avatar>
        <div class="user-info">
          <h2 class="user-name">{{ userInfo.username }}</h2>
          <p class="user-account">@{{ userInfo.account }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-value">{{ stats.collections }}</span>
              <span class="stat-label">收藏</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.records }}</span>
              <span class="stat-label">记录</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.days }}</span>
              <span class="stat-label">天数</span>
            </div>
          </div>
        </div>
        <el-button type="primary" @click="editDialogVisible = true">编辑资料</el-button>
      </div>
    </el-card>

    <!-- 功能菜单 -->
    <el-row :gutter="16" class="menu-row">
      <el-col :span="8" v-for="menu in menus" :key="menu.title">
        <el-card class="menu-card" shadow="hover" @click="handleMenuClick(menu)">
          <div class="menu-icon" :style="{ background: menu.color + '20', color: menu.color }">
            <el-icon :size="28"><component :is="menu.icon" /></el-icon>
          </div>
          <div class="menu-content">
            <h3 class="menu-title">{{ menu.title }}</h3>
            <p class="menu-desc">{{ menu.desc }}</p>
          </div>
          <el-icon class="menu-arrow"><ArrowRight /></el-icon>
        </el-card>
      </el-col>
    </el-row>

    <!-- 我的发布 -->
    <el-card>
      <template #header>
        <div class="header-flex">
          <span class="section-title">📝 我的发布</span>
          <el-radio-group v-model="publishTab" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="news">资讯</el-radio-button>
            <el-radio-button label="recipes">食谱</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <div v-if="filteredPublishes.length === 0" class="empty-state">
        <el-empty description="还没有发布内容">
          <el-button type="primary" @click="goPublish">去发布</el-button>
        </el-empty>
      </div>
      
      <div v-else class="publish-list">
        <div 
          v-for="item in filteredPublishes" 
          :key="item.id"
          class="publish-item"
          @click="viewPublish(item)"
        >
          <div class="publish-cover" :style="{ backgroundImage: `url(${item.cover})` }">
            <el-tag :type="item.type === 'news' ? 'primary' : 'success'" size="small">
              {{ item.type === 'news' ? '资讯' : '食谱' }}
            </el-tag>
          </div>
          <div class="publish-content">
            <h4 class="publish-title">{{ item.title }}</h4>
            <p class="publish-desc">{{ item.desc }}</p>
            <div class="publish-meta">
              <div class="meta-item">
                <el-icon><View /></el-icon>
                <span>{{ item.views }} 浏览</span>
              </div>
              <div class="meta-item">
                <el-icon><Clock /></el-icon>
                <span>{{ item.createTime }}</span>
              </div>
              <div class="publish-actions">
                <el-button type="primary" link size="small" @click.stop="editPublish(item)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click.stop="deletePublish(item)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 最近活动 -->
    <el-card>
      <template #header>
        <div class="header-flex">
          <span class="section-title">📌 最近活动</span>
        </div>
      </template>
      <el-timeline>
        <el-timeline-item
          v-for="activity in activities"
          :key="activity.id"
          :timestamp="activity.time"
          placement="top"
          :color="activity.color"
        >
          <el-card shadow="hover">
            <h4>{{ activity.title }}</h4>
            <p style="margin: 8px 0 0; color: #6b7280; font-size: 13px;">{{ activity.content }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 编辑资料对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑个人资料" width="500px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :auto-upload="false"
            :on-change="handleAvatarChange"
          >
            <el-avatar :size="80" :src="editForm.avatar">
              <el-icon :size="40"><UserFilled /></el-icon>
            </el-avatar>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="账号">
          <el-input v-model="editForm.account" disabled />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="editForm.bio" type="textarea" :rows="3" placeholder="介绍一下自己..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProfile">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UserFilled, Star, DocumentCopy, Setting, ArrowRight, ChatDotRound, View, Clock, Edit, Delete } from '@element-plus/icons-vue'
import { getUserProfile, updateUserProfile, getMyPosts, deleteNews, deleteRecipe, uploadImage } from '@/api'
import { resolveImageUrl } from '@/utils/image'

const router = useRouter()
const editDialogVisible = ref(false)
const publishTab = ref('all')

// 监听发布类型变化
watch(publishTab, () => {
  loadMyPosts()
})
const loading = ref(false)

// 用户信息
const userInfo = reactive({
  username: '',
  account: '',
  avatar: '',
  bio: '热爱生活，关注健康'
})

const editForm = reactive({
  username: '',
  account: '',
  avatar: '',
  bio: ''
})

const stats = reactive({
  collections: 12,
  records: 28,
  days: 45
})

// 加载用户信息
const loadUserProfile = async () => {
  try {
    loading.value = true
    const data = await getUserProfile()
    if (data) {
      Object.assign(userInfo, {
        username: data.username,
        account: data.account,
        avatar: resolveImageUrl(data.avatar || ''),
        bio: data.bio || '热爱生活，关注健康'
      })
      Object.assign(editForm, userInfo)
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    // 如果加载失败，使用 localStorage 的数据
    const savedUserInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    if (savedUserInfo.username) {
      Object.assign(userInfo, {
        username: savedUserInfo.username,
        account: savedUserInfo.account || 'health_user',
        avatar: '',
        bio: '热爱生活，关注健康'
      })
      Object.assign(editForm, userInfo)
    }
  } finally {
    loading.value = false
  }
}

// 我的发布
const publishes = reactive([])

// 加载发布列表
const loadMyPosts = async () => {
  try {
    const data = await getMyPosts({ 
      type: publishTab.value === 'all' ? null : publishTab.value,
      current: 1, 
      pageSize: 100 
    })
    if (data && data.records) {
      publishes.splice(0, publishes.length, ...data.records.map(item => {
        const isRecipe = typeof item.difficulty !== 'undefined'
        return {
          id: item.id,
          type: isRecipe ? 'recipes' : 'news',
          title: item.title,
          desc: isRecipe ? (item.description || '') : (item.content?.substring(0, 50) || ''),
          cover: resolveImageUrl(item.cover),
          views: item.views || 0,
          createTime: item.createdTime || new Date().toLocaleString('zh-CN')
        }
      }))
    }
  } catch (error) {
    console.error('加载发布列表失败:', error)
  }
}

onMounted(() => {
  loadUserProfile()
  loadMyPosts()
})

const filteredPublishes = computed(() => {
  if (publishTab.value === 'all') return publishes
  return publishes.filter(item => item.type === publishTab.value)
})

const menus = [
  { title: '我的收藏', desc: '查看收藏的内容', icon: Star, color: '#f59e0b', path: '/app/favorites' },
  { title: '健康记录', desc: '我的健康数据', icon: DocumentCopy, color: '#10b981', path: '/app/health-record' },
  { title: '健康咨询', desc: '智能对话助手', icon: ChatDotRound, color: '#6366f1', path: '/app/health-consult' },
  { title: '系统设置', desc: '偏好和隐私', icon: Setting, color: '#8b5cf6', path: '/app/settings' },
]

const activities = [
  { id: 1, title: '添加健康记录', content: '记录了今天的体重、步数等数据', time: '2025-01-12 09:30', color: '#10b981' },
  { id: 2, title: '收藏食谱', content: '收藏了"鸡胸牛油果碗"', time: '2025-01-11 14:20', color: '#f59e0b' },
  { id: 3, title: '阅读资讯', content: '查看了"有氧运动入门指南"', time: '2025-01-10 20:15', color: '#3b82f6' },
  { id: 4, title: '健康咨询', content: '咨询了关于睡眠质量的问题', time: '2025-01-09 18:00', color: '#6366f1' },
]

function handleMenuClick(menu) {
  if (menu.path) {
    router.push(menu.path)
  }
}

async function handleAvatarChange(file) {
  const formData = new FormData()
  formData.append('file', file.raw)
  const url = await uploadImage(formData)
  editForm.avatar = resolveImageUrl(url)
}

function saveProfile() {
  Object.assign(userInfo, editForm)
  
  // 调用后端 API 更新用户信息
  updateUserProfile({
    username: editForm.username,
    avatar: editForm.avatar
  }).then(() => {
    localStorage.setItem('userInfo', JSON.stringify({
      username: editForm.username,
      account: editForm.account,
      avatar: editForm.avatar
    }))
    editDialogVisible.value = false
    ElMessage.success('保存成功')
  }).catch(error => {
    console.error('保存失败:', error)
    ElMessage.error('保存失败: ' + error.message)
  })
}

function goPublish() {
  router.push('/app/news/new')
}

function viewPublish(item) {
  if (item.type === 'news') {
    router.push(`/app/news/${item.id}`)
  } else {
    router.push(`/app/recipes/${item.id}`)
  }
}

function editPublish(item) {
  if (item.type === 'news') {
    router.push(`/app/news/new?id=${item.id}`)
  } else {
    router.push(`/app/recipes/new?id=${item.id}`)
  }
}

function deletePublish(item) {
  ElMessageBox.confirm('确定要删除这篇内容吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      if (item.type === 'news') {
        await deleteNews(item.id)
      } else {
        await deleteRecipe(item.id)
      }
      
      const index = publishes.findIndex(p => p.id === item.id)
      if (index > -1) {
        publishes.splice(index, 1)
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
.page {
  padding: 20px;
  background: transparent;
}

/* 用户卡片 */
.user-card {
  margin-bottom: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.user-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-info {
  flex: 1;
}

.user-name {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.user-account {
  margin: 0 0 12px;
  font-size: 14px;
  color: #6b7280;
}

.user-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* 功能菜单 */
.menu-row {
  margin-bottom: 20px;
}

.menu-card {
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.menu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.menu-card :deep(.el-card__body) {
  padding: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.menu-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-content {
  flex: 1;
}

.menu-title {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.menu-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.menu-arrow {
  color: #9ca3af;
  font-size: 18px;
  flex-shrink: 0;
}

/* 通用样式 */
.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

:deep(.el-card) {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-timeline-item__timestamp) {
  color: #6b7280;
  font-size: 12px;
}

:deep(.el-timeline-item__wrapper h4) {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.avatar-uploader {
  cursor: pointer;
}

.avatar-uploader :deep(.el-upload) {
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}

.avatar-uploader :deep(.el-avatar):hover {
  opacity: 0.8;
}

/* 发布列表 */
.empty-state {
  padding: 40px 0;
}

.publish-list {
  display: grid;
  gap: 16px;
}

.publish-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.publish-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.publish-cover {
  width: 200px;
  height: 120px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  position: relative;
  flex-shrink: 0;
}

.publish-cover .el-tag {
  position: absolute;
  top: 8px;
  right: 8px;
}

.publish-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.publish-title {
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

.publish-desc {
  margin: 0 0 auto;
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.publish-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  margin-top: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.publish-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
</style>
