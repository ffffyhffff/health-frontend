import request from '@/utils/request'

// ==================== 文件上传 ====================

/**
 * 上传图片
 */
export function uploadImage(formData) {
  return request({
    url: '/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// ==================== 认证相关 ====================

/**
 * 用户注册
 */
export function register(data) {
  return request({
    url: '/auth/register',
    method: 'post',
    data
  })
}

/**
 * 用户登录
 */
export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data
  })
}

/**
 * 管理员登录
 */
export function adminLogin(data) {
  return request({
    url: '/auth/admin/login',
    method: 'post',
    data
  })
}

// ==================== 用户相关 ====================

/**
 * 获取用户信息
 */
export function getUserProfile() {
  return request({
    url: '/users/profile',
    method: 'get'
  })
}

/**
 * 更新用户信息
 */
export function updateUserProfile(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  })
}

// ==================== 食谱相关 ====================

/**
 * 获取食谱列表
 */
export function getRecipeList(params) {
  return request({
    url: '/recipes',
    method: 'get',
    params
  })
}

/**
 * 获取食谱详情
 */
export function getRecipeDetail(id) {
  return request({
    url: `/recipes/${id}`,
    method: 'get'
  })
}

/**
 * 发布食谱
 */
export function publishRecipe(data) {
  return request({
    url: '/recipes',
    method: 'post',
    data
  })
}

/**
 * 点赞食谱
 */
export function likeRecipe(id) {
  return request({
    url: `/recipes/${id}/like`,
    method: 'post'
  })
}

export function unlikeRecipe(id) {
  return request({
    url: `/recipes/${id}/unlike`,
    method: 'post'
  })
}

/**
 * 收藏食谱
 */
export function favoriteRecipe(id) {
  return request({
    url: `/recipes/${id}/favorite`,
    method: 'post'
  })
}

export function unfavoriteRecipe(id) {
  return request({
    url: `/recipes/${id}/unfavorite`,
    method: 'post'
  })
}

/**
 * 获取推荐食谱
 */
export function getRecommendedRecipes(limit = 5) {
  return request({
    url: '/recipes/recommend',
    method: 'get',
    params: { limit }
  })
}

// ==================== 资讯相关 ====================

/**
 * 获取资讯列表
 */
export function getNewsList(params) {
  return request({
    url: '/news',
    method: 'get',
    params
  })
}

/**
 * 获取资讯详情
 */
export function getNewsDetail(id) {
  return request({
    url: `/news/${id}`,
    method: 'get'
  })
}

/**
 * 发布资讯
 */
export function publishNews(data) {
  return request({
    url: '/news',
    method: 'post',
    data
  })
}

/**
 * 点赞资讯
 */
export function likeNews(id) {
  return request({
    url: `/news/${id}/like`,
    method: 'post'
  })
}

export function unlikeNews(id) {
  return request({
    url: `/news/${id}/unlike`,
    method: 'post'
  })
}

/**
 * 收藏资讯
 */
export function favoriteNews(id) {
  return request({
    url: `/news/${id}/favorite`,
    method: 'post'
  })
}

export function unfavoriteNews(id) {
  return request({
    url: `/news/${id}/unfavorite`,
    method: 'post'
  })
}

/**
 * 获取推荐资讯
 */
export function getRecommendedNews(limit = 5) {
  return request({
    url: '/news/recommend',
    method: 'get',
    params: { limit }
  })
}

// ==================== 健康咨询相关 ====================

/**
 * 健康咨询
 */
export function healthConsult(data) {
  return request({
    url: '/health/consult',
    method: 'post',
    data
  })
}

export function healthChat(data) {
  const endpoint = import.meta.env.VITE_AI_ENDPOINT || '/health/consult'
  return request({
    url: endpoint,
    method: 'post',
    data
  })
}

/**
 * 打开健康咨询流式 SSE
 */
export function openConsultStream(question, sessionId, controller) {
  if (!question || !question.trim()) {
    return Promise.reject(new Error('问题不能为空'))
  }

  const endpoint = import.meta.env.VITE_AI_STREAM_ENDPOINT || '/api/health/consult/stream'
  let userId = localStorage.getItem('userId') || ''
  if (!userId) {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
      userId = userInfo?.id || ''
    } catch (_) {}
  }

  const params = new URLSearchParams({
    question,
    userId,
    sessionId: sessionId || ''
  })

  const base = endpoint || '/api/health/consult/stream'
  const separator = base.includes('?') ? '&' : '?'
  const url = `${base}${separator}${params.toString()}`

  const token = localStorage.getItem('token') || ''
  const headers = {
    Accept: 'text/event-stream'
  }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (userId) headers['userId'] = userId

  return fetch(url, {
    method: 'GET',
    headers,
    cache: 'no-store',
    signal: controller?.signal
  })
}

/**
 * 获取咨询历史
 */
export function getConsultHistory(params) {
  return request({
    url: '/health/consult/history',
    method: 'get',
    params
  })
}

/**
 * 清空咨询历史
 */
export function clearConsultHistory(params) {
  return request({
    url: '/health/consult/history',
    method: 'delete',
    params
  })
}

// ==================== 管理概览 ====================

export function getAdminOverview() {
  return request({
    url: '/admin/overview',
    method: 'get'
  })
}

// ==================== 健康记录相关 ====================

/**
 * 添加健康记录
 */
export function addHealthRecord(data) {
  return request({
    url: '/health/records',
    method: 'post',
    data
  })
}

/**
 * 获取健康记录列表
 */
export function getHealthRecords(params) {
  return request({
    url: '/health/records',
    method: 'get',
    params
  })
}

// ==================== 管理后台相关 ====================

/**
 * 获取用户列表
 */
export function getUserList(params) {
  return request({
    url: '/admin/users',
    method: 'get',
    params
  })
}

/**
 * 删除用户
 */
export function deleteUser(id) {
  return request({
    url: `/admin/users/${id}`,
    method: 'delete'
  })
}

/**
 * 获取管理员列表
 */
export function getAdminList(params) {
  return request({
    url: '/admin/admins',
    method: 'get',
    params
  })
}

/**
 * 添加管理员
 */
export function addAdmin(data) {
  return request({
    url: '/admin/admins',
    method: 'post',
    data
  })
}

/**
 * 更新管理员
 */
export function updateAdmin(id, data) {
  return request({
    url: `/admin/admins/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除管理员
 */
export function deleteAdmin(id) {
  return request({
    url: `/admin/admins/${id}`,
    method: 'delete'
  })
}

/**
 * 管理端获取食谱列表
 */
export function getAdminRecipeList(params) {
  return request({
    url: '/admin/recipes',
    method: 'get',
    params
  })
}

/**
 * 删除食谱
 */
export function deleteRecipe(id) {
  return request({
    url: `/admin/recipes/${id}`,
    method: 'delete'
  })
}

/**
 * 管理端获取资讯列表
 */
export function getAdminNewsList(params) {
  return request({
    url: '/admin/news',
    method: 'get',
    params
  })
}

/**
 * 添加资讯
 */
export function addNews(data) {
  return request({
    url: '/admin/news',
    method: 'post',
    data
  })
}

/**
 * 更新资讯
 */
export function updateNews(id, data) {
  return request({
    url: `/admin/news/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除资讯
 */
export function deleteNews(id) {
  return request({
    url: `/admin/news/${id}`,
    method: 'delete'
  })
}

 

// ==================== 个人中心相关 ====================

/**
 * 获取我的发布列表
 */
export function getMyPosts(params) {
  return request({
    url: '/users/my-posts',
    method: 'get',
    params
  })
}

/**
 * 获取我的收藏列表
 */
export function getMyFavorites(params) {
  return request({
    url: '/users/my-favorites',
    method: 'get',
    params
  })
}
