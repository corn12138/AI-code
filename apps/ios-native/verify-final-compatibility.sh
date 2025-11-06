#!/bin/bash

echo "🔍 最终兼容性验证..."

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查部署目标
echo -e "${BLUE}📱 检查部署目标...${NC}"
DEPLOYMENT_TARGET=$(grep -o 'IPHONEOS_DEPLOYMENT_TARGET = [0-9.]*' WorkbenchApp/WorkbenchApp.xcodeproj/project.pbxproj | head -1 | cut -d' ' -f3)
echo -e "${BLUE}部署目标: $DEPLOYMENT_TARGET${NC}"

if [ "$DEPLOYMENT_TARGET" = "14.0" ]; then
    echo -e "${GREEN}✅ 部署目标设置为 iOS 14.0${NC}"
else
    echo -e "${YELLOW}⚠️  部署目标: $DEPLOYMENT_TARGET${NC}"
fi

# 检查关键文件
echo -e "${BLUE}📁 检查关键文件...${NC}"

FILES=(
    "WorkbenchApp/App/WorkbenchApp.swift"
    "WorkbenchApp/App/ContentView.swift"
    "WorkbenchApp/Views/FeishuStyleView.swift"
    "WorkbenchApp/Views/DocumentBrowserView.swift"
    "WorkbenchApp/Utils/CompatibilityHelper.swift"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file 存在${NC}"
    else
        echo -e "${RED}❌ $file 不存在${NC}"
    fi
done

# 检查语法错误
echo -e "${BLUE}🔍 检查语法错误...${NC}"

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        if swiftc -parse "$file" 2>/dev/null; then
            echo -e "${GREEN}✅ $file 语法正确${NC}"
        else
            echo -e "${RED}❌ $file 语法错误${NC}"
            swiftc -parse "$file" 2>&1 | head -3
        fi
    fi
done

# 检查兼容性问题
echo -e "${BLUE}🔍 检查兼容性问题...${NC}"

# 检查 iOS 14.0+ API
IOS14_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "\.title[23]\|\.caption2\|LazyVGrid\|GridItem" {} \; 2>/dev/null | wc -l)
if [ $IOS14_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $IOS14_ISSUES 个文件使用 iOS 14.0+ API${NC}"
else
    echo -e "${GREEN}✅ 没有发现 iOS 14.0+ API 兼容性问题${NC}"
fi

# 检查 iOS 16.0+ API
IOS16_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "fontWeight.*\.bold\|fontWeight.*\.semibold\|fontWeight.*\.medium" {} \; 2>/dev/null | wc -l)
if [ $IOS16_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $IOS16_ISSUES 个文件使用 iOS 16.0+ API${NC}"
else
    echo -e "${GREEN}✅ 没有发现 iOS 16.0+ API 兼容性问题${NC}"
fi

# 检查 App 结构问题
APP_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "@main\|@UIApplicationDelegateAdaptor\|WindowGroup\|Scene" {} \; 2>/dev/null | wc -l)
if [ $APP_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $APP_ISSUES 个文件使用 App 结构 API${NC}"
else
    echo -e "${GREEN}✅ 没有发现 App 结构 API 兼容性问题${NC}"
fi

# 总结
echo -e "${BLUE}📊 兼容性验证总结:${NC}"
echo -e "${BLUE}部署目标: $DEPLOYMENT_TARGET${NC}"
echo -e "${BLUE}iOS 14.0+ API 问题: $IOS14_ISSUES${NC}"
echo -e "${BLUE}iOS 16.0+ API 问题: $IOS16_ISSUES${NC}"
echo -e "${BLUE}App 结构 API 问题: $APP_ISSUES${NC}"

TOTAL_ISSUES=$((IOS14_ISSUES + IOS16_ISSUES + APP_ISSUES))

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 所有兼容性问题已修复！${NC}"
    echo -e "${GREEN}✅ 项目现在支持 iOS 14.0+${NC}"
else
    echo -e "${YELLOW}⚠️  还有 $TOTAL_ISSUES 个兼容性问题需要修复${NC}"
fi

echo -e "${GREEN}✅ 兼容性验证完成！${NC}"
