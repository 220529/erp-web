/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  // 生产环境配置（用于发布代码流程）
  readonly VITE_PROD_API_URL?: string
  readonly VITE_PROD_ACCESS_SECRET?: string
  // 可以在这里添加更多环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

