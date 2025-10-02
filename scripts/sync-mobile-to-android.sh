#!/usr/bin/env bash
set -euo pipefail

# Mobile H5 应用同步到 Android 原生应用脚本
# 用法: ./scripts/sync-mobile-to-android.sh

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
MOBILE_DIR="$ROOT_DIR/apps/mobile"
ANDROID_WWW_DIR="$ROOT_DIR/apps/android-native/app/src/main/assets/www"

echo "📱 [1/3] 构建 Mobile H5 应用 (Android 模式)..."
cd "$MOBILE_DIR"
npm run build:android

echo "📁 [2/3] 准备 Android assets/www 目录..."
mkdir -p "$ANDROID_WWW_DIR"
rm -rf "$ANDROID_WWW_DIR"/*

echo "📋 [3/3] 复制构建产物到 Android assets 目录..."
cp -R "$MOBILE_DIR/dist-native"/* "$ANDROID_WWW_DIR"/

echo "✅ 同步完成！"
echo "💡 提示: Android 应用会在 Release 构建时自动包含这些资源"
