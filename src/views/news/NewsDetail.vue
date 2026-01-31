<template>
  <div class="detail">
    <el-breadcrumb separator="/" class="mb">
      <el-breadcrumb-item to="/app/news">健康资讯</el-breadcrumb-item>
      <el-breadcrumb-item>详情</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="header" shadow="never">
      <h1 class="title">{{ article.title }}</h1>
      <div class="meta">
        <el-tag v-if="article.category" type="success" size="small" class="category-tag">{{ getCategoryLabel(article.category) }}</el-tag>
        <span v-if="article.username" class="author-info">
          <el-icon><User /></el-icon>
          {{ article.username }}
        </span>
        <span class="separator" v-if="article.username">·</span>
        浏览 {{ views }} · 点赞 {{ likes }} · {{ date }}
      </div>
      <!-- 有图片才显示，点击可预览 -->
      <el-image 
        v-if="hasRealCover" 
        :src="article.cover" 
        :preview-src-list="[article.cover]"
        class="cover" 
        fit="cover"
        :preview-teleported="true"
      />
    </el-card>

    <el-card class="body" shadow="never">
      <div class="content" v-html="article.content || '这里是正文占位。可从后端 health_news 表加载并渲染富文本内容。'"></div>
      <div class="actions">
        <el-button type="primary" @click="like">点赞 ({{ likes }})</el-button>
        <el-button :type="fav ? 'warning' : 'default'" @click="toggleFav">{{ fav ? '已收藏' : '收藏' }}</el-button>
      </div>
    </el-card>

    <el-card class="comments" shadow="never">
      <template #header>评论</template>
      <div v-for="(c, i) in comments" :key="i" class="comment">
        <el-avatar size="small" :src="c.avatar ? resolveImageUrl(c.avatar) : ''">{{ c.user?.[0] }}</el-avatar>
        <div class="comment__main">
          <div class="comment__user">{{ c.user }}</div>
          <div class="comment__text">{{ c.text }}</div>
        </div>
      </div>
      <el-input v-model="draft" type="textarea" rows="3" placeholder="写下你的评论..." class="mt" />
      <el-button type="success" class="mt" @click="submit">发布</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getNewsDetail, likeNews, favoriteNews, unlikeNews, unfavoriteNews } from '@/api'
import { resolveImageUrl, isPlaceholder } from '@/utils/image'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'

const route = useRoute()

// 分类映射
const categoryMap = {
  'weight_loss': '减脂塑形',
  'muscle': '增肌健身',
  'sleep': '改善睡眠',
  'stress': '缓解压力',
  'prevention': '疾病预防',
  'wellness': '日常养生'
}
const getCategoryLabel = (value) => categoryMap[value] || value
const id = Number(route.params.id)
const loading = ref(true)

const article = reactive({
  id,
  title: '',
  cover: '',
  content: '',
  username: '',
  category: ''
})

const date = ref('')
const views = ref(0)
const likes = ref(0)
const liked = ref(false)
const fav = ref(false)
const comments = ref([])
const draft = ref('')

// 判断是否有真实的封面图片
const hasRealCover = computed(() => {
  return article.cover && !isPlaceholder(article.cover)
})

// 加载资讯详情
const loadNewsDetail = async () => {
  try {
    loading.value = true
    const data = await getNewsDetail(id)
    if (data) {
      Object.assign(article, {
        title: data.title,
        cover: resolveImageUrl(data.cover),
        content: data.content || '这里是正文占位。可从后端 health_news 表加载并渲染富文本内容。',
        username: data.username || '匿名用户',
        category: data.category
      })
      views.value = data.views || 0
      likes.value = data.likes || 0
      fav.value = !!data.isFavorited
      liked.value = !!data.isLiked
      date.value = new Date(data.createTime || Date.now()).toLocaleDateString()
    }
  } catch (error) {
    console.error('加载资讯详情失败:', error)
    ElMessage.error('加载失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNewsDetail()
})

const like = async () => {
  try {
    if (!liked.value) {
      await likeNews(id)
      likes.value++
      liked.value = true
      ElMessage.success('点赞成功')
    } else {
      await unlikeNews(id)
      liked.value = false
      likes.value = Math.max(0, likes.value - 1)
      ElMessage.success('已取消点赞')
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const toggleFav = async () => {
  try {
    if (!fav.value) {
      await favoriteNews(id)
      fav.value = true
      ElMessage.success('收藏成功')
    } else {
      await unfavoriteNews(id)
      fav.value = false
      ElMessage.success('已取消收藏')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('操作失败')
  }
}

const submit = () => {
  if (!draft.value.trim()) return
  const user = JSON.parse(localStorage.getItem('userInfo') || '{}')
  const item = { user: user.username || '用户', avatar: user.avatar || '', text: draft.value.trim() }
  comments.value.push(item)
  localStorage.setItem(`news:comments:${id}`, JSON.stringify(comments.value))
  draft.value = ''
  ElMessage.success('评论发布成功')
}

// 加载本地评论
onMounted(() => {
  const saved = localStorage.getItem(`news:comments:${id}`)
  if (saved) {
    try { comments.value = JSON.parse(saved) } catch {}
  }
})
</script>

<style scoped>
.detail { padding: 16px; max-width: 1080px; margin: 0 auto; }
.mb { margin-bottom: 10px; }
.header .title { margin: 0 0 8px; font-size: 24px; font-weight: 800; color: #0f172a; }
.header .meta { color: #64748b; font-size: 12px; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.category-tag { margin-right: 4px; }
.author-info { display: flex; align-items: center; gap: 4px; }
.separator { margin: 0 4px; }
.cover { width: 100%; height: 360px; border-radius: 12px; cursor: zoom-in; }
.cover :deep(img) { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; }
.content { 
  line-height: 1.8; 
  color: #334155; 
  font-size: 16px;
  white-space: pre-wrap; /* 保留换行 */
  word-wrap: break-word; /* 自动换行 */
}
.actions { margin-top: 12px; display: flex; gap: 8px; }
.comments { margin-top: 16px; }
.comment { display: flex; gap: 8px; padding: 8px 0; }
.comment__user { font-weight: 700; color: #334155; }
.comment__text { color: #475569; }
.mt { margin-top: 8px; }
</style>
