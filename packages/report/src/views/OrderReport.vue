<template>
  <div class="report-page">
    <h2>订单报表</h2>
    <a-row :gutter="16" class="stat-row">
      <a-col :span="6">
        <a-statistic title="本月订单数" :value="stats.monthOrders" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="本月签约金额" :value="stats.monthAmount" prefix="" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="待处理订单" :value="stats.pendingOrders" class="stat-card" />
      </a-col>
      <a-col :span="6">
        <a-statistic title="完工订单" :value="stats.completedOrders" class="stat-card" />
      </a-col>
    </a-row>
    <a-card title="月度订单趋势" class="chart-card">
      <div ref="chartRef" style="height: 400px"></div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const chartRef = ref<HTMLElement>()
const stats = ref({ monthOrders: 128, monthAmount: 856000, pendingOrders: 23, completedOrders: 89 })

onMounted(() => {
  if (chartRef.value) {
    const chart = echarts.init(chartRef.value)
    chart.setOption({
      xAxis: { type: 'category', data: ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'] },
      yAxis: { type: 'value' },
      series: [{ data: [45,52,61,54,72,68,85,92,78,95,110,128], type: 'bar', itemStyle: { color: '#1890ff' } }],
      tooltip: { trigger: 'axis' }
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
