#!/bin/bash

echo "🔍 检查 Swift 语法..."

# 设置颜色
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查 ContentView
echo "📱 检查 ContentView.swift..."
if swiftc -parse WorkbenchApp/App/ContentView.swift 2>/dev/null; then
    echo -e "${GREEN}✅ ContentView.swift 语法正确${NC}"
else
    echo -e "${RED}❌ ContentView.swift 语法错误${NC}"
    swiftc -parse WorkbenchApp/App/ContentView.swift 2>&1
fi

# 检查 FeishuStyleView
echo "📱 检查 FeishuStyleView.swift..."
if swiftc -parse WorkbenchApp/Views/FeishuStyleView.swift 2>/dev/null; then
    echo -e "${GREEN}✅ FeishuStyleView.swift 语法正确${NC}"
else
    echo -e "${RED}❌ FeishuStyleView.swift 语法错误${NC}"
    swiftc -parse WorkbenchApp/Views/FeishuStyleView.swift 2>&1
fi

# 检查 CompatibilityHelper
echo "📱 检查 CompatibilityHelper.swift..."
if swiftc -parse WorkbenchApp/Utils/CompatibilityHelper.swift 2>/dev/null; then
    echo -e "${GREEN}✅ CompatibilityHelper.swift 语法正确${NC}"
else
    echo -e "${RED}❌ CompatibilityHelper.swift 语法错误${NC}"
    swiftc -parse WorkbenchApp/Utils/CompatibilityHelper.swift 2>&1
fi

# 检查 DocumentBrowserView
echo "📱 检查 DocumentBrowserView.swift..."
if swiftc -parse WorkbenchApp/Views/DocumentBrowserView.swift 2>/dev/null; then
    echo -e "${GREEN}✅ DocumentBrowserView.swift 语法正确${NC}"
else
    echo -e "${RED}❌ DocumentBrowserView.swift 语法错误${NC}"
    swiftc -parse WorkbenchApp/Views/DocumentBrowserView.swift 2>&1
fi

echo -e "${GREEN}🎉 语法检查完成！${NC}"
