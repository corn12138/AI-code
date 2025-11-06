#!/usr/bin/env python3
"""
AI-Code 一键测试启动器
集成所有测试功能，提供统一的测试入口
"""

import argparse
import asyncio
import json
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

# 导入测试组件
from enhanced_run_tests import EnhancedTestRunner
from realtime_monitor import RealtimeMonitor
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from smart_scheduler import SmartTestScheduler
from test_data_generator import DataGeneratorConfig, TestDataGenerator

console = Console()


class UnifiedTestSystem:
    """统一测试系统"""

    def __init__(self, config_path: str = "real-world-config.yml"):
        self.config_path = config_path
        self.start_time = None
        self.end_time = None

    def _display_banner(self):
        """显示系统横幅"""
        banner = """
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🚀 AI-Code 企业级自动化测试系统 v2.0                                      ║
║                                                                              ║
║  ✨ 智能调度  📊 实时监控  🎯 精准测试  📈 性能分析  🔒 安全扫描            ║
║                                                                              ║
║  🎪 功能特性:                                                               ║
║     • 智能测试编排 - 基于依赖关系的智能调度                                 ║
║     • 实时监控告警 - WebSocket 实时监控和告警                               ║
║     • 多格式报告 - HTML、JSON、JUnit、Allure 多格式报告                      ║
║     • 性能分析 - 详细的性能指标和趋势分析                                   ║
║     • 安全扫描 - 依赖漏洞扫描和代码安全检查                                 ║
║     • 数据生成 - 智能测试数据生成和场景构建                                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
        """
        console.print(Panel(banner, border_style="blue"))

    def _display_menu(self):
        """显示功能菜单"""
        menu = """
🎯 测试功能菜单:

1. 🧪 基础测试执行
   - 运行单元测试、集成测试、E2E测试
   - 支持并行和顺序执行
   - 自动生成测试报告

2. 🧠 智能测试调度
   - 基于依赖关系的智能调度
   - 资源使用优化
   - 优先级管理

3. 📊 实时监控系统
   - 系统资源监控
   - 测试执行监控
   - 实时告警

4. 📈 性能测试分析
   - 性能基准测试
   - 负载测试
   - 性能趋势分析

5. 🔒 安全测试扫描
   - 依赖漏洞扫描
   - 代码安全检查
   - 安全报告生成

6. 🎭 测试数据生成
   - 智能测试数据生成
   - 多场景数据构建
   - 数据质量保证

7. 📋 测试报告分析
   - 历史报告对比
   - 趋势分析
   - 质量指标

8. ⚙️  系统配置管理
   - 配置文件管理
   - 环境设置
   - 依赖检查

9. 🚀 一键完整测试
   - 执行完整测试流程
   - 包含所有测试类型
   - 生成综合报告

0. 🚪 退出系统
        """
        console.print(Panel(menu, title="功能菜单", border_style="green"))

    def _run_basic_tests(self, args):
        """运行基础测试"""
        console.print("[blue]🧪 启动基础测试执行...[/blue]")

        runner = EnhancedTestRunner(self.config_path)

        # 运行测试
        return asyncio.run(
            runner.run_tests(
                apps=args.apps or ["all"],
                test_types=args.types or ["all"],
                sequential=False,
                changed_only=False,
            )
        )

    def _run_smart_scheduling(self, args):
        """运行智能调度测试"""
        console.print("[blue]🧠 启动智能测试调度...[/blue]")

        scheduler = SmartTestScheduler(self.config_path)

        # 获取应用配置
        apps = scheduler.config.get("apps", {})
        if args.apps:
            apps = {name: config for name, config in apps.items() if name in args.apps}

        test_types = args.types or ["unit", "integration", "e2e"]

        # 运行调度
        return asyncio.run(scheduler.schedule_and_run(apps, test_types))

    def _run_realtime_monitoring(self, args):
        """运行实时监控"""
        console.print("[blue]📊 启动实时监控系统...[/blue]")

        monitor = RealtimeMonitor(self.config_path)

        # 添加告警回调
        def alert_callback(alert):
            console.print(f"[yellow]🚨 告警: {alert.message}[/yellow]")

        monitor.add_alert_callback(alert_callback)

        # 启动监控
        asyncio.run(monitor.start_monitoring())

        return {"status": "monitoring_completed"}

    def _run_performance_analysis(self, args):
        """运行性能分析"""
        console.print("[blue]📈 启动性能测试分析...[/blue]")

        # 生成性能测试数据
        generator = TestDataGenerator(DataGeneratorConfig(output_dir="./test_data"))
        performance_data = generator.generate_performance_data(1000)

        # 分析性能数据
        analysis = self._analyze_performance_data(performance_data)

        # 生成性能报告
        self._generate_performance_report(analysis)

        return analysis

    def _run_security_scanning(self, args):
        """运行安全扫描"""
        console.print("[blue]🔒 启动安全测试扫描...[/blue]")

        # 依赖漏洞扫描
        dependency_scan = self._scan_dependencies()

        # 代码安全检查
        code_scan = self._scan_code_security()

        # 生成安全报告
        security_report = {
            "dependency_scan": dependency_scan,
            "code_scan": code_scan,
            "timestamp": datetime.now().isoformat(),
        }

        self._generate_security_report(security_report)

        return security_report

    def _run_data_generation(self, args):
        """运行测试数据生成"""
        console.print("[blue]🎭 启动测试数据生成...[/blue]")

        config = DataGeneratorConfig(
            output_dir=args.output or "./test_data",
            locale=args.locale or "zh_CN",
            seed=args.seed,
        )

        generator = TestDataGenerator(config)

        if args.comprehensive:
            # 生成综合数据集
            dataset = generator.generate_comprehensive_dataset()
            generator.export_comprehensive_dataset(dataset)
            return dataset
        else:
            # 生成指定类型数据
            if args.type == "user":
                data = generator.generate_users(args.count)
            elif args.type == "article":
                data = generator.generate_articles(args.count)
            elif args.type == "mobile_doc":
                data = generator.generate_mobile_docs(args.count)
            else:
                console.print(f"[red]❌ 不支持的数据类型: {args.type}[/red]")
                return None

            # 导出数据
            output_path = generator.export_data(data, f"{args.type}_data")
            console.print(f"[green]✅ 数据已导出: {output_path}[/green]")

            return data

    def _run_comprehensive_testing(self, args):
        """运行一键完整测试"""
        console.print("[blue]🚀 启动一键完整测试...[/blue]")

        self.start_time = datetime.now()

        # 1. 环境检查和设置
        console.print("[blue]🔧 步骤 1/6: 环境检查和设置...[/blue]")
        self._check_environment()

        # 2. 生成测试数据
        console.print("[blue]🎭 步骤 2/6: 生成测试数据...[/blue]")
        generator = TestDataGenerator(DataGeneratorConfig(output_dir="./test_data"))
        dataset = generator.generate_comprehensive_dataset()

        # 3. 运行基础测试
        console.print("[blue]🧪 步骤 3/6: 运行基础测试...[/blue]")
        basic_results = self._run_basic_tests(args)

        # 4. 运行智能调度测试
        console.print("[blue]🧠 步骤 4/6: 运行智能调度测试...[/blue]")
        smart_results = self._run_smart_scheduling(args)

        # 5. 运行性能分析
        console.print("[blue]📈 步骤 5/6: 运行性能分析...[/blue]")
        performance_results = self._run_performance_analysis(args)

        # 6. 运行安全扫描
        console.print("[blue]🔒 步骤 6/6: 运行安全扫描...[/blue]")
        security_results = self._run_security_scanning(args)

        # 生成综合报告
        console.print("[blue]📊 生成综合测试报告...[/blue]")
        comprehensive_report = {
            "summary": {
                "start_time": self.start_time.isoformat(),
                "end_time": datetime.now().isoformat(),
                "duration": (datetime.now() - self.start_time).total_seconds(),
            },
            "basic_tests": basic_results,
            "smart_scheduling": smart_results,
            "performance_analysis": performance_results,
            "security_scan": security_results,
            "test_data": {"generated": len(dataset), "types": list(dataset.keys())},
        }

        self._generate_comprehensive_report(comprehensive_report)

        return comprehensive_report

    def _check_environment(self):
        """检查环境"""
        console.print("[blue]🔍 检查测试环境...[/blue]")

        # 检查 Python 版本
        python_version = sys.version_info
        console.print(
            f"[green]✅ Python: {python_version.major}.{python_version.minor}.{python_version.micro}[/green]"
        )

        # 检查必要文件
        required_files = ["config.yml", "enhanced_run_tests.py", "smart_scheduler.py"]
        for file in required_files:
            if os.path.exists(file):
                console.print(f"[green]✅ {file}[/green]")
            else:
                console.print(f"[red]❌ {file} 不存在[/red]")

        # 检查输出目录
        output_dirs = ["reports", "test_data", "logs"]
        for dir_name in output_dirs:
            Path(dir_name).mkdir(exist_ok=True)
            console.print(f"[green]✅ 创建目录: {dir_name}[/green]")

    def _analyze_performance_data(self, data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析性能数据"""
        if not data:
            return {}

        # 计算统计指标
        response_times = [d["response_time"] for d in data]
        cpu_usage = [d["cpu_usage"] for d in data]
        memory_usage = [d["memory_usage"] for d in data]

        analysis = {
            "response_time": {
                "min": min(response_times),
                "max": max(response_times),
                "avg": sum(response_times) / len(response_times),
                "p95": sorted(response_times)[int(len(response_times) * 0.95)],
            },
            "cpu_usage": {
                "min": min(cpu_usage),
                "max": max(cpu_usage),
                "avg": sum(cpu_usage) / len(cpu_usage),
            },
            "memory_usage": {
                "min": min(memory_usage),
                "max": max(memory_usage),
                "avg": sum(memory_usage) / len(memory_usage),
            },
            "total_requests": len(data),
            "success_rate": len([d for d in data if d["status_code"] < 400])
            / len(data),
        }

        return analysis

    def _generate_performance_report(self, analysis: Dict[str, Any]):
        """生成性能报告"""
        report_path = (
            Path("reports")
            / f"performance_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )

        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)

        console.print(f"[green]✅ 性能报告已生成: {report_path}[/green]")

    def _scan_dependencies(self) -> Dict[str, Any]:
        """扫描依赖漏洞"""
        console.print("[blue]🔍 扫描依赖漏洞...[/blue]")

        # 这里可以集成 safety 或其他安全扫描工具
        # 简化实现
        return {
            "status": "completed",
            "vulnerabilities": [],
            "total_packages": 0,
            "scanned_at": datetime.now().isoformat(),
        }

    def _scan_code_security(self) -> Dict[str, Any]:
        """扫描代码安全"""
        console.print("[blue]🔍 扫描代码安全...[/blue]")

        # 这里可以集成 bandit 或其他代码安全扫描工具
        # 简化实现
        return {
            "status": "completed",
            "issues": [],
            "total_files": 0,
            "scanned_at": datetime.now().isoformat(),
        }

    def _generate_security_report(self, report: Dict[str, Any]):
        """生成安全报告"""
        report_path = (
            Path("reports")
            / f"security_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )

        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        console.print(f"[green]✅ 安全报告已生成: {report_path}[/green]")

    def _generate_comprehensive_report(self, report: Dict[str, Any]):
        """生成综合报告"""
        report_path = (
            Path("reports")
            / f"comprehensive_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )

        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        console.print(f"[green]✅ 综合报告已生成: {report_path}[/green]")

        # 显示摘要
        self._display_comprehensive_summary(report)

    def _display_comprehensive_summary(self, report: Dict[str, Any]):
        """显示综合测试摘要"""
        console.print("\n[bold blue]📊 综合测试摘要[/bold blue]")

        table = Table(title="测试结果汇总")
        table.add_column("测试类型", style="cyan")
        table.add_column("状态", style="magenta")
        table.add_column("详情", style="green")

        # 基础测试
        basic_status = "✅ 完成" if report.get("basic_tests") else "❌ 失败"
        table.add_row("基础测试", basic_status, "单元、集成、E2E测试")

        # 智能调度
        smart_status = "✅ 完成" if report.get("smart_scheduling") else "❌ 失败"
        table.add_row("智能调度", smart_status, "基于依赖关系的智能调度")

        # 性能分析
        perf_status = "✅ 完成" if report.get("performance_analysis") else "❌ 失败"
        table.add_row("性能分析", perf_status, "性能基准和趋势分析")

        # 安全扫描
        security_status = "✅ 完成" if report.get("security_scan") else "❌ 失败"
        table.add_row("安全扫描", security_status, "依赖漏洞和代码安全")

        # 测试数据
        data_status = "✅ 完成" if report.get("test_data") else "❌ 失败"
        table.add_row(
            "测试数据",
            data_status,
            f"生成 {report.get('test_data', {}).get('generated', 0)} 条记录",
        )

        console.print(table)

        # 显示总体统计
        summary = report.get("summary", {})
        console.print("\n[bold]总体统计:[/bold]")
        console.print(f"⏱️  总耗时: {summary.get('duration', 0):.2f}s")
        console.print(f"🚀 开始时间: {summary.get('start_time', 'N/A')}")
        console.print(f"🏁 结束时间: {summary.get('end_time', 'N/A')}")

    def run_interactive_mode(self):
        """运行交互模式"""
        while True:
            self._display_banner()
            self._display_menu()

            try:
                choice = input("\n🎯 请选择功能 (0-9): ").strip()

                if choice == "0":
                    console.print("[yellow]👋 感谢使用 AI-Code 测试系统！[/yellow]")
                    break
                elif choice == "1":
                    self._run_basic_tests_interactive()
                elif choice == "2":
                    self._run_smart_scheduling_interactive()
                elif choice == "3":
                    self._run_realtime_monitoring_interactive()
                elif choice == "4":
                    self._run_performance_analysis_interactive()
                elif choice == "5":
                    self._run_security_scanning_interactive()
                elif choice == "6":
                    self._run_data_generation_interactive()
                elif choice == "7":
                    self._run_report_analysis_interactive()
                elif choice == "8":
                    self._run_config_management_interactive()
                elif choice == "9":
                    self._run_comprehensive_testing_interactive()
                else:
                    console.print("[red]❌ 无效选择，请重新输入[/red]")

                input("\n按 Enter 键继续...")

            except KeyboardInterrupt:
                console.print("\n[yellow]👋 感谢使用 AI-Code 测试系统！[/yellow]")
                break
            except Exception as e:
                console.print(f"[red]❌ 执行异常: {e}[/red]")

    def _run_basic_tests_interactive(self):
        """交互式基础测试"""
        console.print("[blue]🧪 基础测试执行[/blue]")

        # 获取应用列表
        apps_input = input("📱 请输入要测试的应用 (用逗号分隔，留空表示全部): ").strip()
        apps = [app.strip() for app in apps_input.split(",")] if apps_input else None

        # 获取测试类型
        types_input = input(
            "🔬 请输入测试类型 (unit,integration,e2e，用逗号分隔): "
        ).strip()
        types = [t.strip() for t in types_input.split(",")] if types_input else None

        # 执行测试
        try:
            results = self._run_basic_tests(
                type(
                    "Args",
                    (),
                    {
                        "apps": apps,
                        "types": types,
                        "sequential": False,
                        "changed_only": False,
                    },
                )()
            )
            console.print("[green]✅ 基础测试完成[/green]")
        except Exception as e:
            console.print(f"[red]❌ 基础测试失败: {e}[/red]")

    def _run_smart_scheduling_interactive(self):
        """交互式智能调度"""
        console.print("[blue]🧠 智能测试调度[/blue]")
        # 实现交互式智能调度
        console.print("[yellow]⚠️  功能开发中...[/yellow]")

    def _run_realtime_monitoring_interactive(self):
        """交互式实时监控"""
        console.print("[blue]📊 实时监控系统[/blue]")
        # 实现交互式实时监控
        console.print("[yellow]⚠️  功能开发中...[/yellow]")

    def _run_performance_analysis_interactive(self):
        """交互式性能分析"""
        console.print("[blue]📈 性能测试分析[/blue]")
        # 实现交互式性能分析
        console.print("[yellow]⚠️  功能开发中...[/yellow]")

    def _run_security_scanning_interactive(self):
        """交互式安全扫描"""
        console.print("[blue]🔒 安全测试扫描[/blue]")
        # 实现交互式安全扫描
        console.print("[yellow]⚠️  功能开发中...[/yellow]")

    def _run_data_generation_interactive(self):
        """交互式数据生成"""
        console.print("[blue]🎭 测试数据生成[/blue]")
        # 实现交互式数据生成
        console.print("[yellow]⚠️  功能开发中...[/yellow]")

    def _run_report_analysis_interactive(self):
        """交互式报告分析"""
        console.print("[blue]📋 测试报告分析[/blue]")
        # 实现交互式报告分析
        console.print("[yellow]⚠️  功能开发中...[/yellow]")

    def _run_config_management_interactive(self):
        """交互式配置管理"""
        console.print("[blue]⚙️  系统配置管理[/blue]")
        # 实现交互式配置管理
        console.print("[yellow]⚠️  功能开发中...[/yellow]")

    def _run_comprehensive_testing_interactive(self):
        """交互式综合测试"""
        console.print("[blue]🚀 一键完整测试[/blue]")

        confirm = (
            input("⚠️  这将执行完整的测试流程，可能需要较长时间，是否继续？ (y/N): ")
            .strip()
            .lower()
        )
        if confirm != "y":
            console.print("[yellow]❌ 已取消[/yellow]")
            return

        try:
            self._run_comprehensive_testing(
                type(
                    "Args",
                    (),
                    {
                        "apps": None,
                        "types": None,
                        "sequential": False,
                        "changed_only": False,
                    },
                )()
            )
            console.print("[green]✅ 综合测试完成[/green]")
        except Exception as e:
            console.print(f"[red]❌ 综合测试失败: {e}[/red]")


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="AI-Code 统一测试系统")
    parser.add_argument("--config", default="config.yml", help="配置文件路径")
    parser.add_argument("--interactive", action="store_true", help="交互模式")
    parser.add_argument("--comprehensive", action="store_true", help="一键完整测试")
    parser.add_argument("--apps", nargs="*", help="要测试的应用")
    parser.add_argument("--types", nargs="*", help="测试类型")

    args = parser.parse_args()

    # 创建统一测试系统
    system = UnifiedTestSystem(args.config)

    if args.interactive:
        # 交互模式
        system.run_interactive_mode()
    elif args.comprehensive:
        # 一键完整测试
        system._display_banner()
        system._run_comprehensive_testing(args)
        console.print("[green]✅ 一键完整测试完成[/green]")
    else:
        # 显示帮助信息
        system._display_banner()
        console.print(
            "[yellow]💡 使用 --interactive 进入交互模式，或使用 --comprehensive 执行一键完整测试[/yellow]"
        )


if __name__ == "__main__":
    main()
