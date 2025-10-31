import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  // CSS 配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        // Ant Design 主题定制
        modifyVars: {
          '@primary-color': '#1890ff', // 主色
          '@link-color': '#1890ff', // 链接色
          '@success-color': '#52c41a', // 成功色
          '@warning-color': '#faad14', // 警告色
          '@error-color': '#f5222d', // 错误色
          '@font-size-base': '14px', // 基础字体大小
          '@heading-color': 'rgba(0, 0, 0, 0.85)', // 标题色
          '@text-color': 'rgba(0, 0, 0, 0.65)', // 主文本色
          '@border-radius-base': '4px', // 组件圆角
          '@border-color-base': '#d9d9d9', // 边框色
        },
      },
    },
    modules: {
      // CSS Modules 配置
      localsConvention: 'camelCaseOnly',
      scopeBehaviour: 'local',
    },
  },
  
  server: {
    port: 3100,
    host: '0.0.0.0',
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3009',
        changeOrigin: true,
      },
    },
  },
  
  build: {
    target: 'esnext',
    sourcemap: false,
    // 分包策略
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
        },
      },
    },
  },
})

