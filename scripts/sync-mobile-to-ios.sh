#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
MOBILE_DIR="$ROOT_DIR/apps/mobile"
IOS_WWW_DIR="$ROOT_DIR/apps/ios-native/WorkbenchApp/www"

echo "[1/3] Building mobile (HYBRID_PUBLIC_PATH=./) ..."
cd "$MOBILE_DIR"
HYBRID_PUBLIC_PATH=./ pnpm build

echo "[2/3] Preparing iOS www directory ..."
mkdir -p "$IOS_WWW_DIR"
rm -rf "$IOS_WWW_DIR"/*

echo "[3/3] Copying dist to iOS www ..."
cp -R "$MOBILE_DIR/dist"/* "$IOS_WWW_DIR"/

echo "Done. Now add 'apps/ios-native/WorkbenchApp/www' to Xcode (Copy items if needed)."

