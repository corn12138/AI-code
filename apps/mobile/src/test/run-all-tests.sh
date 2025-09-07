#!/bin/bash

# 运行所有测试的脚本
echo "🚀 开始运行Mobile应用所有测试..."

# 检查是否安装了依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装依赖..."
    npm install
fi

# 运行类型检查
echo "🔍 运行TypeScript类型检查..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ 类型检查失败，请修复类型错误后重试"
    exit 1
fi

# 运行ESLint检查
echo "🔍 运行ESLint检查..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ ESLint检查失败，请修复代码规范问题后重试"
    exit 1
fi

# 运行所有测试
echo "🧪 运行所有测试..."
npm run test:run

if [ $? -ne 0 ]; then
    echo "❌ 测试失败"
    exit 1
fi

# 运行覆盖率测试
echo "📊 生成测试覆盖率报告..."
npm run test:coverage

echo "✅ 所有测试通过！"
echo "📈 测试覆盖率报告已生成，请查看 coverage/index.html"

# 显示测试统计
echo ""
echo "📋 测试统计:"
echo "- 总测试文件数: $(find src -name "*.test.ts" -o -name "*.test.tsx" | wc -l)"
echo "- 总测试用例数: $(npm run test:run -- --reporter=verbose 2>/dev/null | grep -c "✓\|✗" || echo "未知")"
echo ""
echo "🎉 测试完成！"
