<template>
  <div class="api-test">
    <h2>API 连接测试</h2>
    
    <el-card class="test-card">
      <h3>测试食谱列表接口</h3>
      <el-button type="primary" @click="testRecipeList">获取食谱列表</el-button>
      <div v-if="recipeData" class="result">
        <h4>响应数据：</h4>
        <pre>{{ JSON.stringify(recipeData, null, 2) }}</pre>
      </div>
    </el-card>

    <el-card class="test-card">
      <h3>测试资讯列表接口</h3>
      <el-button type="primary" @click="testNewsList">获取资讯列表</el-button>
      <div v-if="newsData" class="result">
        <h4>响应数据：</h4>
        <pre>{{ JSON.stringify(newsData, null, 2) }}</pre>
      </div>
    </el-card>

    <el-card class="test-card">
      <h3>测试用户登录接口</h3>
      <el-form :model="loginForm" label-width="80px">
        <el-form-item label="账号">
          <el-input v-model="loginForm.account" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="testLogin">登录</el-button>
        </el-form-item>
      </el-form>
      <div v-if="loginData" class="result">
        <h4>响应数据：</h4>
        <pre>{{ JSON.stringify(loginData, null, 2) }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getRecipeList, getNewsList, login } from '@/api'
import { ElMessage } from 'element-plus'

const recipeData = ref(null)
const newsData = ref(null)
const loginData = ref(null)

const loginForm = ref({
  account: 'zhangsan',
  password: '123456'
})

const testRecipeList = async () => {
  try {
    const data = await getRecipeList({ current: 1, pageSize: 10 })
    recipeData.value = data
    ElMessage.success('获取食谱列表成功')
  } catch (error) {
    ElMessage.error('获取食谱列表失败: ' + error.message)
  }
}

const testNewsList = async () => {
  try {
    const data = await getNewsList({ current: 1, pageSize: 10 })
    newsData.value = data
    ElMessage.success('获取资讯列表成功')
  } catch (error) {
    ElMessage.error('获取资讯列表失败: ' + error.message)
  }
}

const testLogin = async () => {
  try {
    const data = await login(loginForm.value)
    loginData.value = data
    
    // 保存 token 和 userId
    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('userId', data.userInfo.id)
    }
    
    ElMessage.success('登录成功')
  } catch (error) {
    ElMessage.error('登录失败: ' + error.message)
  }
}
</script>

<style scoped>
.api-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-card {
  margin-bottom: 20px;
}

.result {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

pre {
  max-height: 300px;
  overflow: auto;
  font-size: 12px;
}
</style>
