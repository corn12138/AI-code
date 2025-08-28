#!/bin/bash

# AI-Code 测试编排器快速启动脚本
# 自动激活虚拟环境并运行测试编排器

set -e  # 遇到错误立即退出

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🧪 AI-Code 测试编排器启动脚本"
echo "=================================="

# 检查 Python 版本
PYTHON_VERSION=$(python --version 2>&1)
echo "🐍 当前 Python 版本: $PYTHON_VERSION"

if [[ "$PYTHON_VERSION" != *"3.11"* ]]; then
    echo "⚠️  警告: 推荐使用 Python 3.11，当前版本可能有兼容性问题"
    echo "   请运行: pyenv local 3.11.0"
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "❌ 虚拟环境不存在，请先运行:"
    echo "   python -m venv venv"
    echo "   source venv/bin/activate"
    echo "   pip install -r requirements-python311.txt"
    exit 1
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source venv/bin/activate

# 检查依赖
echo "📦 检查核心依赖..."
if ! python -c "import typer, rich, yaml, pydantic" 2>/dev/null; then
    echo "❌ 核心依赖缺失，请运行:"
    echo "   pip install -r requirements-python311.txt"
    exit 1
fi

echo "✅ 环境检查通过"
echo

# 运行程序
if [ $# -eq 0 ]; then
    echo "🚀 启动测试编排器..."
    echo "完整版 CLI 功能:"
    echo
    python main.py --help
else
    echo "🚀 执行命令: $*"
    python main.py "$@"
fi
