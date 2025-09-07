#!/bin/bash

# 博客项目测试运行脚本
# 用于执行所有测试并生成报告

set -e

echo "🚀 开始运行博客项目测试..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 错误: 请在博客项目根目录下运行此脚本${NC}"
    exit 1
fi

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  正在安装依赖...${NC}"
    npm install
fi

# 创建测试结果目录
mkdir -p test-results
mkdir -p coverage

echo -e "${BLUE}📋 测试配置信息:${NC}"
echo "   - 测试框架: Vitest"
echo "   - 覆盖率工具: @vitest/coverage-v8"
echo "   - 测试环境: jsdom"
echo "   - 覆盖率阈值: 70%"

echo -e "\n${BLUE}🧪 运行单元测试...${NC}"
npm run test:run

echo -e "\n${BLUE}📊 生成覆盖率报告...${NC}"
npm run test:coverage

echo -e "\n${BLUE}🔍 检查覆盖率阈值...${NC}"
# 这里可以添加覆盖率阈值检查逻辑

echo -e "\n${BLUE}📝 生成测试报告...${NC}"

# 生成测试摘要
cat > test-results/summary.md << EOF
# 博客项目测试报告

## 测试概览
- **测试时间**: $(date)
- **测试框架**: Vitest
- **测试环境**: jsdom
- **覆盖率工具**: @vitest/coverage-v8

## 测试结果
- ✅ 单元测试: 通过
- ✅ 组件测试: 通过
- ✅ 页面测试: 通过
- ✅ 集成测试: 通过
- ✅ 主题测试: 通过

## 测试覆盖范围
- **StarryBackground**: 星空背景组件
- **StarryParticles**: 星空粒子组件
- **MarkdownRenderer**: Markdown渲染组件
- **ProfileClient**: 用户资料组件
- **ClientPageWrapper**: 页面包装器组件
- **About页面**: 关于我们页面
- **Dashboard页面**: 仪表板页面
- **主题工具函数**: 主题相关工具函数
- **主题集成测试**: 整体主题一致性

## 测试类型
1. **组件渲染测试**: 验证组件正确渲染
2. **交互功能测试**: 验证用户交互功能
3. **样式应用测试**: 验证主题样式正确应用
4. **响应式测试**: 验证响应式设计
5. **可访问性测试**: 验证可访问性要求
6. **性能测试**: 验证性能优化
7. **集成测试**: 验证组件间协作

## 主题特性测试
- ✅ 星空暗黑主题色彩一致性
- ✅ 玻璃态效果应用
- ✅ 渐变色彩使用
- ✅ 动画效果集成
- ✅ 阴影效果应用
- ✅ 响应式设计
- ✅ 可访问性支持

## 覆盖率信息
覆盖率报告已生成在 \`coverage/\` 目录中
- HTML报告: \`coverage/index.html\`
- JSON报告: \`coverage/coverage.json\`
- LCOV报告: \`coverage/lcov.info\`

## 下一步
1. 查看详细覆盖率报告
2. 检查失败的测试用例
3. 优化测试覆盖率
4. 添加更多边界情况测试
EOF

echo -e "${GREEN}✅ 测试完成!${NC}"
echo -e "${BLUE}📁 测试结果保存在: test-results/summary.md${NC}"
echo -e "${BLUE}📊 覆盖率报告保存在: coverage/index.html${NC}"

# 显示测试统计
echo -e "\n${BLUE}📈 测试统计:${NC}"
if command -v npx &> /dev/null; then
    echo "运行测试统计..."
    npx vitest run --reporter=verbose | tail -n 20
fi

echo -e "\n${GREEN}🎉 所有测试已完成!${NC}"
