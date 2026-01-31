<template>
  <div class="page">
    <!-- 数据概览卡片 -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          <el-icon :size="28"><component :is="stat.icon" /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
          <div class="stat-trend" :class="stat.trend > 0 ? 'up' : 'down'">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 综合趋势图表 -->
    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span class="chart-title">📊 体重 & BMI 趋势</span>
          </template>
          <div ref="weightChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span class="chart-title">🏃 运动数据趋势</span>
          </template>
          <div ref="activityChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="chart-row">
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span class="chart-title">❤️ 心率监测</span>
          </template>
          <div ref="heartChartRef" class="chart"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <span class="chart-title">💤 睡眠质量</span>
          </template>
          <div ref="sleepChartRef" class="chart"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <template #header>
        <div class="header-flex">
          <span class="chart-title">📋 详细记录</span>
          <el-button type="primary" @click="dialogVisible = true">
            <el-icon><Plus /></el-icon>
            添加记录
          </el-button>
        </div>
      </template>
      <el-table :data="rows" stripe style="width: 100%" max-height="500">
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="weight" label="体重(kg)" width="100" />
        <el-table-column prop="bmi" label="BMI" width="90">
          <template #default="{ row }">
            <el-tag :type="getBMIType(row.bmi)" size="small">{{ row.bmi }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="steps" label="步数" width="110" />
        <el-table-column prop="sleep" label="睡眠(h)" width="100" />
        <el-table-column prop="heartRate" label="心率(bpm)" width="110" />
        <el-table-column prop="bloodPressure" label="血压" width="120" />
        <el-table-column prop="note" label="备注" min-width="150" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ $index }">
            <el-button type="danger" link size="small" @click="deleteRow($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加记录对话框 -->
    <el-dialog v-model="dialogVisible" title="添加健康记录" width="520px">
      <el-form :model="form" label-width="100px" label-position="left">
        <el-form-item label="日期">
          <el-date-picker v-model="form.date" type="date" value-format="YYYY-MM-DD" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="体重(kg)">
          <el-input-number v-model="form.weight" :min="30" :max="200" :precision="1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="身高(cm)">
          <el-input-number v-model="form.height" :min="100" :max="220" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="步数">
          <el-input-number v-model="form.steps" :min="0" :max="50000" :step="100" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="睡眠(h)">
          <el-input-number v-model="form.sleep" :min="0" :max="24" :precision="1" :step="0.5" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="心率(bpm)">
          <el-input-number v-model="form.heartRate" :min="40" :max="200" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="血压">
          <el-input v-model="form.bloodPressure" placeholder="例如: 120/80" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="3" placeholder="记录今天的健康状况..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addRecord">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { DataAnalysis, Timer, TrendCharts, Moon, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getHealthRecords, addHealthRecord } from '@/api'

let weightChart = null
let activityChart = null
let heartChart = null
let sleepChart = null

const dialogVisible = ref(false)
const weightChartRef = ref(null)
const activityChartRef = ref(null)
const heartChartRef = ref(null)
const sleepChartRef = ref(null)
const loading = ref(false)

const form = reactive({
  date: new Date().toISOString().split('T')[0],
  weight: 65,
  height: 170,
  steps: 8000,
  sleep: 7.5,
  heartRate: 72,
  bloodPressure: '120/80',
  note: ''
})

const rows = reactive([])

// 加载健康记录
const loadHealthRecords = async () => {
  try {
    loading.value = true
    const data = await getHealthRecords({ current: 1, pageSize: 100 })
    const list = Array.isArray(data) ? data : (data?.records || [])
    if (list && list.length >= 0) {
      rows.splice(0, rows.length, ...list.map(record => ({
        date: record.recordDate || record.date || record.createdTime,
        weight: record.weight ?? 0,
        bmi: record.bmi ?? 0,
        steps: record.steps ?? 0,
        sleep: record.sleepHours ?? record.sleep ?? 0,
        heartRate: record.heartRate ?? 0,
        bloodPressure: record.bloodPressure || '-',
        note: record.note ?? record.notes ?? ''
      })))
      nextTick(() => {
        initCharts()
      })
    }
  } catch (error) {
    console.error('加载健康记录失败:', error)
    ElMessage.error('加载失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadHealthRecords()
  nextTick(() => {
    window.addEventListener('resize', handleResize)
  })
})

const stats = computed(() => {
  const latest = rows[0] || {}
  const previous = rows[1] || {}
  
  const calcTrend = (current, prev) => {
    if (!prev) return 0
    return (((current - prev) / prev) * 100).toFixed(1)
  }
  
  return [
    { 
      label: '体重', 
      value: (latest.weight || 0) + ' kg', 
      icon: DataAnalysis, 
      color: '#3b82f6',
      trend: calcTrend(latest.weight, previous.weight)
    },
    { 
      label: 'BMI指数', 
      value: latest.bmi || 0, 
      icon: Timer, 
      color: '#10b981',
      trend: calcTrend(latest.bmi, previous.bmi)
    },
    { 
      label: '步数', 
      value: (latest.steps || 0).toLocaleString(), 
      icon: TrendCharts, 
      color: '#f59e0b',
      trend: calcTrend(latest.steps, previous.steps)
    },
    { 
      label: '睡眠', 
      value: (latest.sleep || 0) + ' h', 
      icon: Moon, 
      color: '#8b5cf6',
      trend: calcTrend(latest.sleep, previous.sleep)
    },
  ]
})

function getBMIType(bmi) {
  if (bmi < 18.5) return 'info'
  if (bmi < 24) return 'success'
  if (bmi < 28) return 'warning'
  return 'danger'
}

function addRecord() {
  const bmi = (form.weight / ((form.height / 100) ** 2)).toFixed(1)
  
  // 调用后端 API
  addHealthRecord({
    type: 'comprehensive',
    recordDate: form.date,
    weight: form.weight,
    height: form.height,
    steps: form.steps,
    sleepHours: form.sleep,
    heartRate: form.heartRate,
    bloodPressure: form.bloodPressure,
    note: form.note
  }).then(() => {
    rows.unshift({
      date: form.date,
      weight: form.weight,
      bmi: parseFloat(bmi),
      steps: form.steps,
      sleep: form.sleep,
      heartRate: form.heartRate,
      bloodPressure: form.bloodPressure,
      note: form.note
    })
    dialogVisible.value = false
    ElMessage.success('记录添加成功')
    nextTick(() => {
      initCharts()
    })
  }).catch(error => {
    console.error('添加记录失败:', error)
    ElMessage.error('添加失败: ' + error.message)
  })
}

function deleteRow(index) {
  rows.splice(index, 1)
  ElMessage.success('删除成功')
  nextTick(() => {
    initCharts()
  })
}

function initCharts() {
  const data = [...rows].reverse()
  const dates = data.map(d => d.date.slice(5))
  
  // 通用图表配置
  const commonConfig = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: { color: '#374151' },
      padding: 12
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280', fontSize: 11 }
    }
  }
  
  // 体重&BMI图表
  if (weightChartRef.value) {
    if (!weightChart) {
      weightChart = echarts.init(weightChartRef.value)
    }
    weightChart.setOption({
      ...commonConfig,
      legend: { data: ['体重', 'BMI'], top: 10, textStyle: { fontSize: 12 } },
      xAxis: { ...commonConfig.xAxis, boundaryGap: false },
      yAxis: [
        {
          type: 'value',
          name: '体重(kg)',
          nameTextStyle: { color: '#6b7280', fontSize: 11 },
          axisLine: { lineStyle: { color: '#e5e7eb' } },
          axisLabel: { color: '#6b7280', fontSize: 11 },
          splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
        },
        {
          type: 'value',
          name: 'BMI',
          nameTextStyle: { color: '#6b7280', fontSize: 11 },
          axisLine: { lineStyle: { color: '#e5e7eb' } },
          axisLabel: { color: '#6b7280', fontSize: 11 },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '体重',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data.map(d => d.weight),
          itemStyle: { color: '#3b82f6' },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.05)' }
            ])
          }
        },
        {
          name: 'BMI',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          yAxisIndex: 1,
          data: data.map(d => d.bmi),
          itemStyle: { color: '#10b981' },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ])
          }
        }
      ]
    })
  }
  
  // 运动数据图表
  if (activityChartRef.value) {
    if (!activityChart) {
      activityChart = echarts.init(activityChartRef.value)
    }
    activityChart.setOption({
      ...commonConfig,
      legend: { data: ['步数'], top: 10, textStyle: { fontSize: 12 } },
      yAxis: {
        type: 'value',
        name: '步数',
        nameTextStyle: { color: '#6b7280', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
      },
      series: [
        {
          name: '步数',
          type: 'bar',
          barWidth: '45%',
          data: data.map(d => d.steps),
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#f59e0b' },
              { offset: 1, color: '#fbbf24' }
            ]),
            borderRadius: [6, 6, 0, 0]
          }
        }
      ]
    })
  }
  
  // 心率图表
  if (heartChartRef.value) {
    if (!heartChart) {
      heartChart = echarts.init(heartChartRef.value)
    }
    heartChart.setOption({
      ...commonConfig,
      legend: { data: ['心率'], top: 10, textStyle: { fontSize: 12 } },
      xAxis: { ...commonConfig.xAxis, boundaryGap: false },
      yAxis: {
        type: 'value',
        name: '心率(bpm)',
        nameTextStyle: { color: '#6b7280', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
      },
      series: [
        {
          name: '心率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data.map(d => d.heartRate),
          itemStyle: { color: '#ef4444' },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(239, 68, 68, 0.3)' },
              { offset: 1, color: 'rgba(239, 68, 68, 0.05)' }
            ])
          },
          markLine: {
            silent: true,
            lineStyle: { type: 'dashed', width: 1.5 },
            data: [
              { yAxis: 60, label: { formatter: '正常下限', fontSize: 11 }, lineStyle: { color: '#10b981' } },
              { yAxis: 100, label: { formatter: '正常上限', fontSize: 11 }, lineStyle: { color: '#f59e0b' } }
            ]
          }
        }
      ]
    })
  }
  
  // 睡眠质量图表
  if (sleepChartRef.value) {
    if (!sleepChart) {
      sleepChart = echarts.init(sleepChartRef.value)
    }
    sleepChart.setOption({
      ...commonConfig,
      legend: { data: ['睡眠时长'], top: 10, textStyle: { fontSize: 12 } },
      xAxis: { ...commonConfig.xAxis, boundaryGap: false },
      yAxis: {
        type: 'value',
        name: '睡眠(h)',
        nameTextStyle: { color: '#6b7280', fontSize: 11 },
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#6b7280', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
        min: 0,
        max: 10
      },
      series: [
        {
          name: '睡眠时长',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data.map(d => d.sleep),
          itemStyle: { color: '#8b5cf6' },
          lineStyle: { width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
            ])
          },
          markLine: {
            silent: true,
            lineStyle: { type: 'dashed', width: 1.5 },
            data: [
              { yAxis: 7, label: { formatter: '建议睡眠', fontSize: 11 }, lineStyle: { color: '#10b981' } }
            ]
          }
        }
      ]
    })
  }
}

function handleResize() {
  weightChart?.resize()
  activityChart?.resize()
  heartChart?.resize()
  sleepChart?.resize()
}

onMounted(() => {
  loadHealthRecords()
  nextTick(() => {
    window.addEventListener('resize', handleResize)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  weightChart?.dispose()
  activityChart?.dispose()
  heartChart?.dispose()
  sleepChart?.dispose()
})
</script>

<style scoped>
.page {
  padding: 20px;
  background: transparent;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
}

.stat-trend.up {
  color: #10b981;
}

.stat-trend.down {
  color: #ef4444;
}

/* 图表行 */
.chart-row {
  margin-bottom: 20px;
}

/* 图表卡片 */
.chart-card {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  height: 100%;
}

.chart-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #f3f4f6;
  background: #fafafa;
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
}

.chart {
  height: 280px;
  width: 100%;
}

.header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

/* 表格样式 */
:deep(.el-card) {
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-card__body) {
  padding: 24px;
}

.table-card {
  margin-bottom: 0;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  background: #f9fafb;
  color: #6b7280;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 14px 0;
}

/* 对话框 */
:deep(.el-dialog) {
  border-radius: 12px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}
</style>
