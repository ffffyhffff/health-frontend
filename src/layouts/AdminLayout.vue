<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside width="240px" class="sidebar">
      <div class="admin-logo">
        <el-icon :size="24" color="#16a34a"><Setting /></el-icon>
        <span class="logo-text">管理后台</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="admin-menu"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据概览</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/admins">
          <el-icon><UserFilled /></el-icon>
          <span>管理员管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/recipes">
          <el-icon><KnifeFork /></el-icon>
          <span>食谱管理</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/news">
          <el-icon><Reading /></el-icon>
          <span>资讯管理</span>
        </el-menu-item>
      </el-menu>
      
      <div class="sidebar-footer">
        <el-button type="primary" link @click="backToApp">
          <el-icon><Back /></el-icon>
          返回前台
        </el-button>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container>
      <!-- 顶部导航 -->
      <el-header class="admin-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/admin/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="breadcrumbTitle">{{ breadcrumbTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-right">
          <el-tag type="danger" size="small">管理员</el-tag>
          <el-dropdown @command="handleCommand">
            <div class="admin-info">
              <el-avatar :size="32">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <span class="admin-name">{{ adminName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Setting, DataAnalysis, UserFilled, User,
  KnifeFork, Reading, Back, SwitchButton 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const adminInfo = JSON.parse(localStorage.getItem('adminInfo') || '{}')
const adminName = ref(adminInfo.username || '管理员')

const activeMenu = computed(() => route.path)

const breadcrumbTitle = computed(() => {
  return route.meta?.title || ''
})

function backToApp() {
  router.push('/app/news')
}

function handleCommand(command) {
  if (command === 'logout') {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
    ElMessage.success('已退出管理后台')
    router.replace('/login')
  } else if (command === 'profile') {
    router.push('/admin/profile')
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
  background: #f5f7fa;
}

/* 侧边栏 */
.sidebar {
  background: #001529;
  display: flex;
  flex-direction: column;
}

.admin-logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 1px;
}

.admin-menu {
  flex: 1;
  border-right: none;
  background: #001529;
  --el-menu-text-color: rgba(255, 255, 255, 0.65);
  --el-menu-hover-text-color: #ffffff;
  --el-menu-bg-color: #001529;
  --el-menu-hover-bg-color: rgba(255, 255, 255, 0.08);
  --el-menu-active-color: #16a34a;
  padding: 12px 0;
}

.admin-menu :deep(.el-menu-item) {
  margin: 4px 12px;
  border-radius: 6px;
}

.admin-menu :deep(.el-menu-item.is-active) {
  background: rgba(22, 163, 74, 0.2);
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.sidebar-footer .el-button {
  color: rgba(255, 255, 255, 0.65);
}

/* 顶部栏 */
.admin-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.admin-name {
  font-size: 14px;
  color: #374151;
}

/* 主内容 */
.admin-main {
  background: #f5f7fa;
  padding: 24px;
  overflow-y: auto;
}
</style>
