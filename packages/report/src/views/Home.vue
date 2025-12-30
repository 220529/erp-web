<template>
  <div class="home">
    <h1>报表中心</h1>
    <p class="desc">ERP 数据分析与可视化平台</p>
    
    <a-row :gutter="16" class="stat-cards">
      <a-col :span="8">
        <a-card hoverable @click="$router.push('/order')">
          <a-statistic title="订单报表" :value="'查看'" />
          <template #extra>
            <shopping-outlined style="font-size: 32px; color: #1890ff" />
          </template>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="$router.push('/finance')">
          <a-statistic title="财务报表" :value="'查看'" />
          <template #extra>
            <dollar-outlined style="font-size: 32px; color: #52c41a" />
          </template>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card hoverable @click="$router.push('/project')">
          <a-statistic title="项目报表" :value="'查看'" />
          <template #extra>
            <project-outlined style="font-size: 32px; color: #faad14" />
          </template>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import {
  ShoppingOutlined,
  DollarOutlined,
  ProjectOutlined,
} from '@ant-design/icons-vue'
</script>

<style scoped>
.home {
  text-align: center;
}
.home h1 {
  font-size: 28px;
  margin-bottom: 8px;
}
.desc {
  color: #666;
  margin-bottom: 32px;
}
.stat-cards {
  max-width: 900px;
  margin: 0 auto;
}
</style>
