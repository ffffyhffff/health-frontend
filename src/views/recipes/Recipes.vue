<template>
  <div class="recipes-page">
    <!-- 分类 + 搜索 -->
    <section class="toolbar">
      <div class="chips">
        <el-button v-for="c in categories" :key="c.value" size="small" round :type="activeCat === c.value ? 'success' : ''" :plain="activeCat !== c.value" @click="activeCat = c.value">{{ c.label }}</el-button>
      </div>
      <div class="actions">
        <el-select v-model="difficulty" placeholder="筛选难度" clearable style="width: 120px;">
          <el-option label="简单" value="简单" />
          <el-option label="中等" value="中等" />
          <el-option label="困难" value="困难" />
        </el-select>
        <el-input v-model="keyword" placeholder="搜索食谱" clearable class="search" />
        <el-button type="primary" @click="router.push({ name: 'recipe-new' })">发布食谱</el-button>
      </div>
    </section>

    <!-- 内容 + 侧栏布局 -->
    <section class="content">
      <div class="main">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="8" v-for="item in pagedList" :key="item.id">
            <el-card shadow="hover" class="card" @click="onView(item)">
              <!-- 封面区域 -->
              <div class="cover" :class="{ 'cover--empty': isEmptyCover(item.cover) }">
                <img v-if="!isEmptyCover(item.cover)" :src="item.cover" :alt="item.title" />
                <div class="tag" v-if="item.tag">{{ item.tag }}</div>
                <div class="difficulty" v-if="item.difficulty">{{ item.difficulty }}</div>
                <div class="likes">👍 {{ item.likes || 0 }}</div>
              </div>
              <div class="title" :title="item.title">{{ item.title }}</div>
              <div class="meta">{{ item.desc }}</div>
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
        <div class="pagination" v-if="displayList.length > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="displayList.length"
            layout="prev, pager, next"
            background
          />
        </div>
      </div>
      <aside class="aside">
        <el-card shadow="never">
          <template #header>
            <div class="aside__title">推荐食谱</div>
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
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getRecipeList, getRecommendedRecipes } from '@/api'
import { resolveImageUrl, isPlaceholder } from '@/utils/image'
import { ElMessage } from 'element-plus'
import { User } from '@element-plus/icons-vue'

// 判断是否为空封面
const isEmptyCover = (cover) => !cover || isPlaceholder(cover)

const router = useRouter()

const categories = [
  { label: '全部', value: '' },
  { label: '减脂轻食', value: 'weight_loss' },
  { label: '增肌高蛋白', value: 'muscle' },
  { label: '沙拉轻食', value: 'salad' },
  { label: '汤羹粥品', value: 'soup' },
  { label: '主食面点', value: 'staple' },
  { label: '肉类荤菜', value: 'meat' },
  { label: '素菜蔬食', value: 'vegetable' },
  { label: '甜品饮品', value: 'dessert' },
]
const activeCat = ref('')
const keyword = ref('')
const difficulty = ref('')

// 分类value转label
const getCategoryLabel = (value) => {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : value
}
const loading = ref(false)
const currentPage = ref(1)
const pageSize = 9

const list = reactive([])

// 加载食谱列表
const loadRecipes = async () => {
  try {
    loading.value = true
    const params = { current: 1, pageSize: 100 }
    if (activeCat.value) params.category = activeCat.value
    if (keyword.value) params.keyword = keyword.value
    if (difficulty.value) params.difficulty = difficulty.value
    const data = await getRecipeList(params)
    if (data && data.records) {
      const records = data.records.map(r => ({
        ...r,
        cover: resolveImageUrl(r.cover),
        username: r.username || r.author || ''
      }))
      list.splice(0, list.length, ...records)
    }
  } catch (error) {
    console.error('加载食谱失败:', error)
    ElMessage.error('加载食谱失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadRecipes()
})

// 分类筛选与搜索触发服务端过滤
watch(activeCat, () => { loadRecipes() })
watch(difficulty, () => { loadRecipes() })
let searchTimer
watch(keyword, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => loadRecipes(), 300)
})

// 前端本地筛选，确保交互即时生效
const displayList = computed(() => list.filter(it =>
  (!activeCat.value || it.category === activeCat.value) &&
  (!difficulty.value || it.difficulty === difficulty.value) &&
  (!keyword.value || it.title.includes(keyword.value))
))

// 分页后的列表
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return displayList.value.slice(start, start + pageSize)
})

// 切换筛选条件时重置页码
watch([activeCat, keyword, difficulty], () => {
  currentPage.value = 1
})

// 推荐列表
const recommendList = ref([])

// 加载推荐食谱
const loadRecommend = async () => {
  try {
    const data = await getRecommendedRecipes(5)
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
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5)
  }
}

onMounted(() => {
  loadRecommend()
})

const onView = (item) => { router.push({ name: 'recipe-detail', params: { id: item.id } }) }
</script>

<style scoped>
.recipes-page { padding: 16px; }
.toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 14px 0; }
.chips { display: flex; gap: 8px; flex-wrap: wrap; }
.search { width: 260px; }
.content { display: grid; grid-template-columns: 1fr 320px; gap: 16px; }
.card { border-radius: 14px; cursor: pointer; }
.cover { position: relative; height: 160px; overflow: hidden; border-radius: 10px; }
.cover img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s ease; }
.card:hover .cover img { transform: scale(1.04); }

/* 无图片时的简洁占位 */
.cover--empty {
  background: linear-gradient(135deg, #fef7ed 0%, #fef3c7 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.card-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.category-tag { padding: 2px 8px; border-radius: 4px; background: #fb923c; color: #fff; font-size: 11px; font-weight: 500; }
.tag { position: absolute; top: 8px; left: 8px; padding: 2px 8px; border-radius: 999px; background: rgba(34,197,94,.9); color: #fff; font-size: 12px; }
.difficulty { position: absolute; top: 8px; right: 8px; padding: 2px 8px; border-radius: 999px; background: rgba(251,146,60,.9); color: #fff; font-size: 12px; }
.likes { position: absolute; bottom: 8px; right: 8px; padding: 2px 8px; border-radius: 999px; background: rgba(15,23,42,.6); color: #fff; font-size: 12px; }
.title { margin-top: 8px; font-weight: 700; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.meta { color: #64748b; font-size: 12px; margin-top: 2px; }
.author { 
  font-size: 12px; 
  color: #64748b; 
  display: flex; 
  align-items: center; 
  gap: 4px;
}
.aside__title { font-weight: 700; color: #111827; }
.hot { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid #f2f2f2; cursor: pointer; }
.hot:last-child { border-bottom: none; }
.hot img { width: 88px; height: 64px; object-fit: cover; border-radius: 8px; }
.hot__title { font-size: 14px; color: #111827; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

@media (max-width: 980px) { .content { grid-template-columns: 1fr; } }
</style>
