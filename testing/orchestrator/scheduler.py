"""
智能测试调度器
负责测试任务的并行执行、依赖管理和资源调度
"""

import asyncio
import logging
import os
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

import psutil
from utils.flaky_store import FlakyStore
from utils.git_integration import GitManager
from utils.logger import get_logger
from utils.process_manager import ProcessManager
from utils.resource_monitor import ResourceMonitor

from config import AppConfig, TestConfig, TestStatus, TestSuite, get_config


@dataclass
class TestTask:
    """测试任务"""

    id: str
    suite: TestSuite
    app: Optional[str] = None
    command: str = ""
    dependencies: List[str] = field(default_factory=list)
    env: Dict[str, str] = field(default_factory=dict)
    timeout: int = 300
    retry_count: int = 0
    max_retries: int = 2

    # 运行时状态
    status: TestStatus = TestStatus.PENDING
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    output: str = ""
    error: str = ""
    return_code: Optional[int] = None
    process: Optional[subprocess.Popen] = None

    @property
    def duration(self) -> Optional[float]:
        """执行时长"""
        if self.start_time and self.end_time:
            return self.end_time - self.start_time
        return None

    @property
    def is_completed(self) -> bool:
        """是否完成"""
        return self.status in [
            TestStatus.PASSED,
            TestStatus.FAILED,
            TestStatus.SKIPPED,
            TestStatus.ERROR,
        ]

    @property
    def is_successful(self) -> bool:
        """是否成功"""
        return self.status == TestStatus.PASSED


class TestScheduler:
    """测试调度器"""

    def __init__(self, config: TestConfig):
        self.config = config
        self.logger = get_logger("scheduler")
        self.process_manager = ProcessManager()
        self.resource_monitor = ResourceMonitor()
        self.git = GitManager()
        self.flaky_store = FlakyStore()

        self.tasks: Dict[str, TestTask] = {}
        self.running_tasks: Set[str] = set()
        self.completed_tasks: Set[str] = set()
        self.failed_tasks: Set[str] = set()

        self.executor = ThreadPoolExecutor(max_workers=config.parallel_workers)
        self._shutdown = False

    async def add_task(self, task: TestTask):
        """添加测试任务"""
        self.tasks[task.id] = task
        self.logger.info(f"添加测试任务: {task.id} ({task.suite})")

    async def add_tasks_from_suite(self, suite: TestSuite, app: Optional[str] = None):
        """从测试套件添加任务"""
        if suite == TestSuite.ALL:
            # 添加所有套件的任务
            for test_suite in [TestSuite.UNIT, TestSuite.INTEGRATION, TestSuite.E2E]:
                await self.add_tasks_from_suite(test_suite, app)
            return

        if app:
            # 为特定应用添加任务
            await self._add_app_suite_tasks(app, suite)
        else:
            # 变更驱动：当 changed_only 为真时只为受影响的应用创建任务
            target_apps = list(self.config.apps.keys())
            if getattr(self.config, "changed_only", True):
                try:
                    changed = self.git.get_changed_files()
                    mapped = self.git.map_files_to_apps(changed)
                    affected_apps = self.git.expand_with_dependencies(mapped)
                    if affected_apps:
                        target_apps = [a for a in target_apps if a in affected_apps]
                except Exception:
                    # 回退为全量
                    target_apps = list(self.config.apps.keys())
            for app_name in target_apps:
                if app_name in self.config.apps:
                    await self._add_app_suite_tasks(app_name, suite)

    async def _add_app_suite_tasks(self, app_name: str, suite: TestSuite):
        """为特定应用和套件添加任务"""
        app_config = self.config.apps.get(app_name)
        if not app_config:
            self.logger.warning(f"未找到应用配置: {app_name}")
            return

        # 根据套件类型生成不同的测试命令
        commands = self._get_suite_commands(app_config, suite)

        for i, command in enumerate(commands):
            task_id = (
                f"{app_name}-{suite.value}-{i}"
                if len(commands) > 1
                else f"{app_name}-{suite.value}"
            )

            task = TestTask(
                id=task_id,
                suite=suite,
                app=app_name,
                command=command,
                dependencies=self._get_task_dependencies(app_name, suite),
                env=self._get_task_env(app_config),
                timeout=app_config.test_timeout,
                max_retries=self.config.retry_failed,
            )

            await self.add_task(task)

    def _get_suite_commands(self, app_config: AppConfig, suite: TestSuite) -> List[str]:
        """获取测试套件命令"""
        # 优先使用配置文件中的命令
        suite_command_map = {
            TestSuite.UNIT: "test_unit",
            TestSuite.INTEGRATION: "test_integration",
            TestSuite.E2E: "test_e2e",
            TestSuite.CONTRACT: "test_contract",
            TestSuite.PERFORMANCE: "test_performance",
            TestSuite.SECURITY: "security_scan",
        }

        command_type = suite_command_map.get(suite)
        if command_type and hasattr(app_config, "get_command"):
            command = app_config.get_command(command_type)
            return [f"cd {app_config.path} && {command}"]

        # 回退到默认命令
        fallback_commands = {
            TestSuite.UNIT: [
                f"cd {app_config.path} && npm run test:unit || npm test",
            ],
            TestSuite.INTEGRATION: [
                f"cd {app_config.path} && npm run test:integration || npm run test:e2e"
            ],
            TestSuite.E2E: [
                f"cd {app_config.path} && npm run test:e2e || npx playwright test"
            ],
            TestSuite.CONTRACT: [
                f"cd {app_config.path} && npm run test:contract || echo 'No contract tests'"
            ],
            TestSuite.PERFORMANCE: [
                f"cd {app_config.path} && npm run test:performance || k6 run performance/*.js"
            ],
            TestSuite.SECURITY: [
                f"cd {app_config.path} && npm audit",
                f"cd {app_config.path} && npm run security:scan || echo 'No security scan configured'",
            ],
        }

        return fallback_commands.get(
            suite, [getattr(app_config, "test_command", "npm test")]
        )

    def _get_task_dependencies(self, app_name: str, suite: TestSuite) -> List[str]:
        """获取任务依赖"""
        dependencies = []

        # 应用依赖
        app_config = self.config.apps.get(app_name)
        if app_config and app_config.dependencies:
            for dep_app in app_config.dependencies:
                dependencies.append(f"{dep_app}-{suite.value}")

        # 套件依赖 (集成测试依赖单元测试)
        if suite == TestSuite.INTEGRATION:
            dependencies.append(f"{app_name}-{TestSuite.UNIT.value}")
        elif suite == TestSuite.E2E:
            dependencies.extend(
                [
                    f"{app_name}-{TestSuite.UNIT.value}",
                    f"{app_name}-{TestSuite.INTEGRATION.value}",
                ]
            )

        return dependencies

    def _get_task_env(self, app_config: AppConfig) -> Dict[str, str]:
        """获取任务环境变量"""
        env = {
            "NODE_ENV": "test",
            "CI": "true" if self.config.ci_mode else "false",
            "TEST_TIMEOUT": str(app_config.test_timeout * 1000),  # 转换为毫秒
        }

        # 从环境文件加载
        if app_config.env_file:
            env.update(self._load_env_file(app_config.env_file))

        return env

    def _load_env_file(self, env_file: str) -> Dict[str, str]:
        """加载环境变量文件"""
        env = {}
        try:
            with open(env_file, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, value = line.split("=", 1)
                        env[key.strip()] = value.strip().strip("\"'")
        except Exception as e:
            self.logger.warning(f"无法加载环境文件 {env_file}: {e}")

        return env

    async def run_all(self) -> Dict[str, TestTask]:
        """运行所有测试任务"""
        if not self.tasks:
            self.logger.warning("没有测试任务需要运行")
            return {}

        self.logger.info(f"开始运行 {len(self.tasks)} 个测试任务")

        # 启动资源监控
        self.resource_monitor.start()

        try:
            await self._execute_tasks()
        finally:
            self.resource_monitor.stop()
            await self._cleanup()

        # 汇总结果
        self._log_summary()
        return self.tasks

    async def _execute_tasks(self):
        """执行测试任务"""
        while not self._all_tasks_completed() and not self._shutdown:
            # 获取可执行的任务
            ready_tasks = self._get_ready_tasks()

            if not ready_tasks:
                if self.running_tasks:
                    # 等待运行中的任务完成
                    await asyncio.sleep(1)
                    continue
                else:
                    # 没有可执行任务且没有运行中任务，可能存在循环依赖
                    self.logger.error("检测到可能的循环依赖或无法满足的依赖")
                    break

            # 检查资源使用情况
            if not self._has_available_resources():
                self.logger.info("资源不足，等待释放...")
                await asyncio.sleep(5)
                continue

            # 并行执行任务
            await self._execute_ready_tasks(ready_tasks)

            # 短暂等待避免过度轮询
            await asyncio.sleep(0.1)

    def _get_ready_tasks(self) -> List[TestTask]:
        """获取可执行的任务"""
        ready = []
        max_parallel = min(
            self.config.parallel_workers,
            self.config.parallel_workers - len(self.running_tasks),
        )

        for task in self.tasks.values():
            if (
                task.status == TestStatus.PENDING
                and len(ready) < max_parallel
                and self._dependencies_satisfied(task)
            ):
                ready.append(task)

        return ready

    def _dependencies_satisfied(self, task: TestTask) -> bool:
        """检查任务依赖是否满足"""
        for dep_id in task.dependencies:
            dep_task = self.tasks.get(dep_id)
            if not dep_task or not dep_task.is_successful:
                return False
        return True

    def _has_available_resources(self) -> bool:
        """检查是否有可用资源"""
        cpu_percent = psutil.cpu_percent(interval=1)
        memory_percent = psutil.virtual_memory().percent

        return cpu_percent < 80 and memory_percent < 85

    async def _execute_ready_tasks(self, ready_tasks: List[TestTask]):
        """并行执行准备好的任务"""
        tasks = []
        for task in ready_tasks:
            if len(self.running_tasks) < self.config.parallel_workers:
                tasks.append(self._execute_single_task(task))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

    async def _execute_single_task(self, task: TestTask):
        """执行单个测试任务"""
        task.status = TestStatus.RUNNING
        task.start_time = time.time()
        self.running_tasks.add(task.id)

        self.logger.info(f"开始执行任务: {task.id}")

        try:
            # 在线程池中执行命令
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(self.executor, self._run_task_command, task)

        except Exception as e:
            self.logger.error(f"任务 {task.id} 执行异常: {e}")
            task.status = TestStatus.ERROR
            task.error = str(e)

        finally:
            task.end_time = time.time()
            self.running_tasks.discard(task.id)

            if task.is_successful:
                self.completed_tasks.add(task.id)
            else:
                self.failed_tasks.add(task.id)

                # 重试失败的任务
                if task.retry_count < task.max_retries:
                    await self._retry_task(task)
                else:
                    # flaky 隔离：重试后仍失败，标记为隔离并写入清单
                    self.logger.warning(f"任务 {task.id} 标记为 flaky/隔离")
                    try:
                        self.flaky_store.add(task.id)
                    except Exception as e:
                        self.logger.error(f"写入 flaky 清单失败: {e}")

    def _run_task_command(self, task: TestTask):
        """在子进程中运行测试命令"""
        try:
            env = {**os.environ, **task.env}

            process = subprocess.Popen(
                task.command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                env=env,
                cwd=self.config.project_root,
            )

            task.process = process

            # 等待进程完成或超时
            try:
                output, _ = process.communicate(timeout=task.timeout)
                task.output = output
                task.return_code = process.returncode

                if process.returncode == 0:
                    task.status = TestStatus.PASSED
                else:
                    task.status = TestStatus.FAILED

            except subprocess.TimeoutExpired:
                process.kill()
                task.status = TestStatus.ERROR
                task.error = f"任务超时 ({task.timeout}s)"

        except Exception as e:
            task.status = TestStatus.ERROR
            task.error = str(e)

    async def _retry_task(self, task: TestTask):
        """重试失败的任务"""
        task.retry_count += 1
        task.status = TestStatus.PENDING
        task.start_time = None
        task.end_time = None
        task.process = None

        self.logger.info(
            f"重试任务 {task.id} (第 {task.retry_count}/{task.max_retries} 次)"
        )

        # 等待一段时间后重试
        await asyncio.sleep(5)

    def _all_tasks_completed(self) -> bool:
        """检查是否所有任务都已完成"""
        return all(task.is_completed for task in self.tasks.values())

    async def _cleanup(self):
        """清理资源"""
        # 终止所有运行中的进程
        for task in self.tasks.values():
            if task.process and task.process.poll() is None:
                try:
                    task.process.terminate()
                    await asyncio.sleep(2)
                    if task.process.poll() is None:
                        task.process.kill()
                except:
                    pass

        self.executor.shutdown(wait=True)

    def _log_summary(self):
        """输出执行摘要"""
        total = len(self.tasks)
        passed = len([t for t in self.tasks.values() if t.status == TestStatus.PASSED])
        failed = len([t for t in self.tasks.values() if t.status == TestStatus.FAILED])
        errors = len([t for t in self.tasks.values() if t.status == TestStatus.ERROR])

        total_duration = sum(t.duration or 0 for t in self.tasks.values())

        self.logger.info("=" * 60)
        self.logger.info("测试执行摘要")
        self.logger.info("=" * 60)
        self.logger.info(f"总任务数: {total}")
        self.logger.info(f"通过: {passed}")
        self.logger.info(f"失败: {failed}")
        self.logger.info(f"错误: {errors}")
        self.logger.info(f"总耗时: {total_duration:.2f}s")
        self.logger.info("=" * 60)

        # 输出失败任务详情
        failed_tasks = [t for t in self.tasks.values() if not t.is_successful]
        if failed_tasks:
            self.logger.error("失败任务详情:")
            for task in failed_tasks:
                self.logger.error(f"  {task.id}: {task.error or '命令执行失败'}")

    async def stop(self):
        """停止调度器"""
        self._shutdown = True
        await self._cleanup()


# 工具函数
async def run_test_suite(
    config: TestConfig, suite: TestSuite, app: Optional[str] = None
) -> Dict[str, TestTask]:
    """运行测试套件的便利函数"""
    scheduler = TestScheduler(config)

    try:
        await scheduler.add_tasks_from_suite(suite, app)
        results = await scheduler.run_all()
        return results
    finally:
        await scheduler.stop()


if __name__ == "__main__":
    import os

    from config import config

    async def test_scheduler():
        """测试调度器"""
        scheduler = TestScheduler(config)

        # 添加测试任务
        await scheduler.add_tasks_from_suite(TestSuite.UNIT, "blog")

        # 运行任务
        results = await scheduler.run_all()

        print(f"执行了 {len(results)} 个任务")
        for task_id, task in results.items():
            print(f"{task_id}: {task.status} ({task.duration:.2f}s)")

    # 运行测试
    asyncio.run(test_scheduler())
