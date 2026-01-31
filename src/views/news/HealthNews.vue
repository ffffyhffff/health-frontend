<template>
  <div class="news-page">
    <!-- 工具栏：分类 + 搜索 -->
    <section class="toolbar">
      <div class="chips">
        <el-button
          v-for="c in categories"
          :key="c.value"
          size="small"
          round
          :type="activeCat === c.value ? 'success' : 'default'"
          :plain="activeCat !== c.value"
          @click="activeCat = c.value"
        >{{ c.label }}</el-button>
      </div>
      <div class="actions">
        <el-input v-model="keyword" placeholder="搜索健康资讯" clearable :prefix-icon="Search" class="search" />
        <el-button type="primary" @click="router.push({ name: 'news-new' })">发布资讯</el-button>
      </div>
    </section>

    <!-- 内容 + 侧栏布局 -->
    <section class="content">
      <div class="main">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" v-for="item in pagedList" :key="item.id">
            <el-card shadow="hover" class="card" @click="onView(item)">
              <!-- 封面区域：有图片显示图片，无图片显示简洁占位 -->
              <div class="cover" :class="{ 'cover--empty': isEmptyCover(item.cover) }">
                <img v-if="!isEmptyCover(item.cover)" :src="item.cover" :alt="item.title" />
                <div class="badge"><el-icon :size="14"><View /></el-icon>{{ item.views }}</div>
                <div class="badge badge--right"><el-icon :size="14"><StarFilled /></el-icon>{{ item.likes || 0 }}</div>
              </div>
              <div class="title" :title="item.title">{{ item.title }}</div>
              <div class="card-footer">
                <div class="author" v-if="item.username">
                  <el-icon><User /></el-icon>
                  {{ item.username }}
                </div>
                <div class="category-tag" v-if="item.category">{{ getCategoryLabel(item.category) }}</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <!-- 分页 -->
        <div class="pagination" v-if="filteredList.length > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredList.length"
            layout="prev, pager, next"
            background
          />
        </div>
      </div>
      <aside class="aside">
        <el-card shadow="never">
          <template #header>
            <div class="aside__title">推荐资讯</div>
          </template>
          <div v-for="hot in recommendList" :key="hot.id" class="hot" @click="onView(hot)">
            <img :src="hot.cover" alt="hot" />
            <div class="hot__info">
              <div class="hot__title" :title="hot.title">{{ hot.title }}</div>
            </div>
          </div>
        </el-card>
      </aside>
    </section>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { View, Search, User, StarFilled } from '@element-plus/icons-vue'
import { getNewsList, getRecommendedNews } from '@/api'
import { resolveImageUrl, isPlaceholder } from '@/utils/image'
import { ElMessage } from 'element-plus'

// 判断是否为空封面
const isEmptyCover = (cover) => !cover || isPlaceholder(cover)

const router = useRouter()

const categories = [
  { label: '全部', value: '' },
  { label: '减脂塑形', value: 'weight_loss' },
  { label: '增肌健身', value: 'muscle' },
  { label: '改善睡眠', value: 'sleep' },
  { label: '缓解压力', value: 'stress' },
  { label: '疾病预防', value: 'prevention' },
  { label: '日常养生', value: 'wellness' },
]
const activeCat = ref('')
const keyword = ref('')

// 分类value转label
const getCategoryLabel = (value) => {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : value
}
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 9

const list = reactive([])

// 加载资讯列表
const loadNews = async () => {
  try {
    loading.value = true
    const data = await getNewsList({ current: 1, pageSize: 100 })
    if (data && data.records) {
      const records = data.records.map(r => ({
        ...r,
        cover: resolveImageUrl(r.cover),
        username: r.username || r.author || ''
      }))
      list.splice(0, list.length, ...records)
    }
  } catch (error) {
    console.error('加载资讯失败:', error)
    ElMessage.error('加载资讯失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadNews()
})

const filteredList = computed(() => list.filter(it =>
  (!activeCat.value || it.category === activeCat.value) && (!keyword.value || it.title.includes(keyword.value))
))

// 分页后的列表
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
})

// 切换分类或搜索时重置页码
watch([activeCat, keyword], () => {
  currentPage.value = 1
})

// 推荐列表
const recommendList = ref([])

// 加载推荐资讯
const loadRecommend = async () => {
  try {
    const data = await getRecommendedNews(5)
    if (data) {
      recommendList.value = data.map(r => ({
        ...r,
        cover: resolveImageUrl(r.cover)
      }))
    }
  } catch (error) {
    console.error('加载推荐失败:', error)
    // 降级为热度排序
    recommendList.value = [...list]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5)
  }
}

onMounted(() => {
  loadRecommend()
})

const onView = (item) => {
  router.push({ name: 'news-detail', params: { id: item.id } })
}
</script>

<style scoped>
.news-page {
  padding: 16px;
  background: radial-gradient(800px 400px at 10% 5%, rgba(16,185,129,0.06), transparent 60%),
              radial-gradient(700px 350px at 95% 10%, rgba(59,130,246,0.06), transparent 60%);
  border-radius: 14px;
}

.toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 6px 0 10px;
  margin: 0 0 14px;
  border-bottom: 1px solid #eef2f7;
}
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.actions { display: flex; align-items: center; gap: 10px; }
.search { width: 280px; }

.content { display: grid; grid-template-columns: 1fr 320px; gap: 18px; }

.card {
  border-radius: 16px;
  cursor: pointer;
  border: 1px solid #eef2f7;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: transform .25s ease, box-shadow .25s ease;
  background: #fff;
}
.card:hover { transform: translateY(-3px); box-shadow: 0 16px 28px rgba(15, 23, 42, 0.10); }

.cover {
  position: relative;
  height: 190px;
  overflow: hidden;
  border-radius: 12px;
}
.cover:after {
  content: "";
  position: absolute; inset: 0;
  background: linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,.08));
}
.cover img { width: 100%; height: 100%; object-fit: cover; transition: transform .45s ease; }
.card:hover .cover img { transform: scale(1.05); }

/* 无图片时的简洁占位 */
.cover--empty {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 2px 8px;
}
.category-tag {
  padding: 2px 8px; border-radius: 4px;
  background: #10b981;
  color: #fff; font-size: 11px; font-weight: 500;
}
.badge {
  position: absolute; top: 10px; left: 10px;
  padding: 3px 10px; border-radius: 999px;
  backdrop-filter: blur(6px);
  background: rgba(15, 23, 42, .45);
  color: #fff; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;
}
.badge--right { left: auto; right: 10px; }
.title { margin: 10px 2px 6px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.author { 
  font-size: 12px; 
  color: #64748b; 
  display: flex; 
  align-items: center; 
  gap: 4px;
}

.chips :deep(.el-button) {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
}
.chips :deep(.el-button.is-plain:hover) { background: #f1f5f9; }
.chips :deep(.el-button.is-plain.is-loading) { background: #f1f5f9; }
.chips :deep(.el-button.el-button--success) {
  background: #16a34a; border-color: #16a34a; color: #fff;
}

.aside__title { font-weight: 800; color: #0f172a; }
.hot { display: flex; gap: 10px; padding: 10px; border: 1px solid #eef2f7; border-radius: 12px; margin-bottom: 10px; transition: background .2s ease, transform .2s ease; }
.hot:hover { background: #f8fafc; transform: translateY(-1px); }
.hot img { width: 88px; height: 64px; object-fit: cover; border-radius: 8px; }
.hot__title { font-size: 14px; color: #111827; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 980px) {
  .content { grid-template-columns: 1fr; }
  .search { width: 100%; }
}
</style>
