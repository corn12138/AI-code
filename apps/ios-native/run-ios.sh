#!/bin/bash

# iOS 原生应用运行脚本

echo "🚀 启动 iOS 原生应用..."

# 检查是否有 Xcode
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ 错误: 未找到 Xcode，请先安装 Xcode"
    exit 1
fi

# 检查是否有 iOS 模拟器
if ! command -v xcrun &> /dev/null; then
    echo "❌ 错误: 未找到 iOS 开发工具"
    exit 1
fi

# 确保后端服务正在运行
echo "📡 检查后端服务..."
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo "⚠️  警告: 后端服务未运行，请先启动后端服务"
    echo "运行命令: cd ../server && npm run dev"
fi

# 确保移动端 H5 应用正在运行
echo "🌐 检查移动端 H5 应用..."
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  警告: 移动端 H5 应用未运行，请先启动 H5 应用"
    echo "运行命令: cd ../mobile && npm run dev:ssr"
fi

# 列出可用的模拟器
echo "📱 查找可用的 iOS 模拟器..."
SIMULATOR_ID=$(xcrun simctl list devices | grep "iPhone" | grep "Booted" | head -1 | grep -o "[A-F0-9-]\{36\}")

if [ -z "$SIMULATOR_ID" ]; then
    echo "🔍 没有运行中的模拟器，启动默认模拟器..."
    SIMULATOR_ID=$(xcrun simctl list devices | grep "iPhone" | head -1 | grep -o "[A-F0-9-]\{36\}")
    if [ -n "$SIMULATOR_ID" ]; then
        xcrun simctl boot "$SIMULATOR_ID"
        open -a Simulator
        sleep 5
    else
        echo "❌ 未找到可用的 iOS 模拟器"
        exit 1
    fi
fi

echo "📱 使用模拟器: $SIMULATOR_ID"

# 构建H5资源 (仅生产构建)
if [ "$1" = "--release" ]; then
    echo "📦 构建 H5 资源..."
    cd ../mobile
    npm run build:ios
    cd ../ios-native
fi

# 构建应用
echo "🔨 构建 iOS 应用..."
if [ "$1" = "--release" ]; then
    xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -configuration Release -destination "id=$SIMULATOR_ID" build
else
    xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -configuration Debug -destination "id=$SIMULATOR_ID" build
fi

if [ $? -eq 0 ]; then
    echo "📱 安装应用到模拟器..."
    if [ "$1" = "--release" ]; then
        xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -configuration Release -destination "id=$SIMULATOR_ID" install
    else
        xcodebuild -workspace WorkbenchApp.xcworkspace -scheme WorkbenchApp -configuration Debug -destination "id=$SIMULATOR_ID" install
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ iOS 应用安装成功！"
        echo "📱 应用已安装到模拟器，请在模拟器中查找 'AI技术文章阅读' 应用"
    else
        echo "❌ 应用安装失败"
        exit 1
    fi
else
    echo "❌ 应用构建失败"
    echo "💡 提示: 请确保在 Xcode 中正确配置了项目"
    echo "💡 或者直接在 Xcode 中打开 WorkbenchApp.xcworkspace 进行构建"
    exit 1
fi
