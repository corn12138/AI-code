#!/usr/bin/env python3
"""
AI-Code 企业级测试编排器
支持多应用、多环境、智能调度的自动化测试系统
"""

import asyncio
import json
import logging
import os
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from threading import Lock
from typing import Any, Dict, List, Optional, Tuple

# 添加当前目录到 Python 路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    import psutil
    import requests
    import yaml
except ImportError:
    # 如果依赖不可用，使用模拟实现
    psutil = None
    requests = None
    yaml = None

try:
    from reporter import TestReporter
    from utils.flaky_store import FlakyTestStore
    from utils.git_integration import GitIntegration
    from utils.logger import setup_logger
    from utils.notification import NotificationManager
    from utils.process_manager import ProcessManager
    from utils.resource_monitor import ResourceMonitor
except ImportError:
    # 如果模块不可用，使用模拟实现
    TestReporter = None
    FlakyTestStore = None
    GitIntegration = None
    setup_logger = None
    NotificationManager = None
    ProcessManager = None
    ResourceMonitor = None


class TestStatus(Enum):
    """测试状态枚举"""

    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    FLAKY = "flaky"
    TIMEOUT = "timeout"
    CANCELLED = "cancelled"


class TestType(Enum):
    """测试类型枚举"""

    UNIT = "unit"
    INTEGRATION = "integration"
    E2E = "e2e"
    PERFORMANCE = "performance"
    SECURITY = "security"
    CONTRACT = "contract"


@dataclass
class TestResult:
    """测试结果数据类"""

    test_id: str
    app_name: str
    test_type: TestType
    status: TestStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    coverage: Optional[float] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    is_flaky: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class AppConfig:
    """应用配置数据类"""

    name: str
    type: str
    path: str
    port: Optional[int]
    dependencies: List[str]
    priority: int
    enabled: bool = True
    commands: Dict[str, str] = field(default_factory=dict)
    env_file: Optional[str] = None
    test_timeout: int = 600
    startup_wait: int = 10
    health_check: Optional[Dict[str, Any]] = None
    database: Optional[Dict[str, Any]] = None
    coverage: Optional[Dict[str, int]] = None


class TestOrchestrator:
    """测试编排器主类"""

    def __init__(self, config_path: str = "config.yml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.logger = setup_logger("orchestrator", level=logging.INFO)

        # 初始化组件
        self.process_manager = ProcessManager()
        self.resource_monitor = ResourceMonitor()
        self.notification_manager = NotificationManager(
            self.config.get("notification", {})
        )
        self.git_integration = GitIntegration()
        self.flaky_store = FlakyTestStore()
        self.reporter = TestReporter()

        # 状态管理
        self.running_tests: Dict[str, TestResult] = {}
        self.completed_tests: List[TestResult] = []
        self.app_configs: Dict[str, AppConfig] = {}
        self.test_queue: List[Tuple[str, TestType]] = []
        self.lock = Lock()

        # 性能指标
        self.start_time = None
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.flaky_tests = 0

        self._initialize_apps()

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            self.logger.error(f"加载配置文件失败: {e}")
            return {}

    def _initialize_apps(self):
        """初始化应用配置"""
        apps_config = self.config.get("apps", {})
        for app_name, app_data in apps_config.items():
            if not app_data.get("enabled", True):
                continue

            app_config = AppConfig(
                name=app_data["name"],
                type=app_data["type"],
                path=app_data["path"],
                port=app_data.get("port"),
                dependencies=app_data.get("dependencies", []),
                priority=app_data.get("priority", 5),
                enabled=app_data.get("enabled", True),
                commands=app_data.get("commands", {}),
                env_file=app_data.get("env_file"),
                test_timeout=app_data.get("test_timeout", 600),
                startup_wait=app_data.get("startup_wait", 10),
                health_check=app_data.get("health_check"),
                database=app_data.get("database"),
                coverage=app_data.get("coverage"),
            )
            self.app_configs[app_name] = app_config

    async def run_tests(
        self,
        test_types: List[TestType] = None,
        apps: List[str] = None,
        changed_only: bool = False,
        parallel: bool = True,
    ) -> Dict[str, Any]:
        """运行测试"""
        self.start_time = datetime.now()
        self.logger.info("🚀 开始执行测试编排")

        # 确定要测试的应用
        target_apps = apps or list(self.app_configs.keys())
        target_test_types = test_types or [TestType.UNIT, TestType.INTEGRATION]

        # 变更驱动测试
        if changed_only:
            changed_files = self.git_integration.get_changed_files()
            target_apps = self._filter_apps_by_changes(target_apps, changed_files)
            self.logger.info(f"变更驱动测试，目标应用: {target_apps}")

        # 构建测试队列
        self._build_test_queue(target_apps, target_test_types)

        # 执行测试
        if parallel:
            await self._run_parallel_tests()
        else:
            await self._run_sequential_tests()

        # 生成报告
        report = await self._generate_report()

        # 发送通知
        await self._send_notifications(report)

        return report

    def _filter_apps_by_changes(
        self, apps: List[str], changed_files: List[str]
    ) -> List[str]:
        """根据变更文件过滤应用"""
        filtered_apps = []
        for app in apps:
            app_config = self.app_configs.get(app)
            if not app_config:
                continue

            # 检查是否有相关文件变更
            app_path = app_config.path
            for file_path in changed_files:
                if file_path.startswith(app_path) or file_path.startswith("shared/"):
                    filtered_apps.append(app)
                    break

        return filtered_apps

    def _build_test_queue(self, apps: List[str], test_types: List[TestType]):
        """构建测试队列"""
        self.test_queue = []

        # 按优先级排序应用
        sorted_apps = sorted(apps, key=lambda x: self.app_configs[x].priority)

        for app in sorted_apps:
            for test_type in test_types:
                self.test_queue.append((app, test_type))

        self.total_tests = len(self.test_queue)
        self.logger.info(f"构建测试队列完成，共 {self.total_tests} 个测试")

    async def _run_parallel_tests(self) -> Dict[str, Any]:
        """并行执行测试"""
        max_workers = self.config.get("execution", {}).get("parallel_workers", 6)
        # 获取最大并发应用数配置
        self.config.get("execution", {}).get("max_concurrent_apps", 3)

        self.logger.info(f"开始并行执行测试，最大工作进程: {max_workers}")

        # 按应用分组，避免同一应用并发执行
        app_groups = {}
        for app, test_type in self.test_queue:
            if app not in app_groups:
                app_groups[app] = []
            app_groups[app].append(test_type)

        # 执行测试
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = []

            for app, test_types in app_groups.items():
                for test_type in test_types:
                    future = executor.submit(self._execute_single_test, app, test_type)
                    futures.append(future)

            # 等待所有测试完成
            for future in as_completed(futures):
                try:
                    result = future.result()
                    self._update_test_result(result)
                except Exception as e:
                    self.logger.error(f"测试执行异常: {e}")

        return self._get_execution_summary()

    async def _run_sequential_tests(self) -> Dict[str, Any]:
        """顺序执行测试"""
        self.logger.info("开始顺序执行测试")

        for app, test_type in self.test_queue:
            try:
                result = self._execute_single_test(app, test_type)
                self._update_test_result(result)
            except Exception as e:
                self.logger.error(f"测试执行异常: {e}")

        return self._get_execution_summary()

    def _execute_single_test(self, app: str, test_type: TestType) -> TestResult:
        """执行单个测试"""
        test_id = f"{app}_{test_type.value}_{int(time.time())}"
        app_config = self.app_configs[app]

        start_time = datetime.now()
        self.logger.info(f"开始执行测试: {test_id}")

        # 创建测试结果对象
        result = TestResult(
            test_id=test_id,
            app_name=app,
            test_type=test_type,
            status=TestStatus.RUNNING,
            start_time=start_time,
        )

        try:
            # 检查是否为 Flaky 测试
            if self.flaky_store.is_flaky(test_id):
                result.is_flaky = True
                self.logger.warning(f"检测到 Flaky 测试: {test_id}")

            # 执行测试命令
            command = self._get_test_command(app_config, test_type)
            if not command:
                result.status = TestStatus.SKIPPED
                result.error_message = "未找到测试命令"
                return result

            # 设置环境变量
            env = self._prepare_environment(app_config)

            # 执行测试
            process = subprocess.run(
                command,
                shell=True,
                cwd=app_config.path,
                env=env,
                capture_output=True,
                text=True,
                timeout=app_config.test_timeout,
            )

            # 处理结果
            result.end_time = datetime.now()
            result.duration = (result.end_time - result.start_time).total_seconds()

            if process.returncode == 0:
                result.status = TestStatus.PASSED
                # 提取覆盖率信息
                result.coverage = self._extract_coverage(process.stdout)
            else:
                result.status = TestStatus.FAILED
                result.error_message = process.stderr

            # 更新 Flaky 状态
            if result.status == TestStatus.FAILED and result.is_flaky:
                self.flaky_store.record_failure(test_id)
            elif result.status == TestStatus.PASSED and result.is_flaky:
                self.flaky_store.record_success(test_id)

        except subprocess.TimeoutExpired:
            result.status = TestStatus.TIMEOUT
            result.error_message = "测试执行超时"
        except Exception as e:
            result.status = TestStatus.FAILED
            result.error_message = str(e)

        return result

    def _get_test_command(
        self, app_config: AppConfig, test_type: TestType
    ) -> Optional[str]:
        """获取测试命令"""
        command_map = {
            TestType.UNIT: "test_unit",
            TestType.INTEGRATION: "test_integration",
            TestType.E2E: "test_e2e",
            TestType.PERFORMANCE: "test_performance",
            TestType.SECURITY: "test_security",
            TestType.CONTRACT: "test_contract_verify",
        }

        command_key = command_map.get(test_type)
        if not command_key:
            return None

        return app_config.commands.get(command_key)

    def _prepare_environment(self, app_config: AppConfig) -> Dict[str, str]:
        """准备环境变量"""
        env = os.environ.copy()

        # 设置测试环境变量
        env.update({"NODE_ENV": "test", "TEST_ENV": "true", "CI": "true"})

        # 加载环境文件
        if app_config.env_file and os.path.exists(app_config.env_file):
            try:
                with open(app_config.env_file, "r") as f:
                    for line in f:
                        if "=" in line and not line.startswith("#"):
                            key, value = line.strip().split("=", 1)
                            env[key] = value
            except Exception as e:
                self.logger.warning(f"加载环境文件失败: {e}")

        return env

    def _extract_coverage(self, output: str) -> Optional[float]:
        """从输出中提取覆盖率信息"""
        try:
            # 这里可以根据不同的测试框架解析覆盖率
            # 例如 Jest, Vitest, Mocha 等
            lines = output.split("\n")
            for line in lines:
                if "All files" in line and "%" in line:
                    # 提取百分比
                    import re

                    match = re.search(r"(\d+(?:\.\d+)?)%", line)
                    if match:
                        return float(match.group(1))
        except Exception:
            pass
        return None

    def _update_test_result(self, result: TestResult):
        """更新测试结果"""
        with self.lock:
            if result.status == TestStatus.PASSED:
                self.passed_tests += 1
            elif result.status == TestStatus.FAILED:
                self.failed_tests += 1
            elif result.is_flaky:
                self.flaky_tests += 1

            self.completed_tests.append(result)

            # 记录到 Flaky 存储
            if result.is_flaky:
                self.flaky_store.update_test_status(result.test_id, result.status)

    def _get_execution_summary(self) -> Dict[str, Any]:
        """获取执行摘要"""
        end_time = datetime.now()
        total_duration = (end_time - self.start_time).total_seconds()

        return {
            "summary": {
                "total_tests": self.total_tests,
                "passed": self.passed_tests,
                "failed": self.failed_tests,
                "flaky": self.flaky_tests,
                "skipped": self.total_tests - self.passed_tests - self.failed_tests,
                "duration": total_duration,
                "success_rate": (
                    (self.passed_tests / self.total_tests * 100)
                    if self.total_tests > 0
                    else 0
                ),
            },
            "results": [result.__dict__ for result in self.completed_tests],
            "timestamp": end_time.isoformat(),
        }

    async def _generate_report(self) -> Dict[str, Any]:
        """生成测试报告"""
        self.logger.info("📊 生成测试报告")

        report_data = self._get_execution_summary()

        # 生成各种格式的报告
        await self.reporter.generate_reports(
            report_data, self.config.get("reporting", {})
        )

        return report_data

    async def _send_notifications(self, report: Dict[str, Any]):
        """发送通知"""
        summary = report.get("summary", {})

        # 确定通知类型
        notify_events = []
        if summary.get("failed", 0) > 0:
            notify_events.append("failure")
        if summary.get("flaky", 0) > 0:
            notify_events.append("flaky")
        if summary.get("success_rate", 0) == 100:
            notify_events.append("success")

        # 发送通知
        for event in notify_events:
            await self.notification_manager.send_notification(event, report)

    async def cleanup(self):
        """清理资源"""
        self.logger.info("🧹 清理测试资源")

        # 停止所有运行中的进程
        await self.process_manager.cleanup()

        # 保存 Flaky 测试状态
        self.flaky_store.save_state()

        self.logger.info("清理完成")


async def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="AI-Code 测试编排器")
    parser.add_argument("--config", default="config.yml", help="配置文件路径")
    parser.add_argument("--apps", nargs="+", help="要测试的应用")
    parser.add_argument(
        "--types", nargs="+", choices=[t.value for t in TestType], help="测试类型"
    )
    parser.add_argument("--changed-only", action="store_true", help="只测试变更的应用")
    parser.add_argument("--sequential", action="store_true", help="顺序执行测试")

    args = parser.parse_args()

    # 创建编排器
    orchestrator = TestOrchestrator(args.config)

    try:
        # 解析测试类型
        test_types = [TestType(t) for t in args.types] if args.types else None

        # 运行测试
        results = await orchestrator.run_tests(
            test_types=test_types,
            apps=args.apps,
            changed_only=args.changed_only,
            parallel=not args.sequential,
        )

        # 输出结果
        print(json.dumps(results, indent=2, ensure_ascii=False))

        # 返回适当的退出码
        if results["summary"]["failed"] > 0:
            sys.exit(1)
        else:
            sys.exit(0)

    except KeyboardInterrupt:
        print("\n测试被用户中断")
        sys.exit(130)
    except Exception as e:
        print(f"测试执行失败: {e}")
        sys.exit(1)
    finally:
        await orchestrator.cleanup()


if __name__ == "__main__":
    asyncio.run(main())
