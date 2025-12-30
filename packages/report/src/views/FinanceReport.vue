<template>
  <div class="report-page">
    <h2>财务报表</h2>
    <a-row :gutter="16" class="stat-row">
      <a-col :span="6">
        <a-statistic title="本月收款" :value="stats.monthIncome" prefix="" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="待收款" :value="stats.pendingAmount" prefix="" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="回款率" :value="stats.rate" suffix="%" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="收款笔数" :value="stats.count" class="stat-card" />
      </a-col>
    </a-row>
    <a-card title="收款类型分布" class="chart-card">
      <div ref="chartRef" style="height: 400px"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
const stats = ref({ monthIncome: 520000, pendingAmount: 180000, rate: 74.3, count: 56 })

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      legend: { bottom: '5%' },
      series: [{
        type: 'pie', radius: ['40%', '70%'],
        data: [
          { value: 320000, name: '合同款' },
          { value: 85000, name: '定金' },
          { value: 68000, name: '设计费' },
          { value: 47000, name: '增项款' }
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
