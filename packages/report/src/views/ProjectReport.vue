<template>
  <div class="report-page">
    <h2>项目报表</h2>
    <a-row :gutter="16" class="stat-row">
      <a-col :span="6">
        <a-statistic title="进行中项目" :value="stats.ongoing" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月完工" :value="stats.completed" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="平均工期(天)" :value="stats.avgDays" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="超期项目" :value="stats.overdue" class="stat-card" />
      </a-col>
    </a-row>
    <a-card title="项目状态分布" class="chart-card">
      <div ref="chartRef" style="height: 400px"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
const stats = ref({ ongoing: 34, completed: 12, avgDays: 45, overdue: 3 })

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%' },
      series: [{
        type: 'pie', radius: '60%',
        data: [
          { value: 8, name: '规划中', itemStyle: { color: '#1890ff' } },
          { value: 34, name: '施工中', itemStyle: { color: '#52c41a' } },
          { value: 3, name: '暂停', itemStyle: { color: '#faad14' } },
          { value: 55, name: '已完工', itemStyle: { color: '#722ed1' } }
        ]
      }]
    })
  }
})
</script>

<style scoped>
.report-page h2 { margin-bottom: 24px; }
.stat-row { margin-bottom: 24px; }
.stat-card { background: #fafafa; padding: 16px; border-radius: 8px; }
.chart-card { margin-top: 16px; }
</style>
