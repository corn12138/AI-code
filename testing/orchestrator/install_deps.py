#!/usr/bin/env python3
"""
依赖包安装验证脚本
用于验证所有依赖包是否正确安装和兼容
"""

import subprocess
import sys
from pathlib import Path


def check_python_version():
    """检查 Python 版本"""
    version = sys.version_info
    print(f"🐍 Python 版本: {version.major}.{version.minor}.{version.micro}")

    if version.major < 3 or (version.major == 3 and version.minor < 11):
        print("❌ Python 版本过低，需要 Python 3.11+")
        return False

    print("✅ Python 版本符合要求")
    return True


def install_requirements(requirements_file="requirements-minimal.txt"):
    """安装依赖包"""
    requirements_path = Path(__file__).parent / requirements_file

    if not requirements_path.exists():
        print(f"❌ 找不到 {requirements_file}")
        return False

    print(f"📦 安装依赖包: {requirements_file}")

    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", str(requirements_path)],
            capture_output=True,
            text=True,
            check=True,
        )

        print("✅ 依赖包安装成功")
        return True

    except subprocess.CalledProcessError as e:
        print(f"❌ 安装失败: {e}")
        print(f"输出: {e.stdout}")
        print(f"错误: {e.stderr}")
        return False


def verify_imports():
    """验证核心包是否可以正常导入"""
    core_packages = [
        "typer",
        "rich",
        "yaml",
        "psutil",
        "aiohttp",
        "jinja2",
        "git",
        "watchdog",
        "loguru",
        "tqdm",
    ]

    print("🧪 验证包导入...")

    failed_imports = []

    for package in core_packages:
        try:
            if package == "yaml":
                import yaml
            elif package == "git":
                import git
            else:
                __import__(package)
            print(f"✅ {package}")
        except ImportError as e:
            print(f"❌ {package}: {e}")
            failed_imports.append(package)

    if failed_imports:
        print(f"\n❌ 导入失败的包: {', '.join(failed_imports)}")
        return False
    else:
        print("\n✅ 所有核心包导入成功")
        return True


def test_basic_functionality():
    """测试基础功能"""
    print("🧪 测试基础功能...")

    try:
        # 测试 CLI 框架
        import typer

        app = typer.Typer()
        print("✅ Typer CLI 框架正常")

        # 测试 Rich 输出
        from rich.console import Console

        console = Console()
        console.print("✅ Rich 控制台输出正常", style="green")

        # 测试 YAML 解析
        import yaml

        test_data = {"test": "data"}
        yaml_str = yaml.dump(test_data)
        parsed = yaml.safe_load(yaml_str)
        assert parsed == test_data
        print("✅ YAML 解析正常")

        # 测试系统监控
        import psutil

        cpu_percent = psutil.cpu_percent()
        print(f"✅ 系统监控正常 (CPU: {cpu_percent}%)")

        return True

    except Exception as e:
        print(f"❌ 功能测试失败: {e}")
        return False


def main():
    """主函数"""
    print("🚀 AI-Code 测试编排器依赖安装验证\n")

    # 检查 Python 版本
    if not check_python_version():
        sys.exit(1)

    print()

    # 选择安装模式
    mode = input("选择安装模式 [1: 最小依赖, 2: 完整依赖]: ").strip()

    if mode == "2":
        requirements_file = "requirements.txt"
        print("📦 将安装完整依赖包...")
    else:
        requirements_file = "requirements-minimal.txt"
        print("📦 将安装最小依赖包...")

    print()

    # 安装依赖
    if not install_requirements(requirements_file):
        sys.exit(1)

    print()

    # 验证导入
    if not verify_imports():
        sys.exit(1)

    print()

    # 测试功能
    if not test_basic_functionality():
        sys.exit(1)

    print("\n🎉 安装验证成功！")
    print("\n下一步:")
    print("  1. 运行: python main.py --help")
    print("  2. 验证配置: python main.py config-validate")
    print("  3. 查看状态: python main.py status")


if __name__ == "__main__":
    main()
