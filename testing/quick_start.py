#!/usr/bin/env python3
"""
AI-Code 测试系统快速启动脚本
一键启动完整的测试流程
"""

import os
import subprocess
import sys
from pathlib import Path

from rich.console import Console
from rich.panel import Panel

console = Console()


def check_environment():
    """检查环境"""
    console.print("[blue]🔍 检查测试环境...[/blue]")

    # 检查 Python 版本
    python_version = sys.version_info
    if python_version.major < 3 or (
        python_version.major == 3 and python_version.minor < 8
    ):
        console.print("[red]❌ Python 版本过低，需要 Python 3.8+[/red]")
        return False
    console.print(
        f"[green]✅ Python: {python_version.major}.{python_version.minor}.{python_version.micro}[/green]"
    )

    # 检查必要文件
    required_files = [
        "config.yml",
        "enhanced_run_tests.py",
        "smart_scheduler.py",
        "realtime_monitor.py",
        "test_data_generator.py",
        "start_testing.py",
    ]

    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
        else:
            console.print(f"[green]✅ {file}[/green]")

    if missing_files:
        console.print(f"[red]❌ 缺少文件: {', '.join(missing_files)}[/red]")
        return False

    return True


def install_dependencies():
    """安装依赖"""
    console.print("[blue]📦 安装依赖...[/blue]")

    try:
        # 安装 Python 依赖
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", "requirements-simple.txt"],
            capture_output=True,
            text=True,
            timeout=300,
        )

        if result.returncode != 0:
            console.print(f"[red]❌ 依赖安装失败: {result.stderr}[/red]")
            return False

        console.print("[green]✅ Python 依赖安装成功[/green]")

        # 检查 Node.js 和 pnpm
        try:
            subprocess.run(["node", "--version"], check=True, capture_output=True)
            console.print("[green]✅ Node.js 已安装[/green]")
        except (subprocess.CalledProcessError, FileNotFoundError):
            console.print("[yellow]⚠️  Node.js 未安装，请先安装 Node.js[/yellow]")

        try:
            subprocess.run(["pnpm", "--version"], check=True, capture_output=True)
            console.print("[green]✅ pnpm 已安装[/green]")
        except (subprocess.CalledProcessError, FileNotFoundError):
            console.print("[yellow]⚠️  pnpm 未安装，请先安装 pnpm[/yellow]")

        return True

    except subprocess.TimeoutExpired:
        console.print("[red]❌ 依赖安装超时[/red]")
        return False
    except Exception as e:
        console.print(f"[red]❌ 依赖安装失败: {e}[/red]")
        return False


def setup_directories():
    """设置目录"""
    console.print("[blue]📁 设置目录结构...[/blue]")

    directories = [
        "reports",
        "test_data",
        "logs",
        "reports/html",
        "reports/json",
        "reports/junit",
        "reports/allure",
    ]

    for dir_name in directories:
        Path(dir_name).mkdir(parents=True, exist_ok=True)
        console.print(f"[green]✅ 创建目录: {dir_name}[/green]")


def run_quick_test():
    """运行快速测试"""
    console.print("[blue]🧪 运行快速测试...[/blue]")

    try:
        # 生成测试数据
        console.print("[blue]🎭 生成测试数据...[/blue]")
        result = subprocess.run(
            [
                sys.executable,
                "test_data_generator.py",
                "--type",
                "user",
                "--count",
                "10",
                "--format",
                "json",
            ],
            capture_output=True,
            text=True,
            timeout=60,
        )

        if result.returncode == 0:
            console.print("[green]✅ 测试数据生成成功[/green]")
        else:
            console.print(f"[yellow]⚠️  测试数据生成失败: {result.stderr}[/yellow]")

        # 运行基础测试（如果配置了应用）
        console.print("[blue]🧪 运行基础测试...[/blue]")
        result = subprocess.run(
            [sys.executable, "enhanced_run_tests.py", "--setup-only"],
            capture_output=True,
            text=True,
            timeout=120,
        )

        if result.returncode == 0:
            console.print("[green]✅ 基础测试设置成功[/green]")
        else:
            console.print(f"[yellow]⚠️  基础测试设置失败: {result.stderr}[/yellow]")

        return True

    except subprocess.TimeoutExpired:
        console.print("[red]❌ 快速测试超时[/red]")
        return False
    except Exception as e:
        console.print(f"[red]❌ 快速测试失败: {e}[/red]")
        return False


def display_success_message():
    """显示成功消息"""
    success_message = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🎉 AI-Code 测试系统设置完成！                                              ║
║                                                                              ║
║  🚀 现在你可以使用以下命令：                                                 ║
║                                                                              ║
║  📋 交互模式:                                                                ║
║     python start_testing.py --interactive                                   ║
║                                                                              ║
║  🧪 基础测试:                                                                ║
║     python enhanced_run_tests.py                                            ║
║                                                                              ║
║  🧠 智能调度:                                                                ║
║     python smart_scheduler.py                                               ║
║                                                                              ║
║  📊 实时监控:                                                                ║
║     python realtime_monitor.py                                              ║
║                                                                              ║
║  🎭 数据生成:                                                                ║
║     python test_data_generator.py --comprehensive                           ║
║                                                                              ║
║  🚀 一键测试:                                                                ║
║     python start_testing.py --comprehensive                                 ║
║                                                                              ║
║  📖 查看文档:                                                                ║
║     cat USAGE_GUIDE.md                                                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
    """

    console.print(Panel(success_message, border_style="green"))


def main():
    """主函数"""
    console.print(
        Panel.fit(
            "[bold blue]🚀 AI-Code 测试系统快速启动[/bold blue]\n"
            "正在设置测试环境...",
            border_style="blue",
        )
    )

    # 检查环境
    if not check_environment():
        console.print("[red]❌ 环境检查失败[/red]")
        return False

    # 安装依赖
    if not install_dependencies():
        console.print("[red]❌ 依赖安装失败[/red]")
        return False

    # 设置目录
    setup_directories()

    # 运行快速测试
    if not run_quick_test():
        console.print("[yellow]⚠️  快速测试失败，但系统已设置完成[/yellow]")

    # 显示成功消息
    display_success_message()

    return True


if __name__ == "__main__":
    try:
        success = main()
        if success:
            console.print("[green]🎉 设置完成！[/green]")
        else:
            console.print("[red]❌ 设置失败[/red]")
            sys.exit(1)
    except KeyboardInterrupt:
        console.print("\n[yellow]⚠️  设置被用户中断[/yellow]")
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]❌ 设置异常: {e}[/red]")
        sys.exit(1)
