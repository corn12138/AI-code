# 🐍 PyCharm 开发环境设置手册

本手册详细介绍如何在 PyCharm 中设置和运行 AI-Code 测试编排器项目。

## 📋 前置要求

- **PyCharm Professional/Community** 2023.3+ 
- **Python** 3.11+
- **Git** 已配置
- 项目已克隆到本地

## 🚀 快速开始

### 1. 打开项目

```bash
# 方式1: 命令行打开
cd /Users/huangyuming/Desktop/createProjects/AI-code
pycharm .

# 方式2: PyCharm 界面
# File -> Open -> 选择 AI-code 项目目录
```

### 2. 配置 Python 解释器

#### 2.1 创建虚拟环境

1. **打开设置**
   - macOS: `PyCharm -> Preferences` (⌘,)
   - Windows/Linux: `File -> Settings` (Ctrl+Alt+S)

2. **配置解释器**
   - 导航到: `Project: AI-code -> Python Interpreter`
   - 点击右上角齿轮图标 ⚙️ -> `Add...`

3. **选择虚拟环境类型**
   - 选择 `Virtualenv Environment`
   - 选择 `New environment`
   - **Location**: `testing/orchestrator/venv`
   - **Base interpreter**: 选择 Python 3.11+ 路径
   - 勾选 `Inherit global site-packages` (可选)
   - 点击 `OK`

#### 2.2 或使用现有虚拟环境

如果已经有虚拟环境：
- 选择 `Existing environment`
- **Interpreter**: `testing/orchestrator/venv/bin/python` (macOS/Linux)
- **Interpreter**: `testing/orchestrator/venv/Scripts/python.exe` (Windows)

### 3. 安装依赖包

#### 3.1 使用 PyCharm 终端 (推荐)

1. **打开终端**
   - `View -> Tool Windows -> Terminal` (Alt+F12)
   - 或点击底部的 `Terminal` 标签

2. **激活虚拟环境并安装依赖**
   ```bash
   # 确保在项目根目录
   cd testing/orchestrator
   
   # 激活虚拟环境 (macOS/Linux)
   source venv/bin/activate
   
   # 激活虚拟环境 (Windows)
   venv\Scripts\activate
   
   # 升级 pip
   pip install --upgrade pip
   
   # 安装所有依赖
   pip install -r requirements.txt
   
   # 验证安装
   pip list | grep typer
   pip list | grep rich
   ```

#### 3.2 使用 PyCharm 包管理器

1. **打开包管理器**
   - `File -> Settings -> Project -> Python Interpreter`
   - 点击右侧的 `+` 按钮

2. **批量安装**
   - 在搜索框输入包名，逐个安装主要包：
     - `typer[all]`
     - `rich`
     - `pyyaml`
     - `psutil`
     - `aiohttp`
     - `jinja2`

#### 3.3 从 requirements.txt 安装 (推荐)

1. **右键点击 requirements.txt**
2. **选择 "Install Requirements"**
3. **在弹出对话框中点击 "Install Requirements"**

## 🔧 项目配置

### 1. 设置项目结构

1. **打开项目结构设置**
   - `File -> Settings -> Project -> Project Structure`

2. **标记目录**
   - 右键 `testing/orchestrator` -> `Mark as Sources Root`
   - 右键 `testing/orchestrator/utils` -> `Mark as Sources Root`

3. **排除目录**
   - 右键 `testing/orchestrator/venv` -> `Mark as Excluded`
   - 右键 `testing/reports` -> `Mark as Excluded`
   - 右键 `node_modules` -> `Mark as Excluded`

### 2. 配置运行/调试

#### 2.1 创建主程序运行配置

1. **点击右上角的运行配置下拉菜单**
2. **选择 "Edit Configurations..."**
3. **点击 `+` -> `Python`**
4. **配置参数**:
   - **Name**: `Test Orchestrator - Main`
   - **Script path**: `testing/orchestrator/main.py`
   - **Parameters**: `--help` (测试用)
   - **Working directory**: `$ProjectFileDir$`
   - **Environment variables**: 点击 `...` 添加
     ```
     PYTHONPATH=testing/orchestrator
     ```

#### 2.2 创建单元测试运行配置

1. **新建运行配置**
   - **Name**: `Test Orchestrator - Unit Tests`
   - **Script path**: `testing/orchestrator/main.py`
   - **Parameters**: `run --suite unit --verbose`
   - **Working directory**: `$ProjectFileDir$`

#### 2.3 创建交互式运行配置

1. **新建运行配置**
   - **Name**: `Test Orchestrator - Interactive`
   - **Script path**: `testing/orchestrator/main.py`
   - **Parameters**: `interactive`
   - **Working directory**: `$ProjectFileDir$`

#### 2.4 创建配置验证运行配置

1. **新建运行配置**
   - **Name**: `Test Orchestrator - Config Validate`
   - **Script path**: `testing/orchestrator/main.py`
   - **Parameters**: `config-validate`
   - **Working directory**: `$ProjectFileDir$`

### 3. 代码风格和质量

#### 3.1 配置代码格式化

1. **安装插件**
   - `File -> Settings -> Plugins`
   - 搜索并安装 "Black Formatter"

2. **配置 Black**
   - `File -> Settings -> Tools -> Black`
   - 勾选 `On code reformat`
   - **Arguments**: `--line-length=88`

#### 3.2 配置 Import 排序

1. **设置 Import 优化**
   - `File -> Settings -> Editor -> Code Style -> Python -> Imports`
   - 勾选 `Sort imports on code reformat`
   - **Structure**: 选择 `From __future__ imports, Third-party imports, Application imports`

#### 3.3 配置类型检查

1. **启用 MyPy**
   - `File -> Settings -> Tools -> Python Integrated Tools`
   - **Type checker**: 选择 `Mypy`

## 🧪 运行和调试

### 1. 基础运行

#### 1.1 直接运行主程序

```bash
# 在 PyCharm 终端中
cd testing/orchestrator
source venv/bin/activate  # macOS/Linux
python main.py --help
```

#### 1.2 使用运行配置

1. **选择运行配置**: `Test Orchestrator - Main`
2. **点击运行按钮** (▶️) 或按 `Shift+F10`
3. **查看输出**: 在底部的 `Run` 窗口中查看结果

### 2. 调试模式

#### 2.1 设置断点

1. **在代码行号左侧点击**设置断点 (红色圆点)
2. **推荐断点位置**:
   - `main.py` 第 45 行 (配置加载后)
   - `scheduler.py` 第 230 行 (测试开始执行)
   - `config.py` 第 350 行 (配置解析)

#### 2.2 启动调试

1. **选择运行配置**
2. **点击调试按钮** (🐛) 或按 `Shift+F9`
3. **使用调试工具**:
   - **Step Over** (F8): 逐行执行
   - **Step Into** (F7): 进入函数
   - **Step Out** (Shift+F8): 跳出函数
   - **Resume** (F9): 继续执行

#### 2.3 查看变量

1. **Variables 窗口**: 查看当前作用域变量
2. **Watches 窗口**: 添加自定义监视表达式
3. **Console 窗口**: 执行 Python 代码

### 3. 常用运行场景

#### 3.1 测试配置文件

```python
# 在 PyCharm 控制台中
from config import get_config
config = get_config()
print(config.project_name)
print(config.apps.keys())
```

#### 3.2 运行单元测试

```bash
# 终端中
python main.py run --suite unit --app blog
```

#### 3.3 启动监视模式

```bash
# 终端中
python main.py watch --app blog
```

## 🔍 高级功能

### 1. 版本控制集成

#### 1.1 Git 配置

1. **VCS 菜单**: `VCS -> Enable Version Control Integration`
2. **选择 Git**
3. **查看更改**: `View -> Tool Windows -> Git`

#### 1.2 提交代码

1. **打开提交窗口**: `Ctrl+K` (Cmd+K)
2. **查看更改**: 在左侧面板选择文件
3. **写提交消息**: 在右侧文本框中
4. **提交**: 点击 `Commit` 或 `Commit and Push`

### 2. 数据库工具

#### 2.1 连接测试数据库

1. **打开数据库工具**: `View -> Tool Windows -> Database`
2. **添加数据源**: 点击 `+` -> `Data Source` -> `PostgreSQL`
3. **配置连接**:
   - **Host**: `localhost`
   - **Port**: `5433`
   - **Database**: `test_db`
   - **User**: `test_user`
   - **Password**: `test_password`

### 3. Docker 集成

#### 3.1 Docker 插件

1. **安装 Docker 插件**: `Settings -> Plugins` 搜索 "Docker"
2. **配置 Docker**: `Settings -> Build, Execution, Deployment -> Docker`
3. **查看容器**: `View -> Tool Windows -> Services`

#### 3.2 管理测试容器

```bash
# 在终端中
docker-compose -f testing/docker-compose.test.yml up -d
```

## 📚 有用的快捷键

### 基础操作
- **搜索文件**: `Ctrl+Shift+N` (Cmd+Shift+O)
- **搜索类**: `Ctrl+N` (Cmd+O)
- **搜索符号**: `Ctrl+Alt+Shift+N` (Cmd+Alt+O)
- **全局搜索**: `Ctrl+Shift+F` (Cmd+Shift+F)

### 代码编辑
- **格式化代码**: `Ctrl+Alt+L` (Cmd+Alt+L)
- **优化导入**: `Ctrl+Alt+O` (Cmd+Alt+O)
- **重命名**: `Shift+F6`
- **查找用法**: `Alt+F7` (Cmd+F7)

### 运行和调试
- **运行**: `Shift+F10` (Ctrl+R)
- **调试**: `Shift+F9` (Ctrl+D)
- **停止**: `Ctrl+F2` (Cmd+F2)

### 版本控制
- **提交**: `Ctrl+K` (Cmd+K)
- **推送**: `Ctrl+Shift+K` (Cmd+Shift+K)
- **拉取**: `Ctrl+T` (Cmd+T)
- **查看历史**: `Alt+9` (Cmd+9)

## 🐛 常见问题解决

### 1. Python 解释器问题

**问题**: 找不到模块或包
```
ModuleNotFoundError: No module named 'typer'
```

**解决方案**:
1. 检查解释器设置是否正确
2. 确认虚拟环境已激活
3. 重新安装依赖包
```bash
pip install -r requirements.txt
```

### 2. 导入错误

**问题**: 相对导入失败
```
ImportError: attempted relative import with no known parent package
```

**解决方案**:
1. 确保项目根目录已设置正确
2. 检查 `Sources Root` 设置
3. 在运行配置中添加 `PYTHONPATH`

### 3. 配置文件问题

**问题**: 找不到配置文件
```
FileNotFoundError: config.yml not found
```

**解决方案**:
1. 检查工作目录设置
2. 确保在项目根目录运行
3. 验证配置文件路径

### 4. 终端编码问题

**问题**: 中文显示乱码

**解决方案**:
1. 设置终端编码: `File -> Settings -> Editor -> General -> Console`
2. 设置 `Default Encoding` 为 `UTF-8`
3. 添加环境变量: `PYTHONIOENCODING=utf-8`

## 📖 进阶学习

### 1. PyCharm 插件推荐

- **Black**: 代码格式化
- **.ignore**: Git ignore 文件支持
- **Rainbow Brackets**: 彩色括号匹配
- **Requirements**: requirements.txt 语法高亮
- **Markdown**: Markdown 编辑和预览

### 2. 调试技巧

#### 2.1 条件断点
```python
# 右键断点设置条件
x > 10 and isinstance(data, dict)
```

#### 2.2 日志断点
```python
# 设置日志断点，不暂停执行
print(f"Variable value: {variable_name}")
```

#### 2.3 异常断点
1. `Run -> View Breakpoints`
2. 点击 `+` -> `Python Exception Breakpoints`
3. 选择异常类型 (如 `Exception`)

### 3. 性能分析

#### 3.1 使用 Profiler
1. **运行配置**: 勾选 `Run with profiler`
2. **查看结果**: 在 `Profiler` 窗口查看性能数据

#### 3.2 内存使用监控
```python
# 在代码中添加
import tracemalloc
tracemalloc.start()
# ... 你的代码
current, peak = tracemalloc.get_traced_memory()
print(f"Current memory usage: {current / 1024 / 1024:.1f} MB")
```

## 🎯 最佳实践

### 1. 项目组织
- 使用虚拟环境隔离依赖
- 设置合适的项目结构标记
- 定期更新依赖包

### 2. 代码质量
- 启用代码格式化 (Black)
- 使用类型提示
- 编写文档字符串
- 设置适当的断点进行调试

### 3. 团队协作
- 统一代码风格设置
- 使用版本控制
- 定期同步配置文件

---

## 🆘 获取帮助

- **PyCharm 官方文档**: https://www.jetbrains.com/help/pycharm/
- **Python 官方文档**: https://docs.python.org/3/
- **项目内部文档**: `testing/README.md`
- **故障排除**: `testing/docs/troubleshooting.md`

**祝您在 PyCharm 中开发愉快！** 🐍✨
