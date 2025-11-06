#!/usr/bin/env python3
"""
AI-Code 企业级增强测试启动器
支持智能调度、实时监控、多格式报告
"""

import argparse
import asyncio
import json
import os
import signal
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import yaml
except ImportError:
    yaml = None

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()


class EnhancedTestRunner:
    """增强版测试运行器"""

    def __init__(self, config_path: str = "real-world-config.yml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.running_processes = []
        self.test_results = {}
        self.start_time = None
        self.end_time = None
        self.monitoring = False
        self.resource_monitor = None

        # 设置信号处理
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            console.print(f"[red]❌ 加载配置文件失败: {e}[/red]")
            return {}

    def _signal_handler(self, signum, frame):
        """信号处理器"""
        console.print(f"\n[yellow]🛑 收到信号 {signum}，正在停止测试...[/yellow]")
        self.stop_all_tests()

    def _get_project_root(self) -> str:
        """获取项目根目录"""
        return self.config.get("project", {}).get(
            "root", "/Users/huangyuming/Desktop/createProjects/AI-code"
        )

    def _get_apps(self) -> Dict[str, Any]:
        """获取应用配置"""
        return self.config.get("apps", {})

    def _get_execution_config(self) -> Dict[str, Any]:
        """获取执行配置"""
        return self.config.get("execution", {})

    def _check_dependencies(self) -> bool:
        """检查依赖"""
        console.print("[blue]🔍 检查依赖...[/blue]")

        # 检查 Node.js 和 pnpm
        try:
            result = subprocess.run(
                ["node", "--version"], capture_output=True, text=True
            )
            if result.returncode != 0:
                console.print("[red]❌ Node.js 未安装[/red]")
                return False
            console.print(f"[green]✅ Node.js: {result.stdout.strip()}[/green]")
        except FileNotFoundError:
            console.print("[red]❌ Node.js 未安装[/red]")
            return False

        try:
            result = subprocess.run(
                ["pnpm", "--version"], capture_output=True, text=True
            )
            if result.returncode != 0:
                console.print("[red]❌ pnpm 未安装[/red]")
                return False
            console.print(f"[green]✅ pnpm: {result.stdout.strip()}[/green]")
        except FileNotFoundError:
            console.print("[red]❌ pnpm 未安装[/red]")
            return False

        return True

    def _setup_environment(self) -> bool:
        """设置测试环境"""
        console.print("[blue]🔧 设置测试环境...[/blue]")

        project_root = self._get_project_root()

        # 设置环境变量
        os.environ["NODE_ENV"] = "test"
        os.environ["TEST_ENV"] = "true"
        os.environ["CI"] = "true"

        # 安装依赖
        try:
            console.print("[blue]📦 安装项目依赖...[/blue]")
            result = subprocess.run(
                ["pnpm", "install"],
                cwd=project_root,
                capture_output=True,
                text=True,
                timeout=300,
            )
            if result.returncode != 0:
                console.print(f"[red]❌ 依赖安装失败: {result.stderr}[/red]")
                return False
            console.print("[green]✅ 依赖安装成功[/green]")
        except subprocess.TimeoutExpired:
            console.print("[red]❌ 依赖安装超时[/red]")
            return False
        except Exception as e:
            console.print(f"[red]❌ 依赖安装失败: {e}[/red]")
            return False

        return True

    def _get_changed_apps(self) -> List[str]:
        """获取变更的应用"""
        try:
            # 使用 git 获取变更文件
            result = subprocess.run(
                ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
                capture_output=True,
                text=True,
            )

            if result.returncode != 0:
                return []

            changed_files = result.stdout.strip().split("\n")
            changed_apps = set()

            for file_path in changed_files:
                if file_path.startswith("apps/"):
                    app_name = file_path.split("/")[1]
                    changed_apps.add(app_name)

            return list(changed_apps)
        except Exception:
            return []

    def _run_app_tests(
        self, app_name: str, app_config: Dict[str, Any], test_types: List[str]
    ) -> Dict[str, Any]:
        """运行单个应用的测试"""
        app_path = app_config.get("path", f"./apps/{app_name}")
        full_path = os.path.join(self._get_project_root(), app_path)

        results = {
            "app": app_name,
            "path": app_path,
            "tests": {},
            "start_time": datetime.now().isoformat(),
            "status": "running",
        }

        console.print(f"[blue]🧪 测试应用: {app_name}[/blue]")

        for test_type in test_types:
            command_key = f"test_{test_type}"
            command = app_config.get("commands", {}).get(command_key)

            if not command:
                console.print(
                    f"[yellow]⚠️  {app_name} 没有 {test_type} 测试命令[/yellow]"
                )
                continue

            console.print(f"[blue]🔬 运行 {test_type} 测试...[/blue]")

            try:
                start_time = time.time()
                result = subprocess.run(
                    command.split(),
                    cwd=full_path,
                    capture_output=True,
                    text=True,
                    timeout=1800,  # 30分钟超时
                )

                end_time = time.time()
                duration = end_time - start_time

                test_result = {
                    "type": test_type,
                    "command": command,
                    "return_code": result.returncode,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "duration": duration,
                    "status": "passed" if result.returncode == 0 else "failed",
                }

                results["tests"][test_type] = test_result

                if result.returncode == 0:
                    console.print(
                        f"[green]✅ {test_type} 测试通过 ({duration:.2f}s)[/green]"
                    )
                else:
                    console.print(
                        f"[red]❌ {test_type} 测试失败 ({duration:.2f}s)[/red]"
                    )
                    console.print(f"[red]错误信息: {result.stderr}[/red]")

            except subprocess.TimeoutExpired:
                console.print(f"[red]❌ {test_type} 测试超时[/red]")
                results["tests"][test_type] = {
                    "type": test_type,
                    "status": "timeout",
                    "duration": 1800,
                }
            except Exception as e:
                console.print(f"[red]❌ {test_type} 测试异常: {e}[/red]")
                results["tests"][test_type] = {
                    "type": test_type,
                    "status": "error",
                    "error": str(e),
                }

        results["end_time"] = datetime.now().isoformat()
        results["status"] = "completed"

        return results

    def _generate_report(self, results: Dict[str, Any]) -> None:
        """生成测试报告"""
        console.print("[blue]📊 生成测试报告...[/blue]")

        # 创建报告目录
        reports_dir = Path("reports")
        reports_dir.mkdir(exist_ok=True)

        # 生成 JSON 报告
        json_report = {
            "summary": {
                "total_apps": len(results),
                "passed_apps": sum(
                    1 for r in results.values() if r.get("status") == "completed"
                ),
                "failed_apps": sum(
                    1 for r in results.values() if r.get("status") == "failed"
                ),
                "start_time": self.start_time.isoformat() if self.start_time else None,
                "end_time": self.end_time.isoformat() if self.end_time else None,
                "duration": (
                    (self.end_time - self.start_time).total_seconds()
                    if self.start_time and self.end_time
                    else 0
                ),
            },
            "results": results,
        }

        # 保存 JSON 报告
        json_file = (
            reports_dir / f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(json_report, f, indent=2, ensure_ascii=False)

        console.print(f"[green]✅ JSON 报告已保存: {json_file}[/green]")

        # 生成 HTML 报告
        self._generate_html_report(json_report, reports_dir)

    def _generate_html_report(
        self, report_data: Dict[str, Any], reports_dir: Path
    ) -> None:
        """生成 HTML 报告"""
        html_content = f"""
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI-Code 测试报告</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }}
        .container {{ max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }}
        .summary {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }}
        .summary-card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }}
        .summary-card h3 {{ margin: 0 0 10px 0; color: #333; }}
        .summary-card .number {{ font-size: 2em; font-weight: bold; }}
        .passed {{ color: #28a745; }}
        .failed {{ color: #dc3545; }}
        .app-results {{ padding: 30px; }}
        .app-card {{ background: #f8f9fa; margin: 20px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }}
        .app-card.failed {{ border-left-color: #dc3545; }}
        .test-details {{ margin-top: 15px; }}
        .test-item {{ display: flex; justify-content: space-between; align-items: center; padding: 10px; background: white; margin: 5px 0; border-radius: 4px; }}
        .status {{ padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }}
        .status.passed {{ background: #d4edda; color: #155724; }}
        .status.failed {{ background: #f8d7da; color: #721c24; }}
        .status.timeout {{ background: #fff3cd; color: #856404; }}
        .status.error {{ background: #f8d7da; color: #721c24; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 AI-Code 企业级测试报告</h1>
            <p>生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>总应用数</h3>
                <div class="number">{report_data['summary']['total_apps']}</div>
            </div>
            <div class="summary-card">
                <h3>通过应用</h3>
                <div class="number passed">{report_data['summary']['passed_apps']}</div>
            </div>
            <div class="summary-card">
                <h3>失败应用</h3>
                <div class="number failed">{report_data['summary']['failed_apps']}</div>
            </div>
            <div class="summary-card">
                <h3>执行时间</h3>
                <div class="number">{report_data['summary']['duration']:.2f}s</div>
            </div>
        </div>
        
        <div class="app-results">
            <h2>📊 详细结果</h2>
"""

        for app_name, app_result in report_data["results"].items():
            status_class = "failed" if app_result.get("status") == "failed" else ""
            html_content += f"""
            <div class="app-card {status_class}">
                <h3>📱 {app_name}</h3>
                <p>路径: {app_result.get('path', 'N/A')}</p>
                <div class="test-details">
"""

            for test_type, test_result in app_result.get("tests", {}).items():
                status_class = test_result.get("status", "unknown")
                duration = test_result.get("duration", 0)
                html_content += f"""
                    <div class="test-item">
                        <span><strong>{test_type}</strong> - {test_result.get('command', 'N/A')}</span>
                        <span class="status {status_class}">{status_class.upper()}</span>
                        <span>{duration:.2f}s</span>
                    </div>
"""

            html_content += """
                </div>
            </div>
"""

        html_content += """
        </div>
    </div>
</body>
</html>
"""

        html_file = (
            reports_dir / f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html"
        )
        with open(html_file, "w", encoding="utf-8") as f:
            f.write(html_content)

        console.print(f"[green]✅ HTML 报告已保存: {html_file}[/green]")

    def _display_summary(self, results: Dict[str, Any]) -> None:
        """显示测试摘要"""
        console.print("\n[bold blue]📊 测试摘要[/bold blue]")

        total_apps = len(results)
        passed_apps = sum(1 for r in results.values() if r.get("status") == "completed")
        failed_apps = total_apps - passed_apps

        # 创建摘要表格
        table = Table(title="测试结果摘要")
        table.add_column("应用", style="cyan")
        table.add_column("状态", style="magenta")
        table.add_column("测试数", justify="right")
        table.add_column("通过", justify="right", style="green")
        table.add_column("失败", justify="right", style="red")
        table.add_column("耗时", justify="right")

        for app_name, app_result in results.items():
            tests = app_result.get("tests", {})
            total_tests = len(tests)
            passed_tests = sum(1 for t in tests.values() if t.get("status") == "passed")
            failed_tests = total_tests - passed_tests

            status = "✅ 通过" if app_result.get("status") == "completed" else "❌ 失败"
            duration = sum(t.get("duration", 0) for t in tests.values())

            table.add_row(
                app_name,
                status,
                str(total_tests),
                str(passed_tests),
                str(failed_tests),
                f"{duration:.2f}s",
            )

        console.print(table)

        # 显示总体统计
        console.print("\n[bold]总体统计:[/bold]")
        console.print(f"📱 总应用数: {total_apps}")
        console.print(f"✅ 通过应用: {passed_apps}")
        console.print(f"❌ 失败应用: {failed_apps}")
        if self.start_time and self.end_time:
            console.print(
                f"⏱️  总耗时: {(self.end_time - self.start_time).total_seconds():.2f}s"
            )

    def stop_all_tests(self):
        """停止所有测试"""
        for process in self.running_processes:
            try:
                process.terminate()
            except:
                pass
        self.running_processes.clear()

    async def run_tests(
        self,
        apps: List[str] = None,
        test_types: List[str] = None,
        sequential: bool = False,
        changed_only: bool = False,
        setup_only: bool = False,
    ) -> Dict[str, Any]:
        """运行测试"""

        self.start_time = datetime.now()

        # 显示启动信息
        console.print(
            Panel.fit(
                "[bold blue]🚀 AI-Code 企业级测试系统[/bold blue]\n"
                f"配置文件: {self.config_path}\n"
                f"开始时间: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}",
                border_style="blue",
            )
        )

        # 检查依赖
        if not self._check_dependencies():
            return {"error": "依赖检查失败"}

        # 设置环境
        if not self._setup_environment():
            return {"error": "环境设置失败"}

        if setup_only:
            console.print("[green]✅ 环境设置完成[/green]")
            return {"status": "setup_completed"}

        # 获取应用列表
        all_apps = self._get_apps()
        if not all_apps:
            console.print("[red]❌ 没有找到应用配置[/red]")
            return {"error": "没有找到应用配置"}

        # 确定要测试的应用
        if changed_only:
            changed_apps = self._get_changed_apps()
            if changed_apps:
                apps = [app for app in changed_apps if app in all_apps]
                console.print(f"[blue]🔍 检测到变更应用: {', '.join(apps)}[/blue]")
            else:
                console.print("[yellow]⚠️  没有检测到变更的应用[/yellow]")
                return {"status": "no_changes"}

        if not apps:
            apps = list(all_apps.keys())

        # 过滤启用的应用
        enabled_apps = {
            name: config
            for name, config in all_apps.items()
            if name in apps and config.get("enabled", True)
        }

        if not enabled_apps:
            console.print("[red]❌ 没有启用的应用[/red]")
            return {"error": "没有启用的应用"}

        # 默认测试类型
        if not test_types:
            test_types = ["unit", "integration", "e2e"]

        console.print(f"[blue]🎯 测试应用: {', '.join(enabled_apps.keys())}[/blue]")
        console.print(f"[blue]🔬 测试类型: {', '.join(test_types)}[/blue]")

        # 运行测试
        results = {}

        if sequential:
            # 顺序执行
            for app_name, app_config in enabled_apps.items():
                result = self._run_app_tests(app_name, app_config, test_types)
                results[app_name] = result
        else:
            # 并行执行（简化版）
            tasks = []
            for app_name, app_config in enabled_apps.items():
                task = asyncio.create_task(
                    asyncio.to_thread(
                        self._run_app_tests, app_name, app_config, test_types
                    )
                )
                tasks.append((app_name, task))

            for app_name, task in tasks:
                result = await task
                results[app_name] = result

        self.end_time = datetime.now()

        # 生成报告
        self._generate_report(results)

        # 显示摘要
        self._display_summary(results)

        return results


def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="AI-Code 企业级测试启动器")
    parser.add_argument("--config", default="config.yml", help="配置文件路径")
    parser.add_argument("--apps", nargs="*", help="要测试的应用")
    parser.add_argument(
        "--types",
        nargs="*",
        choices=["unit", "integration", "e2e", "performance", "security"],
        help="测试类型",
    )
    parser.add_argument("--sequential", action="store_true", help="顺序执行测试")
    parser.add_argument("--changed-only", action="store_true", help="只测试变更的应用")
    parser.add_argument("--setup-only", action="store_true", help="只设置环境")

    args = parser.parse_args()

    # 创建测试运行器
    runner = EnhancedTestRunner(args.config)

    # 运行测试
    try:
        results = asyncio.run(
            runner.run_tests(
                apps=args.apps,
                test_types=args.types,
                sequential=args.sequential,
                changed_only=args.changed_only,
                setup_only=args.setup_only,
            )
        )

        # 检查结果
        if "error" in results:
            console.print(f"[red]❌ 测试失败: {results['error']}[/red]")
            sys.exit(1)
        elif results.get("status") == "no_changes":
            console.print("[yellow]⚠️  没有检测到变更，跳过测试[/yellow]")
            sys.exit(0)
        else:
            # 检查是否有失败的测试
            failed_apps = [
                name
                for name, result in results.items()
                if result.get("status") != "completed"
            ]
            if failed_apps:
                console.print(
                    f"[red]❌ 以下应用测试失败: {', '.join(failed_apps)}[/red]"
                )
                sys.exit(1)
            else:
                console.print("[green]✅ 所有测试通过[/green]")
                sys.exit(0)

    except KeyboardInterrupt:
        console.print("\n[yellow]⚠️  测试被用户中断[/yellow]")
        runner.stop_all_tests()
        sys.exit(1)
    except Exception as e:
        console.print(f"[red]❌ 测试执行异常: {e}[/red]")
        sys.exit(1)


if __name__ == "__main__":
    main()
