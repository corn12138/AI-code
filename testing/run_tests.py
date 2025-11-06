#!/usr/bin/env python3
"""
AI-Code 企业级测试启动器
一键启动完整的测试流程
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
from typing import Any, Dict, List, Optional

try:
    import yaml
except ImportError:
    yaml = None


class TestRunner:
    """测试运行器"""

    def __init__(self, config_path: str = "config.yml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.running_processes = []
        self.test_results = {}
        self.start_time = None
        self.end_time = None

        # 设置信号处理
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            print(f"❌ 加载配置文件失败: {e}")
            return {}

    def _signal_handler(self, signum, frame):
        """信号处理器"""
        print(f"\n🛑 收到信号 {signum}，正在停止测试...")
        self.stop_all_tests()
        sys.exit(0)

    async def run_full_test_suite(
        self,
        apps: List[str] = None,
        test_types: List[str] = None,
        parallel: bool = True,
        changed_only: bool = False,
    ) -> Dict[str, Any]:
        """运行完整测试套件"""
        print("🚀 启动 AI-Code 企业级测试套件")
        print("=" * 60)

        self.start_time = datetime.now()

        # 确定要测试的应用
        target_apps = apps or self._get_enabled_apps()
        target_test_types = test_types or ["unit", "integration", "e2e"]

        print(f"📋 测试应用: {', '.join(target_apps)}")
        print(f"📋 测试类型: {', '.join(target_test_types)}")
        print(f"📋 并行执行: {'是' if parallel else '否'}")
        print(f"📋 变更驱动: {'是' if changed_only else '否'}")
        print("=" * 60)

        # 执行测试
        if parallel:
            results = await self._run_parallel_tests(target_apps, target_test_types)
        else:
            results = await self._run_sequential_tests(target_apps, target_test_types)

        self.end_time = datetime.now()

        # 生成报告
        await self._generate_comprehensive_report(results)

        return results

    def _get_enabled_apps(self) -> List[str]:
        """获取启用的应用"""
        apps_config = self.config.get("apps", {})
        enabled_apps = []

        for app_name, app_data in apps_config.items():
            if app_data.get("enabled", True):
                enabled_apps.append(app_name)

        return enabled_apps

    async def _run_parallel_tests(
        self, apps: List[str], test_types: List[str]
    ) -> Dict[str, Any]:
        """并行运行测试"""
        print("🔄 开始并行测试执行")

        # 构建测试任务
        tasks = []
        for app in apps:
            for test_type in test_types:
                task = self._run_single_test(app, test_type)
                tasks.append(task)

        # 执行所有测试
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 处理结果
        test_results = {}
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"❌ 测试执行异常: {result}")
                continue

            app = apps[i // len(test_types)]
            test_type = test_types[i % len(test_types)]

            if app not in test_results:
                test_results[app] = {}
            test_results[app][test_type] = result

        return test_results

    async def _run_sequential_tests(
        self, apps: List[str], test_types: List[str]
    ) -> Dict[str, Any]:
        """顺序运行测试"""
        print("🔄 开始顺序测试执行")

        test_results = {}

        for app in apps:
            print(f"\n📱 测试应用: {app}")
            test_results[app] = {}

            for test_type in test_types:
                print(f"  🧪 测试类型: {test_type}")
                result = await self._run_single_test(app, test_type)
                test_results[app][test_type] = result

        return test_results

    async def _run_single_test(self, app: str, test_type: str) -> Dict[str, Any]:
        """运行单个测试"""
        app_config = self.config.get("apps", {}).get(app, {})
        if not app_config:
            return {"error": f"应用 {app} 配置不存在"}

        # 获取测试命令
        command_map = {
            "unit": "test_unit",
            "integration": "test_integration",
            "e2e": "test_e2e",
            "performance": "test_performance",
            "security": "test_security",
        }

        command_key = command_map.get(test_type)
        if not command_key:
            return {"error": f"未知的测试类型: {test_type}"}

        command = app_config.get("commands", {}).get(command_key)
        if not command:
            return {"error": f"未找到测试命令: {command_key}"}

        # 执行测试
        start_time = time.time()
        print(f"    ⏳ 执行命令: {command}")

        try:
            process = await asyncio.create_subprocess_shell(
                command,
                cwd=app_config.get("path", "."),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )

            stdout, stderr = await process.communicate()

            end_time = time.time()
            duration = end_time - start_time

            result = {
                "app": app,
                "test_type": test_type,
                "command": command,
                "return_code": process.returncode,
                "duration": duration,
                "stdout": stdout.decode("utf-8", errors="ignore"),
                "stderr": stderr.decode("utf-8", errors="ignore"),
                "success": process.returncode == 0,
                "start_time": start_time,
                "end_time": end_time,
            }

            if process.returncode == 0:
                print(f"    ✅ 测试通过 ({duration:.2f}s)")
            else:
                print(f"    ❌ 测试失败 ({duration:.2f}s)")

            return result

        except Exception as e:
            return {
                "app": app,
                "test_type": test_type,
                "command": command,
                "error": str(e),
                "success": False,
            }

    async def _generate_comprehensive_report(self, results: Dict[str, Any]):
        """生成综合报告"""
        print("\n📊 生成综合测试报告")
        print("=" * 60)

        # 计算统计信息
        total_tests = 0
        passed_tests = 0
        failed_tests = 0
        total_duration = 0

        for app, app_results in results.items():
            for test_type, result in app_results.items():
                total_tests += 1
                if result.get("success", False):
                    passed_tests += 1
                else:
                    failed_tests += 1
                total_duration += result.get("duration", 0)

        # 生成报告数据
        report_data = {
            "summary": {
                "total_tests": total_tests,
                "passed": passed_tests,
                "failed": failed_tests,
                "success_rate": (
                    (passed_tests / total_tests * 100) if total_tests > 0 else 0
                ),
                "total_duration": total_duration,
                "start_time": self.start_time.isoformat() if self.start_time else None,
                "end_time": self.end_time.isoformat() if self.end_time else None,
            },
            "results": results,
            "config": self.config,
            "generated_at": datetime.now().isoformat(),
        }

        # 保存报告
        report_path = "./testing/reports/comprehensive_report.json"
        os.makedirs(os.path.dirname(report_path), exist_ok=True)

        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False)

        # 输出摘要
        print("📈 测试摘要:")
        print(f"   总测试数: {total_tests}")
        print(f"   通过: {passed_tests}")
        print(f"   失败: {failed_tests}")
        print(f"   成功率: {report_data['summary']['success_rate']:.1f}%")
        print(f"   总耗时: {total_duration:.2f}s")
        print(f"   报告路径: {report_path}")

        # 输出详细结果
        print("\n📋 详细结果:")
        for app, app_results in results.items():
            print(f"  📱 {app}:")
            for test_type, result in app_results.items():
                status = "✅" if result.get("success", False) else "❌"
                duration = result.get("duration", 0)
                print(f"    {status} {test_type} ({duration:.2f}s)")

        print("=" * 60)

    def stop_all_tests(self):
        """停止所有测试"""
        print("🛑 停止所有测试进程")

        for process in self.running_processes:
            try:
                process.terminate()
            except Exception as e:
                print(f"停止进程异常: {e}")

        self.running_processes.clear()


class TestEnvironmentSetup:
    """测试环境设置"""

    def __init__(self, config: Dict[str, Any]):
        self.config = config

    async def setup_environment(self) -> bool:
        """设置测试环境"""
        print("🔧 设置测试环境")

        try:
            # 创建必要的目录
            await self._create_directories()

            # 设置环境变量
            await self._setup_environment_variables()

            # 检查依赖
            await self._check_dependencies()

            print("✅ 测试环境设置完成")
            return True

        except Exception as e:
            print(f"❌ 测试环境设置失败: {e}")
            return False

    async def _create_directories(self):
        """创建必要目录"""
        directories = [
            "./testing/reports",
            "./testing/logs",
            "./testing/temp",
            "./testing/data",
        ]

        for directory in directories:
            os.makedirs(directory, exist_ok=True)
            print(f"  📁 创建目录: {directory}")

    async def _setup_environment_variables(self):
        """设置环境变量"""
        env_vars = {"NODE_ENV": "test", "TEST_ENV": "true", "CI": "true"}

        for key, value in env_vars.items():
            os.environ[key] = value
            print(f"  🔧 设置环境变量: {key}={value}")

    async def _check_dependencies(self):
        """检查依赖"""
        # 检查 Node.js
        try:
            result = subprocess.run(
                ["node", "--version"], capture_output=True, text=True
            )
            if result.returncode == 0:
                print(f"  ✅ Node.js: {result.stdout.strip()}")
            else:
                print("  ❌ Node.js 未安装")
        except Exception:
            print("  ❌ Node.js 未安装")

        # 检查 pnpm
        try:
            result = subprocess.run(
                ["pnpm", "--version"], capture_output=True, text=True
            )
            if result.returncode == 0:
                print(f"  ✅ pnpm: {result.stdout.strip()}")
            else:
                print("  ❌ pnpm 未安装")
        except Exception:
            print("  ❌ pnpm 未安装")


async def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="AI-Code 企业级测试启动器")
    parser.add_argument("--config", default="config.yml", help="配置文件路径")
    parser.add_argument("--apps", nargs="+", help="要测试的应用")
    parser.add_argument(
        "--types",
        nargs="+",
        choices=["unit", "integration", "e2e", "performance", "security"],
        help="测试类型",
    )
    parser.add_argument("--sequential", action="store_true", help="顺序执行测试")
    parser.add_argument("--changed-only", action="store_true", help="只测试变更的应用")
    parser.add_argument("--setup-only", action="store_true", help="只设置环境")

    args = parser.parse_args()

    # 创建测试运行器
    runner = TestRunner(args.config)

    try:
        # 设置测试环境
        env_setup = TestEnvironmentSetup(runner.config)
        if not await env_setup.setup_environment():
            print("❌ 环境设置失败")
            sys.exit(1)

        if args.setup_only:
            print("✅ 环境设置完成")
            return

        # 运行测试
        results = await runner.run_full_test_suite(
            apps=args.apps,
            test_types=args.types,
            parallel=not args.sequential,
            changed_only=args.changed_only,
        )

        # 检查结果
        total_tests = sum(len(app_results) for app_results in results.values())
        passed_tests = sum(
            sum(1 for result in app_results.values() if result.get("success", False))
            for app_results in results.values()
        )

        if passed_tests == total_tests:
            print("🎉 所有测试通过！")
            sys.exit(0)
        else:
            print(f"❌ {total_tests - passed_tests} 个测试失败")
            sys.exit(1)

    except KeyboardInterrupt:
        print("\n🛑 测试被用户中断")
        runner.stop_all_tests()
        sys.exit(130)
    except Exception as e:
        print(f"❌ 测试执行失败: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
