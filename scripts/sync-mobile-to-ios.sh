#!/usr/bin/env bash
set -euo pipefail

# Mobile H5 应用同步到 iOS 原生应用脚本
# 用法: ./scripts/sync-mobile-to-ios.sh

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
MOBILE_DIR="$ROOT_DIR/apps/mobile"
IOS_WWW_DIR="$ROOT_DIR/apps/ios-native/WorkbenchApp/www"

echo "📱 [1/3] 构建 Mobile H5 应用 (iOS 模式)..."
cd "$MOBILE_DIR"
npm run build:ios

echo "📁 [2/3] 准备 iOS www 目录..."
mkdir -p "$IOS_WWW_DIR"
rm -rf "$IOS_WWW_DIR"/*

echo "📋 [3/3] 复制构建产物到 iOS www 目录..."
cp -R "$MOBILE_DIR/dist-native"/* "$IOS_WWW_DIR"/

echo "✅ 同步完成！"
echo "💡 提示: 请在 Xcode 中添加 'apps/ios-native/WorkbenchApp/www' 目录 (选择 Copy items if needed)"

