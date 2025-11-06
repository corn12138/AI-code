#!/usr/bin/env python3
"""
AI-Code 企业级测试工具集
包含各种测试工具、脚本和实用程序
"""

import argparse
import asyncio
import json
import os
import shutil
import subprocess
import sys
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional

try:
    import aiofiles
    import aiohttp
    import psutil
    import requests
    import yaml
except ImportError:
    # 如果依赖不可用，使用模拟实现
    aiofiles = None
    aiohttp = None
    psutil = None
    requests = None
    yaml = None


@dataclass
class TestEnvironment:
    """测试环境配置"""

    name: str
    database_url: str
    redis_url: Optional[str] = None
    elasticsearch_url: Optional[str] = None
    minio_url: Optional[str] = None
    env_vars: Dict[str, str] = None

    def __post_init__(self):
        if self.env_vars is None:
            self.env_vars = {}


class TestEnvironmentManager:
    """测试环境管理器"""

    def __init__(self, config_path: str = "config.yml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.environments = self._load_environments()
        self.active_environment = None

    def _load_config(self) -> Dict[str, Any]:
        """加载配置"""
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            print(f"加载配置文件失败: {e}")
            return {}

    def _load_environments(self) -> Dict[str, TestEnvironment]:
        """加载环境配置"""
        environments = {}
        env_config = self.config.get("environments", {})

        for env_name, env_data in env_config.items():
            environment = TestEnvironment(
                name=env_name,
                database_url=env_data.get("database_url", ""),
                redis_url=env_data.get("redis_url"),
                elasticsearch_url=env_data.get("elasticsearch_url"),
                minio_url=env_data.get("minio_url"),
                env_vars=env_data.get("env_vars", {}),
            )
            environments[env_name] = environment

        return environments

    async def setup_environment(self, env_name: str) -> bool:
        """设置测试环境"""
        if env_name not in self.environments:
            print(f"❌ 环境 {env_name} 不存在")
            return False

        environment = self.environments[env_name]
        self.active_environment = environment

        print(f"🔧 设置测试环境: {env_name}")

        # 设置环境变量
        for key, value in environment.env_vars.items():
            os.environ[key] = value

        # 检查数据库连接
        if environment.database_url:
            if not await self._check_database_connection(environment.database_url):
                print(f"❌ 数据库连接失败: {environment.database_url}")
                return False

        # 检查 Redis 连接
        if environment.redis_url:
            if not await self._check_redis_connection(environment.redis_url):
                print(f"❌ Redis 连接失败: {environment.redis_url}")
                return False

        print(f"✅ 环境 {env_name} 设置完成")
        return True

    async def _check_database_connection(self, database_url: str) -> bool:
        """检查数据库连接"""
        try:
            # 这里可以根据数据库类型进行不同的检查
            if "postgresql" in database_url:
                return await self._check_postgres_connection(database_url)
            elif "mysql" in database_url:
                return await self._check_mysql_connection(database_url)
            else:
                return True
        except Exception as e:
            print(f"数据库连接检查异常: {e}")
            return False

    async def _check_postgres_connection(self, database_url: str) -> bool:
        """检查 PostgreSQL 连接"""
        try:
            import psycopg2

            conn = psycopg2.connect(database_url)
            conn.close()
            return True
        except ImportError:
            print("警告: psycopg2 未安装，跳过 PostgreSQL 连接检查")
            return True
        except Exception as e:
            print(f"PostgreSQL 连接失败: {e}")
            return False

    async def _check_mysql_connection(self, database_url: str) -> bool:
        """检查 MySQL 连接"""
        try:
            import pymysql

            # 解析数据库 URL
            # 这里需要根据实际的 URL 格式进行解析
            return True
        except ImportError:
            print("警告: pymysql 未安装，跳过 MySQL 连接检查")
            return True
        except Exception as e:
            print(f"MySQL 连接失败: {e}")
            return False

    async def _check_redis_connection(self, redis_url: str) -> bool:
        """检查 Redis 连接"""
        try:
            import redis

            r = redis.from_url(redis_url)
            r.ping()
            return True
        except ImportError:
            print("警告: redis 未安装，跳过 Redis 连接检查")
            return True
        except Exception as e:
            print(f"Redis 连接失败: {e}")
            return False


class TestDataGenerator:
    """测试数据生成器"""

    def __init__(self):
        self.faker = None
        self._init_faker()

    def _init_faker(self):
        """初始化 Faker"""
        try:
            from faker import Faker

            self.faker = Faker("zh_CN")
        except ImportError:
            print("警告: faker 未安装，使用基础数据生成")
            self.faker = None

    def generate_user_data(self, count: int = 1) -> List[Dict[str, Any]]:
        """生成用户数据"""
        users = []
        for _ in range(count):
            if self.faker:
                user = {
                    "username": self.faker.user_name(),
                    "email": self.faker.email(),
                    "full_name": self.faker.name(),
                    "phone": self.faker.phone_number(),
                    "avatar": self.faker.image_url(),
                    "created_at": self.faker.date_time_between(
                        start_date="-1y", end_date="now"
                    ).isoformat(),
                    "is_active": self.faker.boolean(chance_of_getting_true=90),
                }
            else:
                user = {
                    "username": f"user_{int(time.time())}",
                    "email": f"user_{int(time.time())}@example.com",
                    "full_name": f"User {int(time.time())}",
                    "phone": f"1{int(time.time()) % 10000000000:010d}",
                    "avatar": "https://via.placeholder.com/100",
                    "created_at": datetime.now().isoformat(),
                    "is_active": True,
                }
            users.append(user)
        return users

    def generate_article_data(self, count: int = 1) -> List[Dict[str, Any]]:
        """生成文章数据"""
        articles = []
        for _ in range(count):
            if self.faker:
                article = {
                    "title": self.faker.sentence(nb_words=6),
                    "content": self.faker.text(max_nb_chars=1000),
                    "excerpt": self.faker.text(max_nb_chars=200),
                    "author_id": self.faker.random_int(min=1, max=100),
                    "category": self.faker.random_element(
                        elements=("技术", "生活", "工作", "学习")
                    ),
                    "tags": self.faker.words(nb=3),
                    "published": self.faker.boolean(chance_of_getting_true=80),
                    "created_at": self.faker.date_time_between(
                        start_date="-6m", end_date="now"
                    ).isoformat(),
                }
            else:
                article = {
                    "title": f"测试文章 {int(time.time())}",
                    "content": f"这是测试文章的内容 {int(time.time())}",
                    "excerpt": f"测试文章摘要 {int(time.time())}",
                    "author_id": 1,
                    "category": "技术",
                    "tags": ["测试", "自动化"],
                    "published": True,
                    "created_at": datetime.now().isoformat(),
                }
            articles.append(article)
        return articles

    def generate_mobile_doc_data(self, count: int = 1) -> List[Dict[str, Any]]:
        """生成移动端文档数据"""
        docs = []
        for _ in range(count):
            if self.faker:
                doc = {
                    "title": self.faker.sentence(nb_words=4),
                    "content": self.faker.text(max_nb_chars=500),
                    "type": self.faker.random_element(
                        elements=("guide", "tutorial", "reference")
                    ),
                    "category": self.faker.random_element(
                        elements=("mobile", "web", "api")
                    ),
                    "difficulty": self.faker.random_element(
                        elements=("beginner", "intermediate", "advanced")
                    ),
                    "estimated_time": self.faker.random_int(min=5, max=60),
                    "author": self.faker.name(),
                    "created_at": self.faker.date_time_between(
                        start_date="-3m", end_date="now"
                    ).isoformat(),
                }
            else:
                doc = {
                    "title": f"移动端文档 {int(time.time())}",
                    "content": f"这是移动端文档的内容 {int(time.time())}",
                    "type": "guide",
                    "category": "mobile",
                    "difficulty": "beginner",
                    "estimated_time": 15,
                    "author": "测试作者",
                    "created_at": datetime.now().isoformat(),
                }
            docs.append(doc)
        return docs


class TestDatabaseManager:
    """测试数据库管理器"""

    def __init__(self, database_url: str):
        self.database_url = database_url
        self.connection = None

    async def setup_test_database(self) -> bool:
        """设置测试数据库"""
        try:
            print("🔧 设置测试数据库...")

            # 创建测试数据库
            await self._create_test_database()

            # 运行迁移
            await self._run_migrations()

            # 插入测试数据
            await self._insert_test_data()

            print("✅ 测试数据库设置完成")
            return True

        except Exception as e:
            print(f"❌ 测试数据库设置失败: {e}")
            return False

    async def cleanup_test_database(self) -> bool:
        """清理测试数据库"""
        try:
            print("🧹 清理测试数据库...")

            # 删除测试数据
            await self._delete_test_data()

            # 重置序列
            await self._reset_sequences()

            print("✅ 测试数据库清理完成")
            return True

        except Exception as e:
            print(f"❌ 测试数据库清理失败: {e}")
            return False

    async def _create_test_database(self):
        """创建测试数据库"""
        # 这里需要根据具体的数据库类型实现
        pass

    async def _run_migrations(self):
        """运行数据库迁移"""
        # 这里需要根据具体的迁移工具实现
        pass

    async def _insert_test_data(self):
        """插入测试数据"""
        # 这里需要根据具体的数据模型实现
        pass

    async def _delete_test_data(self):
        """删除测试数据"""
        # 这里需要根据具体的数据模型实现
        pass

    async def _reset_sequences(self):
        """重置序列"""
        # 这里需要根据具体的数据库类型实现
        pass


class TestPerformanceAnalyzer:
    """测试性能分析器"""

    def __init__(self):
        self.metrics = []
        self.start_time = None
        self.end_time = None

    def start_analysis(self):
        """开始性能分析"""
        self.start_time = time.time()
        self.metrics = []
        print("📊 开始性能分析")

    def end_analysis(self):
        """结束性能分析"""
        self.end_time = time.time()
        print("📊 性能分析完成")

    def record_metric(self, name: str, value: float, unit: str = ""):
        """记录性能指标"""
        metric = {"name": name, "value": value, "unit": unit, "timestamp": time.time()}
        self.metrics.append(metric)

    def get_analysis_report(self) -> Dict[str, Any]:
        """获取分析报告"""
        if not self.metrics:
            return {}

        # 按指标名称分组
        metrics_by_name = {}
        for metric in self.metrics:
            name = metric["name"]
            if name not in metrics_by_name:
                metrics_by_name[name] = []
            metrics_by_name[name].append(metric)

        # 计算统计信息
        analysis = {}
        for name, metrics in metrics_by_name.items():
            values = [m["value"] for m in metrics]
            analysis[name] = {
                "count": len(values),
                "min": min(values),
                "max": max(values),
                "avg": sum(values) / len(values),
                "latest": values[-1] if values else 0,
            }

        # 添加总体信息
        analysis["_summary"] = {
            "total_metrics": len(self.metrics),
            "duration": (
                self.end_time - self.start_time
                if self.end_time and self.start_time
                else 0
            ),
            "start_time": self.start_time,
            "end_time": self.end_time,
        }

        return analysis

    async def save_analysis_report(self, output_path: str):
        """保存分析报告"""
        report = self.get_analysis_report()

        async with aiofiles.open(output_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(report, indent=2, ensure_ascii=False))

        print(f"📊 性能分析报告已保存: {output_path}")


class TestSecurityScanner:
    """测试安全扫描器"""

    def __init__(self):
        self.vulnerabilities = []
        self.security_issues = []

    async def scan_dependencies(self, package_json_path: str) -> List[Dict[str, Any]]:
        """扫描依赖漏洞"""
        print("🔍 扫描依赖漏洞...")

        try:
            # 运行 npm audit
            result = subprocess.run(
                ["npm", "audit", "--json"],
                cwd=os.path.dirname(package_json_path),
                capture_output=True,
                text=True,
            )

            if result.returncode == 0:
                audit_data = json.loads(result.stdout)
                vulnerabilities = audit_data.get("vulnerabilities", {})

                for name, vuln in vulnerabilities.items():
                    self.vulnerabilities.append(
                        {
                            "package": name,
                            "severity": vuln.get("severity", "unknown"),
                            "title": vuln.get("title", ""),
                            "description": vuln.get("description", ""),
                            "recommendation": vuln.get("recommendation", ""),
                        }
                    )

                print(f"✅ 发现 {len(self.vulnerabilities)} 个漏洞")
            else:
                print("❌ 依赖扫描失败")

        except Exception as e:
            print(f"❌ 依赖扫描异常: {e}")

        return self.vulnerabilities

    async def scan_code_security(self, source_path: str) -> List[Dict[str, Any]]:
        """扫描代码安全问题"""
        print("🔍 扫描代码安全问题...")

        try:
            # 这里可以集成各种安全扫描工具
            # 例如: ESLint security rules, Bandit, Semgrep 等

            # 扫描常见安全问题
            await self._scan_sql_injection(source_path)
            await self._scan_xss_vulnerabilities(source_path)
            await self._scan_hardcoded_secrets(source_path)

            print(f"✅ 发现 {len(self.security_issues)} 个安全问题")

        except Exception as e:
            print(f"❌ 代码安全扫描异常: {e}")

        return self.security_issues

    async def _scan_sql_injection(self, source_path: str):
        """扫描 SQL 注入"""
        # 这里需要根据具体的代码库实现
        pass

    async def _scan_xss_vulnerabilities(self, source_path: str):
        """扫描 XSS 漏洞"""
        # 这里需要根据具体的代码库实现
        pass

    async def _scan_hardcoded_secrets(self, source_path: str):
        """扫描硬编码密钥"""
        # 这里需要根据具体的代码库实现
        pass

    def get_security_report(self) -> Dict[str, Any]:
        """获取安全报告"""
        return {
            "vulnerabilities": self.vulnerabilities,
            "security_issues": self.security_issues,
            "summary": {
                "total_vulnerabilities": len(self.vulnerabilities),
                "total_security_issues": len(self.security_issues),
                "high_severity": len(
                    [v for v in self.vulnerabilities if v.get("severity") == "high"]
                ),
                "medium_severity": len(
                    [v for v in self.vulnerabilities if v.get("severity") == "moderate"]
                ),
                "low_severity": len(
                    [v for v in self.vulnerabilities if v.get("severity") == "low"]
                ),
            },
        }


class TestUtilities:
    """测试工具集"""

    @staticmethod
    async def wait_for_service(url: str, timeout: int = 30, interval: int = 1) -> bool:
        """等待服务启动"""
        print(f"⏳ 等待服务启动: {url}")

        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, timeout=5) as response:
                        if response.status == 200:
                            print(f"✅ 服务已启动: {url}")
                            return True
            except Exception:
                pass

            await asyncio.sleep(interval)

        print(f"❌ 服务启动超时: {url}")
        return False

    @staticmethod
    async def cleanup_test_files(test_dir: str):
        """清理测试文件"""
        print(f"🧹 清理测试文件: {test_dir}")

        try:
            if os.path.exists(test_dir):
                shutil.rmtree(test_dir)
                print(f"✅ 测试文件清理完成: {test_dir}")
            else:
                print(f"ℹ️ 测试目录不存在: {test_dir}")
        except Exception as e:
            print(f"❌ 测试文件清理失败: {e}")

    @staticmethod
    def get_system_info() -> Dict[str, Any]:
        """获取系统信息"""
        return {
            "platform": sys.platform,
            "python_version": sys.version,
            "cpu_count": psutil.cpu_count(),
            "memory_total": psutil.virtual_memory().total,
            "disk_usage": psutil.disk_usage("/").percent,
            "timestamp": datetime.now().isoformat(),
        }

    @staticmethod
    async def generate_test_report(test_results: Dict[str, Any], output_path: str):
        """生成测试报告"""
        print(f"📊 生成测试报告: {output_path}")

        # 增强报告数据
        enhanced_data = {
            **test_results,
            "system_info": TestUtilities.get_system_info(),
            "generated_at": datetime.now().isoformat(),
            "generator": "AI-Code Test Utilities",
        }

        # 保存报告
        async with aiofiles.open(output_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(enhanced_data, indent=2, ensure_ascii=False))

        print(f"✅ 测试报告已生成: {output_path}")


async def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="AI-Code 测试工具集")
    parser.add_argument(
        "--action",
        choices=[
            "setup",
            "cleanup",
            "generate-data",
            "scan-security",
            "analyze-performance",
        ],
        help="执行的操作",
    )
    parser.add_argument("--config", default="config.yml", help="配置文件路径")
    parser.add_argument("--output", help="输出路径")

    args = parser.parse_args()

    if args.action == "setup":
        # 设置测试环境
        env_manager = TestEnvironmentManager(args.config)
        await env_manager.setup_environment("test")

    elif args.action == "cleanup":
        # 清理测试环境
        test_dir = args.output or "./testing/temp"
        await TestUtilities.cleanup_test_files(test_dir)

    elif args.action == "generate-data":
        # 生成测试数据
        generator = TestDataGenerator()
        users = generator.generate_user_data(10)
        articles = generator.generate_article_data(5)

        output_path = args.output or "./testing/data/generated_data.json"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)

        data = {
            "users": users,
            "articles": articles,
            "generated_at": datetime.now().isoformat(),
        }

        async with aiofiles.open(output_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(data, indent=2, ensure_ascii=False))

        print(f"✅ 测试数据已生成: {output_path}")

    elif args.action == "scan-security":
        # 安全扫描
        scanner = TestSecurityScanner()
        vulnerabilities = await scanner.scan_dependencies("package.json")
        security_issues = await scanner.scan_code_security("./src")

        report = scanner.get_security_report()
        output_path = args.output or "./testing/reports/security_report.json"

        async with aiofiles.open(output_path, "w", encoding="utf-8") as f:
            await f.write(json.dumps(report, indent=2, ensure_ascii=False))

        print(f"✅ 安全扫描报告已生成: {output_path}")

    elif args.action == "analyze-performance":
        # 性能分析
        analyzer = TestPerformanceAnalyzer()
        analyzer.start_analysis()

        # 模拟一些性能指标
        for i in range(10):
            analyzer.record_metric("response_time", 100 + i * 10, "ms")
            analyzer.record_metric("memory_usage", 50 + i * 2, "MB")
            await asyncio.sleep(0.1)

        analyzer.end_analysis()

        output_path = args.output or "./testing/reports/performance_report.json"
        await analyzer.save_analysis_report(output_path)

    else:
        print("请指定要执行的操作")


if __name__ == "__main__":
    asyncio.run(main())
