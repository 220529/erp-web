<template>
  <a-layout class="layout">
    <a-layout-sider v-model:collapsed="collapsed" collapsible>
      <div class="logo">报表中心</div>
      <a-menu v-model:selectedKeys="selectedKeys" theme="dark" mode="inline">
        <a-menu-item key="/">
          <router-link to="/">
            <home-outlined />
            <span>首页</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/order">
          <router-link to="/order">
            <shopping-outlined />
            <span>订单报表</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/finance">
          <router-link to="/finance">
            <dollar-outlined />
            <span>财务报表</span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/project">
          <router-link to="/project">
            <project-outlined />
            <span>项目报表</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <span>ERP 报表中心</span>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  HomeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ProjectOutlined,
} from '@ant-design/icons-vue'

const collapsed = ref(false)
const route = useRoute()
const selectedKeys = ref([route.path])

watch(() => route.path, (path) => {
  selectedKeys.value = [path]
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}
.logo {
  height: 32px;
  margin: 16px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  line-height: 32px;
}
.header {
  background: #fff;
  padding: 0 24px;
  font-size: 18px;
  font-weight: 500;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}
.content {
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  min-height: 280px;
}
</style>
