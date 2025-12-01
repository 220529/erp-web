# ============================================
# 依赖阶段 - 准备 node_modules
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

# 安装 pnpm (使用 corepack 更高效)
RUN corepack enable && corepack prepare pnpm@latest --activate

# 配置国内镜像源
RUN pnpm config set registry https://registry.npmmirror.com

# 复制依赖定义文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages

# 安装所有依赖（包括 devDependencies，用于构建）
RUN pnpm install --frozen-lockfile

# ============================================
# 构建阶段 - 编译应用
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 从依赖阶段复制 node_modules
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages ./packages

# 复制源代码和配置文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 构建所有应用
RUN pnpm build

# ============================================
# 生产阶段 - 使用 Nginx 提供静态文件服务
# ============================================
FROM nginx:alpine

# 复制构建产物到 Nginx
COPY --from=builder /app/packages/main/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 添加非 root 用户权限调整
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
