#!/bin/bash

echo "🔍 检查全项目兼容性问题..."

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 检查兼容性问题
echo -e "${BLUE}📱 检查 iOS 版本兼容性问题...${NC}"

# 检查 GridItem 使用
echo -e "${BLUE}🔍 检查 GridItem 使用...${NC}"
GRID_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "GridItem" {} \; 2>/dev/null | wc -l)
if [ $GRID_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $GRID_ISSUES 个文件使用 GridItem${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "GridItem" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 GridItem 兼容性问题${NC}"
fi

# 检查 PinnedScrollableViews 使用
echo -e "${BLUE}🔍 检查 PinnedScrollableViews 使用...${NC}"
PINNED_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "PinnedScrollableViews" {} \; 2>/dev/null | wc -l)
if [ $PINNED_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $PINNED_ISSUES 个文件使用 PinnedScrollableViews${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "PinnedScrollableViews" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 PinnedScrollableViews 兼容性问题${NC}"
fi

# 检查 fontWeight 使用
echo -e "${BLUE}🔍 检查 fontWeight 使用...${NC}"
FONT_WEIGHT_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "fontWeight" {} \; 2>/dev/null | wc -l)
if [ $FONT_WEIGHT_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $FONT_WEIGHT_ISSUES 个文件使用 fontWeight${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "fontWeight" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 fontWeight 兼容性问题${NC}"
fi

# 检查 iOS 14.0+ API 使用
echo -e "${BLUE}🔍 检查 iOS 14.0+ API 使用...${NC}"
IOS14_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "\.title[23]\|\.caption2\|LazyVGrid" {} \; 2>/dev/null | wc -l)
if [ $IOS14_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $IOS14_ISSUES 个文件使用 iOS 14.0+ API${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "\.title[23]\|\.caption2\|LazyVGrid" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 iOS 14.0+ API 兼容性问题${NC}"
fi

# 检查 iOS 16.0+ API 使用
echo -e "${BLUE}🔍 检查 iOS 16.0+ API 使用...${NC}"
IOS16_ISSUES=$(find WorkbenchApp -name "*.swift" -exec grep -l "fontWeight.*\.bold\|fontWeight.*\.semibold\|fontWeight.*\.medium" {} \; 2>/dev/null | wc -l)
if [ $IOS16_ISSUES -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $IOS16_ISSUES 个文件使用 iOS 16.0+ API${NC}"
    find WorkbenchApp -name "*.swift" -exec grep -H "fontWeight.*\.bold\|fontWeight.*\.semibold\|fontWeight.*\.medium" {} \; 2>/dev/null
else
    echo -e "${GREEN}✅ 没有发现 iOS 16.0+ API 兼容性问题${NC}"
fi

# 总结
echo -e "${BLUE}📊 兼容性检查总结:${NC}"
echo -e "${BLUE}GridItem 问题: $GRID_ISSUES${NC}"
echo -e "${BLUE}PinnedScrollableViews 问题: $PINNED_ISSUES${NC}"
echo -e "${BLUE}fontWeight 问题: $FONT_WEIGHT_ISSUES${NC}"
echo -e "${BLUE}iOS 14.0+ API 问题: $IOS14_ISSUES${NC}"
echo -e "${BLUE}iOS 16.0+ API 问题: $IOS16_ISSUES${NC}"

TOTAL_ISSUES=$((GRID_ISSUES + PINNED_ISSUES + FONT_WEIGHT_ISSUES + IOS14_ISSUES + IOS16_ISSUES))

if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 所有兼容性问题已修复！${NC}"
else
    echo -e "${YELLOW}⚠️  还有 $TOTAL_ISSUES 个兼容性问题需要修复${NC}"
fi

echo -e "${GREEN}✅ 兼容性检查完成！${NC}"
