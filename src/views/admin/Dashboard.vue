<template>
  <div class="dashboard">
    <!-- 数据统计卡片 -->
    <el-row :gutter="24" class="stat-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon user">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.users }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="trend up">↑ 12%</span>
            <span class="text">较上周</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon recipe">
              <el-icon :size="32"><KnifeFork /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.recipes }}</div>
              <div class="stat-label">食谱总数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="trend up">↑ 5%</span>
            <span class="text">较上周</span>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon news">
              <el-icon :size="32"><Reading /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.news }}</div>
              <div class="stat-label">资讯总数</div>
            </div>
          </div>
          <div class="stat-footer">
            <span class="trend up">↑ 15%</span>
            <span class="text">较上周</span>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据趋势 -->
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <span class="card-title">📊 数据趋势</span>
          </template>
          <div id="trendChart" style="height: 400px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { User, KnifeFork, Reading } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getAdminOverview } from '@/api'

const stats = reactive({ users: 0, recipes: 0, news: 0 })

onMounted(async () => {
  try {
    const data = await getAdminOverview()
    if (data && data.stats) {
      stats.users = Number(data.stats.users || 0)
      stats.recipes = Number(data.stats.recipes || 0)
      stats.news = Number(data.stats.news || 0)
    }
    initChart(data && data.trend)
  } catch (e) {
    initChart()
  }
})

function initChart(trend) {
  const chart = echarts.init(document.getElementById('trendChart'))
  
  const labels = (trend && trend.labels) || ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const users = (trend && trend.users) || [120, 132, 101, 134, 90, 230, 210]
  const recipes = (trend && trend.recipes) || [150, 232, 201, 154, 190, 330, 410]
  const news = (trend && trend.news) || [320, 332, 301, 334, 390, 330, 320]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['用户', '食谱', '资讯'],
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: labels
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '用户',
        type: 'line',
        smooth: true,
        data: users,
        itemStyle: { color: '#667eea' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
              { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
            ]
          }
        }
      },
      {
        name: '食谱',
        type: 'line',
        smooth: true,
        data: recipes,
        itemStyle: { color: '#f59e0b' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 158, 11, 0.3)' },
              { offset: 1, color: 'rgba(245, 158, 11, 0.05)' }
            ]
          }
        }
      },
      {
        name: '资讯',
        type: 'line',
        smooth: true,
        data: news,
        itemStyle: { color: '#ef4444' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
            ]
          }
        }
      }
    ]
  }
  
  chart.setOption(option)
  
  window.addEventListener('resize', () => {
    chart.resize()
  })
}
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stat-cards {
  margin: 0;
}

.stat-card {
  border-radius: 12px;
  margin-bottom: 24px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.stat-icon.consult {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #ffffff;
}

.stat-icon.recipe {
  background: linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%);
  color: #f59e0b;
}

.stat-icon.news {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  color: #ef4444;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.stat-footer {
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.trend {
  font-weight: 600;
}

.trend.up {
  color: #10b981;
}

.trend.down {
  color: #ef4444;
}

.text {
  color: #9ca3af;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}



:deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-card__body) {
  padding: 20px;
}
</style>
