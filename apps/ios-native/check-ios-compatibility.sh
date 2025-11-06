#!/bin/bash

echo "🔍 检查 iOS 版本兼容性问题..."

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查 iOS 14.0+ API 使用
echo -e "${BLUE}📱 检查 iOS 14.0+ API 使用...${NC}"

# 检查 @main 使用
echo -e "${BLUE}🔍 检查 @main 使用...${NC}"
MAIN_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "@main" {} \; 2>/dev/null | wc -l)
if [ $MAIN_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $MAIN_ISSUES 个文件使用 @main${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "@main" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 @main 兼容性问题${NC}"
fi

# 检查 @UIApplicationDelegateAdaptor 使用
echo -e "${BLUE}🔍 检查 @UIApplicationDelegateAdaptor 使用...${NC}"
ADAPTOR_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "@UIApplicationDelegateAdaptor" {} \; 2>/dev/null | wc -l)
if [ $ADAPTOR_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $ADAPTOR_ISSUES 个文件使用 @UIApplicationDelegateAdaptor${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "@UIApplicationDelegateAdaptor" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 @UIApplicationDelegateAdaptor 兼容性问题${NC}"
fi

# 检查 Scene 使用
echo -e "${BLUE}🔍 检查 Scene 使用...${NC}"
SCENE_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "Scene" {} \; 2>/dev/null | wc -l)
if [ $SCENE_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $SCENE_ISSUES 个文件使用 Scene${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "Scene" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 Scene 兼容性问题${NC}"
fi

# 检查 WindowGroup 使用
echo -e "${BLUE}🔍 检查 WindowGroup 使用...${NC}"
WINDOW_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "WindowGroup" {} \; 2>/dev/null | wc -l)
if [ $WINDOW_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $WINDOW_ISSUES 个文件使用 WindowGroup${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "WindowGroup" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 WindowGroup 兼容性问题${NC}"
fi

# 检查 init(makeContent:) 使用
echo -e "${BLUE}🔍 检查 init(makeContent:) 使用...${NC}"
INIT_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "init(makeContent:)" {} \; 2>/dev/null | wc -l)
if [ $INIT_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $INIT_ISSUES 个文件使用 init(makeContent:)${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "init(makeContent:)" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 init(makeContent:) 兼容性问题${NC}"
fi

# 检查其他 iOS 14.0+ API
echo -e "${BLUE}🔍 检查其他 iOS 14.0+ API...${NC}"
OTHER_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "\.title[23]\|\.caption2\|LazyVGrid\|GridItem" {} \; 2>/dev/null | wc -l)
if [ $OTHER_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $OTHER_ISSUES 个文件使用其他 iOS 14.0+ API${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "\.title[23]\|\.caption2\|LazyVGrid\|GridItem" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现其他 iOS 14.0+ API 兼容性问题${NC}"
fi

# 检查 iOS 16.0+ API
echo -e "${BLUE}🔍 检查 iOS 16.0+ API...${NC}"
IOS16_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "fontWeight.*\.bold\|fontWeight.*\.semibold\|fontWeight.*\.medium" {} \; 2>/dev/null | wc -l)
if [ $IOS16_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $IOS16_ISSUES 个文件使用 iOS 16.0+ API${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "fontWeight.*\.bold\|fontWeight.*\.semibold\|fontWeight.*\.medium" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 iOS 16.0+ API 兼容性问题${NC}"
fi

# 总结
echo -e "${BLUE}📊 兼容性检查总结:${NC}"
echo -e "${BLUE}@main 问题: $MAIN_ISSUES${NC}"
echo -e "${BLUE}@UIApplicationDelegateAdaptor 问题: $ADAPTOR_ISSUES${NC}"
echo -e "${BLUE}Scene 问题: $SCENE_ISSUES${NC}"
echo -e "${BLUE}WindowGroup 问题: $WINDOW_ISSUES${NC}"
echo -e "${BLUE}init(makeContent:) 问题: $INIT_ISSUES${NC}"
echo -e "${BLUE}其他 iOS 14.0+ API 问题: $OTHER_ISSUES${NC}"
echo -e "${BLUE}iOS 16.0+ API 问题: $IOS16_ISSUES${NC}"

TOTAL_ISSUES=$((MAIN_ISSUES + ADAPTOR_ISSUES + SCENE_ISSUES + WINDOW_ISSUES + INIT_ISSUES + OTHER_ISSUES + IOS16_ISSUES))

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 所有兼容性问题已修复！${NC}"
else
    echo -e "${YELLOW}⚠️  还有 $TOTAL_ISSUES 个兼容性问题需要修复${NC}"
fi

echo -e "${GREEN}✅ 兼容性检查完成！${NC}"
