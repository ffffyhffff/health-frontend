<template>
  <el-container class="app-layout">
    <!-- 顶部导航 -->
    <el-header class="topbar">
      <div class="topbar__left">
        <img src="/vite.svg" class="logo" alt="logo" />
        <span class="brand">个人健康系统</span>
        <el-menu
          mode="horizontal"
          :default-active="activeTop"
          class="topnav"
          router
          :ellipsis="false"
        >
          <el-menu-item index="/app/news"><el-icon><Reading /></el-icon> 健康资讯</el-menu-item>
          <el-menu-item index="/app/recipes"><el-icon><KnifeFork /></el-icon> 食谱</el-menu-item>
          <el-menu-item index="/app/health-consult"><el-icon><ChatDotRound /></el-icon> 健康咨询</el-menu-item>
          <el-menu-item index="/app/health-record"><el-icon><Memo /></el-icon> 健康记录</el-menu-item>
        </el-menu>
      </div>
      <div class="topbar__right">
        <el-dropdown>
          <span class="user">
            <el-avatar :size="28" :src="avatarSrc" />
            <span class="user-name">Hi, {{ username }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="goProfile">
                <el-icon><User /></el-icon>
                个人中心
              </el-dropdown-item>
              <el-dropdown-item @click="goFavorites">
                <el-icon><Star /></el-icon>
                我的收藏
              </el-dropdown-item>
              <el-dropdown-item v-if="adminToken" @click="goAdmin">
                <el-icon><Setting /></el-icon>
                管理后台
              </el-dropdown-item>
              <el-dropdown-item divided @click="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 主内容 -->
    <el-main class="main">
      <div class="bg"></div>
      <div class="content">
        <router-view />
      </div>
    </el-main>
  </el-container>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Reading, KnifeFork, ChatDotRound, Memo, UserFilled, User, Star, SwitchButton, Setting } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 获取用户信息
import { resolveImageUrl } from '@/utils/image'
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const username = ref(userInfo.username || '用户')
const avatarSrc = ref(userInfo.avatar ? resolveImageUrl(userInfo.avatar) : '')
const adminToken = ref(localStorage.getItem('adminToken'))

const activeTop = computed(() =>
  route.fullPath.startsWith('/app/') ? `/app/${route.fullPath.split('/')[2]}` : '/app/news'
)

watch(() => route.fullPath, () => {
  const ui = JSON.parse(localStorage.getItem('userInfo') || '{}')
  username.value = ui.username || '用户'
  avatarSrc.value = ui.avatar ? resolveImageUrl(ui.avatar) : ''
})

const goProfile = () => {
  router.push('/app/profile')
}

const goFavorites = () => {
  router.push('/app/favorites')
}

const goAdmin = () => {
  router.push('/admin/dashboard')
}

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  ElMessage.success('已退出')
  router.replace('/login')
}
</script>

<style scoped>
.app-layout { height: 100vh; }

/* 顶部导航配色：继承登录页的深色系渐变 */
.topbar {
  display: flex; align-items: center; justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #eef2f7;
  color: #0f172a;
  height: 56px;
  padding: 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
}
.topbar__left { display: flex; align-items: center; gap: 14px; }
.logo { width: 20px; height: 20px; }
.brand { font-weight: 800; letter-spacing: 0.2px; color: #111827; margin-right: 8px; }
.topnav { background: transparent; border-bottom: none; margin-left: 8px; --el-menu-active-color: #16a34a; }
.topnav :deep(.el-menu-item) { color: #334155; font-weight: 600; }
.topnav :deep(.el-menu-item.is-active) { color: #16a34a; }
.topnav :deep(.el-menu-item:hover) { background: rgba(22,163,74,0.08); border-radius: 8px; }
.topbar__right { display: flex; align-items: center; gap: 12px; }
.user { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
.user-name { color: #334155; font-size: 13px; }

/* 主内容背景采用登录页的柔和渐变（弱化强度作为衬底） */
.main { 
  position: relative; 
  padding: 0; 
  overflow-y: auto;
  height: calc(100vh - 56px);
}
.bg { 
  position: absolute; 
  inset: 0; 
  pointer-events: none; 
  z-index: 0;
  background: radial-gradient(900px 420px at 8% 10%, rgba(99,102,241,0.10), transparent 60%),
              radial-gradient(900px 420px at 92% 92%, rgba(16,185,129,0.10), transparent 60%),
              linear-gradient(135deg, #f8fafc 0%, #f0f9ff 40%, #fdf2f8 100%);
}
.content { 
  position: relative; 
  z-index: 1; 
  padding: 12px 20px;
  min-height: 100%;
}
</style>
