"""
企业级测试配置管理
支持多环境配置、动态配置加载和 YAML 配置文件
"""

import os
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import yaml


class TestSuite(Enum):
    """测试套件类型"""

    UNIT = "unit"
    INTEGRATION = "integration"
    E2E = "e2e"
    CONTRACT = "contract"
    PERFORMANCE = "performance"
    SECURITY = "security"
    ALL = "all"


class TestStatus(Enum):
    """测试状态"""

    PENDING = "pending"
    RUNNING = "running"
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    ERROR = "error"
    QUARANTINED = "quarantined"  # 新增：隔离状态


@dataclass
class HealthCheckConfig:
    """健康检查配置"""

    url: str
    timeout: int = 30
    retries: int = 3
    expected_status: int = 200


@dataclass
class DatabaseConfig:
    """数据库配置"""

    required: bool = False
    host: str = "localhost"
    port: int = 5432
    database: str = "test_db"
    username: str = "test_user"
    password: str = "test_password"
    ssl: bool = False
    pool_size: int = 10
    setup_command: Optional[str] = None
    seed_command: Optional[str] = None
    reset_command: Optional[str] = None
    check_command: Optional[str] = None


@dataclass
class CoverageConfig:
    """覆盖率配置"""

    unit: int = 80
    integration: int = 70
    overall: int = 75


@dataclass
class AppConfig:
    """应用配置"""

    name: str
    type: str
    path: str
    port: Optional[int] = None
    dependencies: List[str] = field(default_factory=list)
    priority: int = 5  # 执行优先级，数字越小优先级越高
    enabled: bool = True

    # 命令配置
    commands: Dict[str, str] = field(default_factory=dict)

    # 环境配置
    env_file: Optional[str] = None
    test_timeout: int = 300
    startup_wait: int = 10
    health_check: Optional[Union[str, HealthCheckConfig]] = None

    # 数据库配置
    database: Optional[DatabaseConfig] = None

    # 覆盖率配置
    coverage: Optional[CoverageConfig] = None

    def get_command(self, command_type: str) -> str:
        """获取命令，支持回退策略"""
        if command_type in self.commands:
            return self.commands[command_type]

        # 回退策略
        fallback_commands = {
            "test_unit": ["npm test", "npm run test:unit", "jest", "vitest run"],
            "test_integration": ["npm run test:integration", "npm run test:e2e"],
            "test_e2e": ["npm run test:e2e", "npx playwright test"],
            "lint": ["npm run lint", "eslint ."],
            "build": ["npm run build", "pnpm build"],
            "dev": ["npm run dev", "pnpm dev"],
        }

        if command_type in fallback_commands:
            return fallback_commands[command_type][0]

        return f"echo 'Command {command_type} not configured'"


@dataclass
class SharedLibraryConfig:
    """共享库配置"""

    name: str
    path: str
    test_command: str = "npm test"
    build_command: str = "npm run build"
    coverage_threshold: int = 80


@dataclass
class TestSuiteConfig:
    """测试套件配置"""

    name: str
    description: str
    timeout: int = 600
    parallel: bool = True
    coverage_required: bool = False
    coverage_threshold: int = 80
    priority: int = 5
    requires_database: bool = False
    requires_services: List[str] = field(default_factory=list)
    browsers: List[str] = field(default_factory=list)
    targets: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class ExecutionConfig:
    """执行配置"""

    parallel_workers: int = 4
    test_timeout: int = 3600
    task_timeout: int = 900
    retry_failed: int = 2
    fail_fast: bool = False
    max_concurrent_apps: int = 3
    resource_threshold: Dict[str, int] = field(
        default_factory=lambda: {"cpu_percent": 80, "memory_percent": 85}
    )
    smart_testing: Dict[str, bool] = field(
        default_factory=lambda: {
            "enabled": True,
            "changed_only": False,
            "dependency_analysis": True,
        }
    )
    flaky_management: Dict[str, Any] = field(
        default_factory=lambda: {
            "enabled": True,
            "max_retries": 3,
            "quarantine_after": 3,
            "skip_quarantined": False,
        }
    )


@dataclass
class NotificationConfig:
    """通知配置"""

    enabled: bool = False
    dingtalk: Dict[str, Any] = field(default_factory=dict)
    wechat: Dict[str, Any] = field(default_factory=dict)
    email: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ReportingConfig:
    """报告配置"""

    enabled: bool = True
    formats: List[str] = field(default_factory=lambda: ["html", "json"])
    output_directory: str = "./testing/reports"
    coverage_threshold: float = 75.0
    html: Dict[str, Any] = field(default_factory=dict)
    json: Dict[str, Any] = field(default_factory=dict)
    junit: Dict[str, Any] = field(default_factory=dict)
    allure: Dict[str, Any] = field(default_factory=dict)
    integrations: Dict[str, Any] = field(default_factory=dict)


@dataclass
class TestConfig:
    """测试配置主类"""

    # 项目信息
    project: Dict[str, str] = field(
        default_factory=lambda: {
            "name": "AI-Code Monorepo",
            "root": ".",
            "version": "2.0.0",
        }
    )

    # 执行配置
    execution: ExecutionConfig = field(default_factory=ExecutionConfig)

    # 应用配置
    apps: Dict[str, AppConfig] = field(default_factory=dict)

    # 共享库配置
    shared_libraries: Dict[str, SharedLibraryConfig] = field(default_factory=dict)

    # 数据库配置
    database: Dict[str, DatabaseConfig] = field(default_factory=dict)

    # 测试套件配置
    test_suites: Dict[str, TestSuiteConfig] = field(default_factory=dict)

    # 环境配置
    environments: Dict[str, Dict[str, Any]] = field(default_factory=dict)

    # 报告配置
    reporting: ReportingConfig = field(default_factory=ReportingConfig)

    # 通知配置
    notification: NotificationConfig = field(default_factory=NotificationConfig)

    # CI/CD 配置
    ci_cd: Dict[str, Any] = field(default_factory=dict)

    # 高级功能配置
    advanced: Dict[str, Any] = field(default_factory=dict)

    # 兼容性属性
    @property
    def project_name(self) -> str:
        return self.project.get("name", "AI-Code Monorepo")

    @property
    def project_root(self) -> str:
        return self.project.get("root", ".")

    @property
    def parallel_workers(self) -> int:
        return self.execution.parallel_workers

    @property
    def test_timeout(self) -> int:
        return self.execution.test_timeout

    @property
    def retry_failed(self) -> int:
        return self.execution.retry_failed

    @property
    def fail_fast(self) -> bool:
        return self.execution.fail_fast

    @property
    def changed_only(self) -> bool:
        return self.execution.smart_testing.get("changed_only", False)

    @property
    def ci_mode(self) -> bool:
        return os.getenv("CI", "false").lower() == "true"

    @property
    def reports_dir(self) -> str:
        return self.reporting.output_directory

    @property
    def coverage_threshold(self) -> float:
        return self.reporting.coverage_threshold


class ConfigManager:
    """配置管理器"""

    def __init__(self, config_path: Optional[str] = None):
        self.config_path = config_path or self._find_config_file()
        self.config = self._load_config()

    def _find_config_file(self) -> str:
        """查找配置文件"""
        base_dir = Path(__file__).resolve().parent
        project_root = base_dir.parent.parent
        possible_paths = [
            project_root / "testing/config.yml",
            project_root / "config.yml",
            project_root / "ai-code-testing.yml",
            Path("./testing/config.yml"),
            Path("./config.yml"),
            Path("./ai-code-testing.yml"),
            Path(os.path.expanduser("~/.ai-code-testing.yml")),
        ]

        for path in possible_paths:
            try:
                if path and path.exists():
                    return str(path)
            except OSError:
                continue

        # 如果没有找到，返回默认路径
        return str(project_root / "testing/config.yml")

    def _load_config(self) -> TestConfig:
        """加载配置文件"""
        if not os.path.exists(self.config_path):
            return self._create_default_config()

        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = yaml.safe_load(f)

            return self._parse_config(data)
        except Exception as e:
            print(f"警告: 配置文件加载失败 ({e})，使用默认配置")
            return self._create_default_config()

    def _parse_config(self, data: Dict[str, Any]) -> TestConfig:
        """解析配置数据"""
        config = TestConfig()

        # 解析项目信息
        if "project" in data:
            config.project = data["project"]

        # 解析执行配置
        if "execution" in data:
            exec_data = data["execution"]
            config.execution = ExecutionConfig(
                parallel_workers=exec_data.get("parallel_workers", 4),
                test_timeout=exec_data.get("test_timeout", 3600),
                task_timeout=exec_data.get("task_timeout", 900),
                retry_failed=exec_data.get("retry_failed", 2),
                fail_fast=exec_data.get("fail_fast", False),
                max_concurrent_apps=exec_data.get("max_concurrent_apps", 3),
                resource_threshold=exec_data.get("resource_threshold", {}),
                smart_testing=exec_data.get("smart_testing", {}),
                flaky_management=exec_data.get("flaky_management", {}),
            )

        # 解析应用配置
        if "apps" in data:
            config.apps = {}
            for app_name, app_data in data["apps"].items():
                if app_data.get("enabled", True):
                    config.apps[app_name] = self._parse_app_config(app_name, app_data)

        # 解析其他配置...
        config.test_suites = self._parse_test_suites(data.get("test_suites", {}))
        config.reporting = self._parse_reporting_config(data.get("reporting", {}))
        config.notification = self._parse_notification_config(
            data.get("notification", {})
        )

        return config

    def _parse_app_config(self, name: str, data: Dict[str, Any]) -> AppConfig:
        """解析应用配置"""
        app_config = AppConfig(
            name=data.get("name", name),
            type=data.get("type", "unknown"),
            path=data.get("path", f"./apps/{name}"),
            port=data.get("port"),
            dependencies=data.get("dependencies", []),
            priority=data.get("priority", 5),
            enabled=data.get("enabled", True),
            commands=data.get("commands", {}),
            env_file=data.get("env_file"),
            test_timeout=data.get("test_timeout", 300),
            startup_wait=data.get("startup_wait", 10),
        )

        # 解析健康检查配置
        if "health_check" in data:
            hc_data = data["health_check"]
            if isinstance(hc_data, str):
                app_config.health_check = HealthCheckConfig(url=hc_data)
            else:
                app_config.health_check = HealthCheckConfig(**hc_data)

        # 解析数据库配置
        if "database" in data:
            app_config.database = DatabaseConfig(**data["database"])

        # 解析覆盖率配置
        if "coverage" in data:
            app_config.coverage = CoverageConfig(**data["coverage"])

        return app_config

    def _parse_test_suites(self, data: Dict[str, Any]) -> Dict[str, TestSuiteConfig]:
        """解析测试套件配置"""
        suites = {}
        for suite_name, suite_data in data.items():
            suites[suite_name] = TestSuiteConfig(**suite_data)
        return suites

    def _parse_reporting_config(self, data: Dict[str, Any]) -> ReportingConfig:
        """解析报告配置"""
        return ReportingConfig(**data)

    def _parse_notification_config(self, data: Dict[str, Any]) -> NotificationConfig:
        """解析通知配置"""
        return NotificationConfig(**data)

    def _create_default_config(self) -> TestConfig:
        """创建默认配置"""
        return TestConfig(
            project={
                "name": "AI-Code Monorepo",
                "root": "/Users/huangyuming/Desktop/createProjects/AI-code",
                "version": "2.0.0",
            },
            execution=ExecutionConfig(
                parallel_workers=6, test_timeout=3600, retry_failed=3
            ),
            apps={
                "blog": AppConfig(
                    name="blog",
                    type="nextjs",
                    path="./apps/blog",
                    port=3000,
                    dependencies=["server"],
                    commands={
                        "test_unit": "jest --testPathPattern=src --coverage --passWithNoTests",
                        "test_integration": "jest --testPathPattern=integration --passWithNoTests",
                        "test_e2e": "playwright test",
                    },
                    env_file="./apps/blog/.env.test",
                    test_timeout=600,
                    health_check=HealthCheckConfig(
                        url="http://localhost:3000/api/health"
                    ),
                ),
                "server": AppConfig(
                    name="server",
                    type="nestjs",
                    path="./apps/server",
                    port=3001,
                    commands={
                        "test_unit": "jest --config jest-unit.config.js --passWithNoTests",
                        "test_integration": "jest --config jest-integration.config.js --passWithNoTests",
                    },
                    env_file="./apps/server/.env.test",
                    test_timeout=900,
                    health_check=HealthCheckConfig(url="http://localhost:3001/health"),
                ),
            },
        )

    def get_config(self) -> TestConfig:
        """获取配置实例"""
        return self.config

    def reload_config(self) -> TestConfig:
        """重新加载配置"""
        self.config = self._load_config()
        return self.config


# 全局配置实例
_config_manager = ConfigManager()
config = _config_manager.get_config()


def get_config(config_path: Optional[str] = None) -> TestConfig:
    """获取配置实例"""
    if config_path:
        return ConfigManager(config_path).get_config()
    return config
