#!/usr/bin/env python3
"""
AI-Code 智能测试调度器
基于依赖关系、资源使用和变更分析的智能测试调度
"""

import asyncio
import os
import subprocess
import time
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Set

try:
    import psutil
    import yaml
except ImportError:
    psutil = None
    yaml = None

from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()


class TestPriority(Enum):
    """测试优先级"""

    CRITICAL = 1
    HIGH = 2
    MEDIUM = 3
    LOW = 4


class TestStatus(Enum):
    """测试状态"""

    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    TIMEOUT = "timeout"


@dataclass
class TestTask:
    """测试任务"""

    app_name: str
    test_type: str
    priority: TestPriority
    dependencies: List[str]
    estimated_duration: float
    resource_requirements: Dict[str, float]
    status: TestStatus = TestStatus.PENDING
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    result: Optional[Dict[str, Any]] = None


@dataclass
class ResourceLimits:
    """资源限制"""

    max_cpu_percent: float = 80.0
    max_memory_percent: float = 85.0
    max_concurrent_tasks: int = 4
    max_disk_usage_percent: float = 90.0


class SmartTestScheduler:
    """智能测试调度器"""

    def __init__(self, config_path: str = "real-world-config.yml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.tasks: List[TestTask] = []
        self.running_tasks: Set[str] = set()
        self.completed_tasks: Set[str] = set()
        self.failed_tasks: Set[str] = set()
        self.resource_limits = ResourceLimits()
        self.resource_monitor = None
        self.start_time = None

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            console.print(f"[red]❌ 加载配置文件失败: {e}[/red]")
            return {}

    def _get_project_root(self) -> str:
        """获取项目根目录"""
        return self.config.get("project", {}).get(
            "root", "/Users/huangyuming/Desktop/createProjects/AI-code"
        )

    def _analyze_dependencies(self, apps: Dict[str, Any]) -> Dict[str, List[str]]:
        """分析应用依赖关系"""
        dependencies = {}

        for app_name, app_config in apps.items():
            deps = app_config.get("dependencies", [])
            dependencies[app_name] = deps

        return dependencies

    def _calculate_priority(
        self, app_name: str, app_config: Dict[str, Any], changed_files: List[str]
    ) -> TestPriority:
        """计算测试优先级"""
        # 获取应用配置的优先级
        app_config.get("priority", 3)

        # 检查是否为变更文件
        if any(f"apps/{app_name}/" in f for f in changed_files):
            return TestPriority.CRITICAL

        # 检查依赖关系
        dependencies = app_config.get("dependencies", [])
        if dependencies:
            return TestPriority.HIGH

        # 检查应用类型
        app_type = app_config.get("type", "")
        if app_type in ["nestjs", "server"]:
            return TestPriority.HIGH
        elif app_type in ["nextjs", "react"]:
            return TestPriority.MEDIUM
        else:
            return TestPriority.LOW

    def _estimate_duration(
        self, app_name: str, app_config: Dict[str, Any], test_type: str
    ) -> float:
        """估算测试执行时间"""
        # 基础时间估算（秒）
        base_times = {
            "unit": 30,
            "integration": 120,
            "e2e": 300,
            "performance": 600,
            "security": 180,
        }

        base_time = base_times.get(test_type, 60)

        # 根据应用类型调整
        app_type = app_config.get("type", "")
        if app_type == "nestjs":
            base_time *= 1.5
        elif app_type == "nextjs":
            base_time *= 1.2

        # 根据应用大小调整
        app_size = self._get_app_size(app_name)
        if app_size > 1000:  # 大应用
            base_time *= 1.3
        elif app_size < 100:  # 小应用
            base_time *= 0.8

        return base_time

    def _get_app_size(self, app_name: str) -> int:
        """获取应用大小（文件数）"""
        try:
            app_path = os.path.join(self._get_project_root(), f"apps/{app_name}")
            if not os.path.exists(app_path):
                return 100

            count = 0
            for root, dirs, files in os.walk(app_path):
                # 排除 node_modules 等目录
                dirs[:] = [
                    d
                    for d in dirs
                    if d not in ["node_modules", ".git", "dist", "build"]
                ]
                count += len(files)

            return count
        except Exception:
            return 100

    def _estimate_resource_requirements(
        self, app_name: str, app_config: Dict[str, Any], test_type: str
    ) -> Dict[str, float]:
        """估算资源需求"""
        # 基础资源需求
        base_cpu = 20.0  # CPU 百分比
        base_memory = 200.0  # 内存 MB

        # 根据测试类型调整
        if test_type == "e2e":
            base_cpu *= 1.5
            base_memory *= 2.0
        elif test_type == "performance":
            base_cpu *= 2.0
            base_memory *= 3.0
        elif test_type == "security":
            base_cpu *= 1.2
            base_memory *= 1.5

        # 根据应用类型调整
        app_type = app_config.get("type", "")
        if app_type == "nestjs":
            base_memory *= 1.5
        elif app_type == "nextjs":
            base_cpu *= 1.3
            base_memory *= 1.2

        return {
            "cpu_percent": base_cpu,
            "memory_mb": base_memory,
            "disk_mb": 100.0,  # 基础磁盘需求
        }

    def _get_changed_files(self) -> List[str]:
        """获取变更文件列表"""
        try:
            result = subprocess.run(
                ["git", "diff", "--name-only", "HEAD~1", "HEAD"],
                capture_output=True,
                text=True,
            )

            if result.returncode != 0:
                return []

            return result.stdout.strip().split("\n")
        except Exception:
            return []

    def _check_system_resources(self) -> Dict[str, float]:
        """检查系统资源使用情况"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")

        return {
            "cpu_percent": cpu_percent,
            "memory_percent": memory.percent,
            "disk_percent": disk.percent,
            "available_memory_mb": memory.available / 1024 / 1024,
        }

    def _can_run_task(self, task: TestTask) -> bool:
        """检查是否可以运行任务"""
        # 检查依赖是否完成
        for dep in task.dependencies:
            if dep not in self.completed_tasks:
                return False

        # 检查系统资源
        resources = self._check_system_resources()
        requirements = task.resource_requirements

        if (
            resources["cpu_percent"] + requirements["cpu_percent"]
            > self.resource_limits.max_cpu_percent
        ):
            return False

        if (
            resources["memory_percent"] + (requirements["memory_mb"] / 1024)
            > self.resource_limits.max_memory_percent
        ):
            return False

        if resources["disk_percent"] > self.resource_limits.max_disk_usage_percent:
            return False

        # 检查并发限制
        if len(self.running_tasks) >= self.resource_limits.max_concurrent_tasks:
            return False

        return True

    def _create_test_tasks(
        self, apps: Dict[str, Any], test_types: List[str]
    ) -> List[TestTask]:
        """创建测试任务"""
        tasks = []
        changed_files = self._get_changed_files()
        dependencies = self._analyze_dependencies(apps)

        for app_name, app_config in apps.items():
            if not app_config.get("enabled", True):
                continue

            for test_type in test_types:
                # 检查是否有对应的测试命令
                command_key = f"test_{test_type}"
                command = app_config.get("commands", {}).get(command_key)

                if not command:
                    continue

                # 计算优先级
                priority = self._calculate_priority(app_name, app_config, changed_files)

                # 估算执行时间
                estimated_duration = self._estimate_duration(
                    app_name, app_config, test_type
                )

                # 估算资源需求
                resource_requirements = self._estimate_resource_requirements(
                    app_name, app_config, test_type
                )

                # 获取依赖
                task_dependencies = dependencies.get(app_name, [])

                task = TestTask(
                    app_name=app_name,
                    test_type=test_type,
                    priority=priority,
                    dependencies=task_dependencies,
                    estimated_duration=estimated_duration,
                    resource_requirements=resource_requirements,
                )

                tasks.append(task)

        return tasks

    def _sort_tasks_by_priority(self, tasks: List[TestTask]) -> List[TestTask]:
        """按优先级排序任务"""
        return sorted(tasks, key=lambda t: (t.priority.value, -t.estimated_duration))

    def _run_task(self, task: TestTask) -> Dict[str, Any]:
        """运行单个测试任务"""
        task_id = f"{task.app_name}_{task.test_type}"
        task.status = TestStatus.RUNNING
        task.start_time = datetime.now()
        self.running_tasks.add(task_id)

        console.print(f"[blue]🧪 运行测试: {task.app_name} - {task.test_type}[/blue]")

        try:
            # 获取应用配置
            apps = self.config.get("apps", {})
            app_config = apps.get(task.app_name, {})
            app_path = app_config.get("path", f"./apps/{task.app_name}")
            full_path = os.path.join(self._get_project_root(), app_path)

            # 获取测试命令
            command_key = f"test_{task.test_type}"
            command = app_config.get("commands", {}).get(command_key)

            if not command:
                return {"status": "skipped", "reason": "No command found"}

            # 执行测试
            start_time = time.time()
            result = subprocess.run(
                command.split(),
                cwd=full_path,
                capture_output=True,
                text=True,
                timeout=int(task.estimated_duration * 2),  # 2倍超时时间
            )

            end_time = time.time()
            duration = end_time - start_time

            task_result = {
                "app": task.app_name,
                "test_type": task.test_type,
                "command": command,
                "return_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "duration": duration,
                "status": "passed" if result.returncode == 0 else "failed",
            }

            if result.returncode == 0:
                task.status = TestStatus.PASSED
                self.completed_tasks.add(task_id)
                console.print(
                    f"[green]✅ {task.app_name} - {task.test_type} 通过 ({duration:.2f}s)[/green]"
                )
            else:
                task.status = TestStatus.FAILED
                self.failed_tasks.add(task_id)
                console.print(
                    f"[red]❌ {task.app_name} - {task.test_type} 失败 ({duration:.2f}s)[/red]"
                )

            task.end_time = datetime.now()
            task.result = task_result

            return task_result

        except subprocess.TimeoutExpired:
            task.status = TestStatus.TIMEOUT
            self.failed_tasks.add(task_id)
            console.print(f"[red]❌ {task.app_name} - {task.test_type} 超时[/red]")
            return {"status": "timeout", "duration": task.estimated_duration * 2}

        except Exception as e:
            task.status = TestStatus.FAILED
            self.failed_tasks.add(task_id)
            console.print(f"[red]❌ {task.app_name} - {task.test_type} 异常: {e}[/red]")
            return {"status": "error", "error": str(e)}

        finally:
            self.running_tasks.discard(task_id)

    def _display_schedule(self, tasks: List[TestTask]) -> None:
        """显示调度计划"""
        console.print("\n[bold blue]📅 智能调度计划[/bold blue]")

        table = Table(title="测试任务调度")
        table.add_column("应用", style="cyan")
        table.add_column("测试类型", style="magenta")
        table.add_column("优先级", style="yellow")
        table.add_column("依赖", style="blue")
        table.add_column("预估时间", justify="right")
        table.add_column("资源需求", justify="right")

        for task in tasks:
            priority_name = task.priority.name
            deps = ", ".join(task.dependencies) if task.dependencies else "无"
            duration = f"{task.estimated_duration:.1f}s"
            resources = f"CPU:{task.resource_requirements['cpu_percent']:.1f}%"

            table.add_row(
                task.app_name, task.test_type, priority_name, deps, duration, resources
            )

        console.print(table)

    def _display_progress(self, total_tasks: int) -> None:
        """显示执行进度"""
        completed = len(self.completed_tasks)
        failed = len(self.failed_tasks)
        running = len(self.running_tasks)
        pending = total_tasks - completed - failed - running

        console.print(
            f"\n[blue]📊 执行进度: 完成 {completed}, 失败 {failed}, 运行中 {running}, 等待 {pending}[/blue]"
        )

        # 显示资源使用情况
        resources = self._check_system_resources()
        console.print(
            f"[blue]💻 系统资源: CPU {resources['cpu_percent']:.1f}%, 内存 {resources['memory_percent']:.1f}%[/blue]"
        )

    async def schedule_and_run(
        self, apps: Dict[str, Any], test_types: List[str]
    ) -> Dict[str, Any]:
        """智能调度并运行测试"""
        self.start_time = datetime.now()

        console.print(
            Panel.fit(
                "[bold blue]🧠 AI-Code 智能测试调度器[/bold blue]\n"
                f"开始时间: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}",
                border_style="blue",
            )
        )

        # 创建测试任务
        self.tasks = self._create_test_tasks(apps, test_types)

        if not self.tasks:
            console.print("[yellow]⚠️  没有找到可执行的测试任务[/yellow]")
            return {"status": "no_tasks"}

        # 按优先级排序
        self.tasks = self._sort_tasks_by_priority(self.tasks)

        # 显示调度计划
        self._display_schedule(self.tasks)

        # 执行任务
        total_tasks = len(self.tasks)

        while self.tasks:
            # 找到可以运行的任务
            runnable_tasks = [task for task in self.tasks if self._can_run_task(task)]

            if not runnable_tasks:
                # 没有可运行的任务，等待一段时间
                console.print("[yellow]⏳ 等待资源释放...[/yellow]")
                await asyncio.sleep(5)
                continue

            # 运行可执行的任务
            running_tasks = []
            for task in runnable_tasks[
                : self.resource_limits.max_concurrent_tasks - len(self.running_tasks)
            ]:
                if task not in [
                    t for t in self.tasks if t.status == TestStatus.RUNNING
                ]:
                    # 创建异步任务
                    async_task = asyncio.create_task(
                        asyncio.to_thread(self._run_task, task)
                    )
                    running_tasks.append(async_task)

            # 等待任务完成
            if running_tasks:
                await asyncio.gather(*running_tasks, return_exceptions=True)

            # 移除已完成的任务
            self.tasks = [
                task
                for task in self.tasks
                if task.status
                not in [TestStatus.PASSED, TestStatus.FAILED, TestStatus.TIMEOUT]
            ]

            # 显示进度
            self._display_progress(total_tasks)

        # 生成最终结果
        all_results = {}
        for task in self.tasks + [
            t
            for t in self.tasks
            if t.status in [TestStatus.PASSED, TestStatus.FAILED, TestStatus.TIMEOUT]
        ]:
            if task.result:
                key = f"{task.app_name}_{task.test_type}"
                all_results[key] = task.result

        self.end_time = datetime.now()

        # 显示最终统计
        console.print("\n[bold green]✅ 测试完成[/bold green]")
        console.print(f"📊 总任务数: {total_tasks}")
        console.print(f"✅ 通过: {len(self.completed_tasks)}")
        console.print(f"❌ 失败: {len(self.failed_tasks)}")
        console.print(
            f"⏱️  总耗时: {(self.end_time - self.start_time).total_seconds():.2f}s"
        )

        return {
            "summary": {
                "total_tasks": total_tasks,
                "completed": len(self.completed_tasks),
                "failed": len(self.failed_tasks),
                "duration": (self.end_time - self.start_time).total_seconds(),
            },
            "results": all_results,
        }


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="AI-Code 智能测试调度器")
    parser.add_argument("--config", default="config.yml", help="配置文件路径")
    parser.add_argument("--apps", nargs="*", help="要测试的应用")
    parser.add_argument(
        "--types",
        nargs="*",
        choices=["unit", "integration", "e2e", "performance", "security"],
        help="测试类型",
    )

    args = parser.parse_args()

    # 创建调度器
    scheduler = SmartTestScheduler(args.config)

    # 获取应用配置
    apps = scheduler.config.get("apps", {})
    if args.apps:
        apps = {name: config for name, config in apps.items() if name in args.apps}

    # 默认测试类型
    test_types = args.types or ["unit", "integration", "e2e"]

    # 运行调度
    try:
        results = asyncio.run(scheduler.schedule_and_run(apps, test_types))

        if results.get("status") == "no_tasks":
            console.print("[yellow]⚠️  没有可执行的测试任务[/yellow]")
            return

        # 检查结果
        failed_count = results["summary"]["failed"]
        if failed_count > 0:
            console.print(f"[red]❌ {failed_count} 个测试失败[/red]")
            exit(1)
        else:
            console.print("[green]✅ 所有测试通过[/green]")

    except KeyboardInterrupt:
        console.print("\n[yellow]⚠️  测试被用户中断[/yellow]")
        exit(1)
    except Exception as e:
        console.print(f"[red]❌ 调度器异常: {e}[/red]")
        exit(1)


if __name__ == "__main__":
    main()
