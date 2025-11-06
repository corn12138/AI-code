#!/bin/bash

# iOS 兼容性验证脚本
echo "🔍 开始 iOS 兼容性验证..."

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查 Xcode 是否安装
if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}❌ Xcode 未安装或未在 PATH 中${NC}"
    exit 1
fi

echo -e "${BLUE}📱 检查 iOS 版本兼容性...${NC}"

# 检查项目文件
PROJECT_FILE="WorkbenchApp/WorkbenchApp.xcodeproj"
if [ ! -f "$PROJECT_FILE" ]; then
    echo -e "${RED}❌ 项目文件不存在: $PROJECT_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 项目文件存在${NC}"

# 检查关键文件
echo -e "${BLUE}📁 检查关键文件...${NC}"

FILES=(
    "WorkbenchApp/App/ContentView.swift"
    "WorkbenchApp/Views/FeishuStyleView.swift"
    "WorkbenchApp/Utils/CompatibilityHelper.swift"
    "WorkbenchApp/WebView/AdvancedWebViewManager.swift"
    "WorkbenchApp/WebView/AdvancedWebViewRepresentable.swift"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file 不存在${NC}"
    fi
done

# 检查兼容性代码
echo -e "${BLUE}🔍 检查兼容性代码...${NC}"

# 检查 ContentView 中的兼容性代码
if grep -q "compatibleTitle\|compatibleSubtitle\|compatibleCaption" "WorkbenchApp/App/ContentView.swift"; then
    echo -e "${GREEN}✅ ContentView 包含兼容性代码${NC}"
else
    echo -e "${YELLOW}⚠️  ContentView 可能缺少兼容性代码${NC}"
fi

# 检查 FeishuStyleView 中的兼容性代码
if grep -q "CompatibilityHelper\|compatibleTitle\|compatibleSubtitle\|compatibleCaption" "WorkbenchApp/Views/FeishuStyleView.swift"; then
    echo -e "${GREEN}✅ FeishuStyleView 包含兼容性代码${NC}"
else
    echo -e "${YELLOW}⚠️  FeishuStyleView 可能缺少兼容性代码${NC}"
fi

# 检查 CompatibilityHelper 是否存在
if [ -f "WorkbenchApp/Utils/CompatibilityHelper.swift" ]; then
    echo -e "${GREEN}✅ CompatibilityHelper 存在${NC}"
    
    # 检查关键方法
    if grep -q "compatibleTitle\|compatibleSubtitle\|compatibleCaption" "WorkbenchApp/Utils/CompatibilityHelper.swift"; then
        echo -e "${GREEN}✅ CompatibilityHelper 包含兼容性方法${NC}"
    else
        echo -e "${YELLOW}⚠️  CompatibilityHelper 可能缺少兼容性方法${NC}"
    fi
else
    echo -e "${RED}❌ CompatibilityHelper 不存在${NC}"
fi

# 检查部署目标
echo -e "${BLUE}🎯 检查部署目标...${NC}"

DEPLOYMENT_TARGET=$(grep -o 'IPHONEOS_DEPLOYMENT_TARGET = [0-9.]*' "$PROJECT_FILE" | head -1 | cut -d' ' -f3)
if [ "$DEPLOYMENT_TARGET" = "13.0" ]; then
    echo -e "${GREEN}✅ 部署目标设置为 iOS 13.0${NC}"
elif [ "$DEPLOYMENT_TARGET" = "14.0" ]; then
    echo -e "${YELLOW}⚠️  部署目标为 iOS 14.0，建议降级到 13.0${NC}"
elif [ "$DEPLOYMENT_TARGET" = "15.0" ]; then
    echo -e "${YELLOW}⚠️  部署目标为 iOS 15.0，建议降级到 13.0${NC}"
else
    echo -e "${YELLOW}⚠️  部署目标: $DEPLOYMENT_TARGET${NC}"
fi

# 检查 H5 集成
echo -e "${BLUE}🌐 检查 H5 集成...${NC}"

if [ -d "WorkbenchApp/www" ]; then
    echo -e "${GREEN}✅ H5 文件目录存在${NC}"
    
    if [ -f "WorkbenchApp/www/index.html" ]; then
        echo -e "${GREEN}✅ H5 入口文件存在${NC}"
    else
        echo -e "${YELLOW}⚠️  H5 入口文件不存在${NC}"
    fi
    
    if [ -d "WorkbenchApp/www/assets" ]; then
        echo -e "${GREEN}✅ H5 资源文件存在${NC}"
    else
        echo -e "${YELLOW}⚠️  H5 资源文件不存在${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  H5 文件目录不存在${NC}"
fi

# 尝试编译检查
echo -e "${BLUE}🔨 尝试编译检查...${NC}"

# 检查语法错误
echo -e "${BLUE}📝 检查语法错误...${NC}"

# 检查 Swift 文件语法
for swift_file in $(find WorkbenchApp -name "*.swift"); do
    if swiftc -parse "$swift_file" 2>/dev/null; then
        echo -e "${GREEN}✅ $swift_file 语法正确${NC}"
    else
        echo -e "${RED}❌ $swift_file 语法错误${NC}"
    fi
done

# 总结
echo -e "${BLUE}📊 兼容性验证总结:${NC}"

# 统计文件数量
TOTAL_FILES=$(find WorkbenchApp -name "*.swift" | wc -l)
echo -e "${BLUE}📁 Swift 文件总数: $TOTAL_FILES${NC}"

# 检查兼容性代码覆盖率
COMPATIBILITY_FILES=$(grep -l "CompatibilityHelper\|compatibleTitle\|compatibleSubtitle\|compatibleCaption" WorkbenchApp -r --include="*.swift" | wc -l)
echo -e "${BLUE}🔧 包含兼容性代码的文件: $COMPATIBILITY_FILES${NC}"

# 检查 H5 集成状态
if [ -d "WorkbenchApp/www" ] && [ -f "WorkbenchApp/www/index.html" ]; then
    echo -e "${GREEN}✅ H5 集成完整${NC}"
else
    echo -e "${YELLOW}⚠️  H5 集成不完整${NC}"
fi

echo -e "${GREEN}🎉 兼容性验证完成！${NC}"

# 提供建议
echo -e "${BLUE}💡 建议:${NC}"
echo -e "${BLUE}1. 确保所有 Swift 文件语法正确${NC}"
echo -e "${BLUE}2. 测试不同 iOS 版本的兼容性${NC}"
echo -e "${BLUE}3. 验证 H5 集成功能${NC}"
echo -e "${BLUE}4. 进行完整的设备测试${NC}"

echo -e "${GREEN}✅ 验证完成！${NC}"
