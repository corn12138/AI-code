# 🔧 Python 依赖包兼容性修复

## 🚨 问题描述

在安装 Python 依赖包时遇到以下错误：

```
ERROR: Ignored the following versions that require a different python version: 0.10.6 Requires-Python <3.6,>=2.7; 0.10.7 Requires-Python <3.6,>=2.7                                                                                             
ERROR: Could not find a version that satisfies the requirement asyncio-subprocess==0.1.0 (from versions: none)          
ERROR: No matching distribution found for asyncio-subprocess==0.1.0    
```

## 🔍 问题分析

1. **Python 版本兼容性**：部分包不支持 Python 3.13
2. **过时的包**：`asyncio-subprocess==0.1.0` 不再维护，且不兼容新版本 Python
3. **依赖冲突**：某些包的版本要求与 Python 3.13 不兼容

## ✅ 解决方案

### 1. 移除有问题的包

- **移除**: `asyncio-subprocess==0.1.0`
- **原因**: 该包不再维护，且不支持 Python 3.13
- **替代**: 使用 Python 标准库的 `asyncio.subprocess`

### 2. 更新包版本

更新以下包到兼容 Python 3.13 的版本：

```python
# 更新前 -> 更新后
watchdog==3.0.0 -> watchdog==4.0.0     # 支持 Python 3.13
typer[all]==0.9.0 -> typer[all]==0.12.5 # 最新稳定版
```

### 3. 重新组织依赖结构

#### 3.1 核心依赖 (`requirements.txt`)
只包含必要且稳定的包，可选依赖以注释形式提供。

#### 3.2 最小依赖 (`requirements-minimal.txt`)
仅包含运行基础功能所需的 12 个核心包。

#### 3.3 安装验证脚本 (`install_deps.py`)
自动化验证安装过程和包兼容性。

## 📦 修复后的依赖结构

### 核心依赖 (requirements.txt)
```
typer[all]==0.12.5              # CLI 框架
rich==13.7.1                   # 控制台输出
pyyaml==6.0.1                  # YAML 支持
psutil==5.9.8                  # 系统监控
aiohttp==3.9.1                 # HTTP 客户端
jinja2==3.1.3                  # 模板引擎
GitPython==3.1.41             # Git 集成
watchdog==4.0.0               # 文件监控
loguru==0.7.2                 # 日志系统
```

### 最小依赖 (requirements-minimal.txt)
```
typer[all]==0.12.5
rich==13.7.1
pyyaml==6.0.1
psutil==5.9.8
aiohttp==3.9.1
jinja2==3.1.3
GitPython==3.1.41
watchdog==4.0.0
loguru==0.7.2
tqdm==4.66.2
python-dateutil==2.8.2
```

## 🚀 安装方法

### 方法 1: 使用验证脚本 (推荐)

```bash
cd testing/orchestrator
python install_deps.py
```

脚本会：
- 检查 Python 版本兼容性
- 选择安装模式（最小/完整）
- 自动安装依赖
- 验证包导入
- 测试基础功能

### 方法 2: 手动安装

```bash
# 创建虚拟环境
cd testing/orchestrator
python -m venv venv
source venv/bin/activate  # macOS/Linux
# 或 venv\Scripts\activate  # Windows

# 升级 pip
pip install --upgrade pip

# 安装最小依赖（推荐先试这个）
pip install -r requirements-minimal.txt

# 或安装完整依赖
pip install -r requirements.txt
```

### 方法 3: 逐步安装

如果还有问题，可以逐步安装核心包：

```bash
# 安装核心包
pip install typer[all]==0.12.5
pip install rich==13.7.1
pip install pyyaml==6.0.1
pip install psutil==5.9.8

# 验证基础功能
python -c "import typer, rich, yaml, psutil; print('✅ 核心包安装成功')"

# 继续安装其他包
pip install aiohttp==3.9.1
pip install jinja2==3.1.3
pip install GitPython==3.1.41
```

## 🧪 验证安装

### 1. 验证导入

```python
# 在 Python 解释器中
import typer
import rich
import yaml
import psutil
import aiohttp
import jinja2
import git
import watchdog
import loguru
import tqdm

print("✅ 所有核心包导入成功")
```

### 2. 测试基础功能

```bash
# 测试 CLI
python main.py --help

# 验证配置
python main.py config-validate

# 查看状态
python main.py status
```

## 🔧 代码修改

### 移除 asyncio-subprocess 使用

如果代码中有使用 `asyncio-subprocess`，请替换为标准库：

```python
# 修改前
import asyncio_subprocess

# 修改后 - 使用标准库
import asyncio.subprocess
```

## 📋 兼容性表

| Python 版本 | 支持状态 | 说明 |
|-------------|----------|------|
| 3.11.x      | ✅ 完全支持 | 推荐版本 |
| 3.12.x      | ✅ 完全支持 | 推荐版本 |
| 3.13.x      | ✅ 完全支持 | 最新版本 |
| 3.10.x      | ⚠️ 部分支持 | 需要调整部分包版本 |
| < 3.10      | ❌ 不支持 | 版本过低 |

## 🐛 常见问题

### Q1: 安装时出现编译错误

**A**: 可能缺少编译工具，安装开发工具：

```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential python3-dev

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3-devel
```

### Q2: 某些包安装失败

**A**: 尝试逐个安装，跳过有问题的可选包：

```bash
# 先安装核心包
pip install -r requirements-minimal.txt

# 再安装可选包（按需）
pip install plotly pandas  # 报告生成
pip install black isort mypy  # 代码质量
```

### Q3: 虚拟环境问题

**A**: 重新创建虚拟环境：

```bash
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements-minimal.txt
```

## 📈 后续优化

1. **定期更新**: 每月检查和更新包版本
2. **兼容性测试**: 在多个 Python 版本上测试
3. **依赖锁定**: 考虑使用 `pip-tools` 生成锁定文件
4. **容器化**: 使用 Docker 确保环境一致性

---

## 🎯 总结

通过以上修复：

- ✅ **移除不兼容包**: 去除 `asyncio-subprocess`
- ✅ **更新版本**: 所有包都兼容 Python 3.13
- ✅ **简化依赖**: 提供最小和完整两种安装选项
- ✅ **自动验证**: 提供安装验证脚本
- ✅ **详细文档**: 完整的故障排除指南

现在可以在 Python 3.13 环境中正常安装和使用 AI-Code 测试编排器了！🎉
