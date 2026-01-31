import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',  // 使用相对路径，通过 Vite 代理转发
  timeout: 10000,  // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    console.log('发送请求:', config.method.toUpperCase(), config.url, config)
    
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    
    // 从 localStorage 获取 userId
    let userId = localStorage.getItem('userId')
    if (!userId) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        if (userInfo && userInfo.id) {
          userId = userInfo.id
        }
      } catch (_) {}
    }
    if (userId) config.headers['userId'] = userId
    
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    console.log('收到响应:', response.config.url, response)
    const res = response.data
    
    // 如果响应码不是 0（成功），则判断为错误
    if (res.code !== 0) {
      console.error('接口错误:', res.message || '请求失败')
      
      // 40100: 未登录，跳转到登录页
      if (res.code === 40100) {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        window.location.href = '/login'
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res.data
    }
  },
  error => {
    console.error('响应错误:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    })
    return Promise.reject(error)
  }
)

export default request
