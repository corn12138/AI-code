#!/bin/bash

# Android 原生应用运行脚本

echo "🚀 启动 Android 原生应用..."

# 检查是否有 Android SDK
if ! command -v adb &> /dev/null; then
    echo "❌ 错误: 未找到 Android SDK，请先安装 Android Studio"
    exit 1
fi

# 检查是否有连接的设备或模拟器
if ! adb devices | grep -q "device$"; then
    echo "❌ 错误: 未找到连接的 Android 设备或模拟器"
    echo "请启动 Android 模拟器或连接 Android 设备"
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

# 构建H5资源 (仅生产构建)
if [ "$1" = "--release" ]; then
    echo "📦 构建 H5 资源..."
    cd ../mobile
    npm run build:android
    cd ../android-native
fi

# 构建并安装应用
echo "🔨 构建 Android 应用..."
if [ "$1" = "--release" ]; then
    ./gradlew assembleRelease
else
    ./gradlew assembleDebug
fi

if [ $? -eq 0 ]; then
    echo "📱 安装应用到设备..."
    if [ "$1" = "--release" ]; then
        ./gradlew installRelease
    else
        ./gradlew installDebug
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Android 应用安装成功！"
        echo "📱 应用已安装到设备，请在设备上查找 'AI技术文章阅读' 应用"
        
        # 尝试启动应用
        echo "🚀 启动应用..."
        adb shell am start -n com.aicode.mobile/.MainActivity
    else
        echo "❌ 应用安装失败"
        exit 1
    fi
else
    echo "❌ 应用构建失败"
    exit 1
fi
