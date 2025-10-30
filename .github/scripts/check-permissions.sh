#!/bin/bash

set -e

echo "🔍 检查代码变更权限..."
echo ""

# 获取变更文件列表
CHANGED_FILES=$(git diff --name-only origin/main...HEAD 2>/dev/null || echo "")

# 获取提交者
AUTHOR="${GITHUB_ACTOR:-$(git config user.name)}"

if [ -z "$CHANGED_FILES" ]; then
    echo "✅ 没有文件变更"
    exit 0
fi

echo "📝 提交者: $AUTHOR"
echo "📂 变更文件:"
echo "$CHANGED_FILES"
echo ""

# 检查是否修改了主应用
if echo "$CHANGED_FILES" | grep -q "^packages/main/"; then
    echo "⚠️  检测到主应用代码变更！"
    echo ""
    
    # 检查是否是核心团队成员
    if [ -f ".github/CORE_TEAM" ] && grep -q "^${AUTHOR}$" .github/CORE_TEAM; then
        echo "✅ 您是核心团队成员，有权限修改主应用"
    else
        echo "❌ 错误：您没有权限直接修改主应用！"
        echo ""
        echo "📋 变更的主应用文件:"
        echo "$CHANGED_FILES" | grep "^packages/main/"
        echo ""
        echo "💡 解决方案:"
        echo "   1. 请联系核心团队成员审核"
        echo "   2. 或者将改动移到您自己的子应用中"
        echo "   3. 如果是通用功能，请在 PR 中说明理由"
        echo ""
        echo "👥 核心团队成员:"
        cat .github/CORE_TEAM 2>/dev/null || echo "   （无法读取核心团队列表）"
        exit 1
    fi
    echo ""
fi

# 检查是否修改了根配置
if echo "$CHANGED_FILES" | grep -qE "^(package\.json|pnpm-workspace\.yaml|\.github/)"; then
    echo "⚠️  检测到根配置文件变更！"
    echo ""
    
    if [ "$AUTHOR" = "tech-lead" ] || ([ -f ".github/CORE_TEAM" ] && grep -q "^${AUTHOR}$" .github/CORE_TEAM); then
        echo "✅ 您有权限修改根配置"
    else
        echo "❌ 错误：只有核心团队成员可以修改根配置！"
        echo ""
        echo "📋 变更的配置文件:"
        echo "$CHANGED_FILES" | grep -E "^(package\.json|pnpm-workspace\.yaml|\.github/)"
        echo ""
        echo "💡 请联系 @tech-lead 审核"
        exit 1
    fi
    echo ""
fi

echo "✅ 权限检查通过！"
echo ""

