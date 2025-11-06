#!/usr/bin/env python3
"""
AI-Code 实时测试监控系统
提供实时监控、告警和性能分析
"""

import asyncio
import json
from dataclasses import asdict, dataclass
from datetime import datetime
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

try:
    import psutil
    import yaml
except ImportError:
    psutil = None
    yaml = None

from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel

console = Console()


class AlertLevel(Enum):
    """告警级别"""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


@dataclass
class Alert:
    """告警信息"""

    level: AlertLevel
    message: str
    timestamp: datetime
    source: str
    details: Optional[Dict[str, Any]] = None


@dataclass
class SystemMetrics:
    """系统指标"""

    timestamp: datetime
    cpu_percent: float
    memory_percent: float
    memory_available_mb: float
    disk_percent: float
    network_sent_mb: float
    network_recv_mb: float
    load_average: List[float]


@dataclass
class TestMetrics:
    """测试指标"""

    timestamp: datetime
    total_tests: int
    running_tests: int
    passed_tests: int
    failed_tests: int
    success_rate: float
    average_duration: float
    total_duration: float


class RealtimeMonitor:
    """实时监控系统"""

    def __init__(self, config_path: str = "config.yml"):
        self.config_path = config_path
        self.config = self._load_config()
        self.monitoring = False
        self.metrics_history: List[SystemMetrics] = []
        self.test_metrics_history: List[TestMetrics] = []
        self.alerts: List[Alert] = []
        self.alert_callbacks: List[Callable[[Alert], None]] = []
        self.start_time = None
        self.network_io_start = None

    def _load_config(self) -> Dict[str, Any]:
        """加载配置文件"""
        try:
            with open(self.config_path, "r", encoding="utf-8") as f:
                return yaml.safe_load(f)
        except Exception as e:
            console.print(f"[red]❌ 加载配置文件失败: {e}[/red]")
            return {}

    def _get_monitoring_config(self) -> Dict[str, Any]:
        """获取监控配置"""
        return self.config.get(
            "monitoring",
            {
                "enabled": True,
                "interval": 5.0,
                "alerts": {
                    "cpu_threshold": 80.0,
                    "memory_threshold": 85.0,
                    "disk_threshold": 90.0,
                    "test_failure_threshold": 0.2,
                },
            },
        )

    def _collect_system_metrics(self) -> SystemMetrics:
        """收集系统指标"""
        timestamp = datetime.now()

        # CPU 使用率
        cpu_percent = psutil.cpu_percent(interval=1)

        # 内存使用情况
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        memory_available_mb = memory.available / 1024 / 1024

        # 磁盘使用情况
        disk = psutil.disk_usage("/")
        disk_percent = disk.percent

        # 网络 I/O
        network_io = psutil.net_io_counters()
        network_sent_mb = network_io.bytes_sent / 1024 / 1024
        network_recv_mb = network_io.bytes_recv / 1024 / 1024

        # 系统负载
        load_average = (
            list(psutil.getloadavg())
            if hasattr(psutil, "getloadavg")
            else [0.0, 0.0, 0.0]
        )

        return SystemMetrics(
            timestamp=timestamp,
            cpu_percent=cpu_percent,
            memory_percent=memory_percent,
            memory_available_mb=memory_available_mb,
            disk_percent=disk_percent,
            network_sent_mb=network_sent_mb,
            network_recv_mb=network_recv_mb,
            load_average=load_average,
        )

    def _collect_test_metrics(self, test_results: Dict[str, Any]) -> TestMetrics:
        """收集测试指标"""
        timestamp = datetime.now()

        total_tests = 0
        running_tests = 0
        passed_tests = 0
        failed_tests = 0
        total_duration = 0.0

        for app_name, app_result in test_results.items():
            tests = app_result.get("tests", {})
            for test_type, test_result in tests.items():
                total_tests += 1

                status = test_result.get("status", "unknown")
                if status == "running":
                    running_tests += 1
                elif status == "passed":
                    passed_tests += 1
                elif status in ["failed", "timeout", "error"]:
                    failed_tests += 1

                duration = test_result.get("duration", 0)
                total_duration += duration

        success_rate = (passed_tests / total_tests) if total_tests > 0 else 0.0
        average_duration = (total_duration / total_tests) if total_tests > 0 else 0.0

        return TestMetrics(
            timestamp=timestamp,
            total_tests=total_tests,
            running_tests=running_tests,
            passed_tests=passed_tests,
            failed_tests=failed_tests,
            success_rate=success_rate,
            average_duration=average_duration,
            total_duration=total_duration,
        )

    def _check_alerts(
        self, system_metrics: SystemMetrics, test_metrics: TestMetrics
    ) -> List[Alert]:
        """检查告警条件"""
        alerts = []
        config = self._get_monitoring_config()
        alert_config = config.get("alerts", {})

        # CPU 告警
        if system_metrics.cpu_percent > alert_config.get("cpu_threshold", 80.0):
            alerts.append(
                Alert(
                    level=(
                        AlertLevel.WARNING
                        if system_metrics.cpu_percent < 90
                        else AlertLevel.CRITICAL
                    ),
                    message=f"CPU 使用率过高: {system_metrics.cpu_percent:.1f}%",
                    timestamp=datetime.now(),
                    source="system",
                    details={"cpu_percent": system_metrics.cpu_percent},
                )
            )

        # 内存告警
        if system_metrics.memory_percent > alert_config.get("memory_threshold", 85.0):
            alerts.append(
                Alert(
                    level=(
                        AlertLevel.WARNING
                        if system_metrics.memory_percent < 95
                        else AlertLevel.CRITICAL
                    ),
                    message=f"内存使用率过高: {system_metrics.memory_percent:.1f}%",
                    timestamp=datetime.now(),
                    source="system",
                    details={"memory_percent": system_metrics.memory_percent},
                )
            )

        # 磁盘告警
        if system_metrics.disk_percent > alert_config.get("disk_threshold", 90.0):
            alerts.append(
                Alert(
                    level=AlertLevel.CRITICAL,
                    message=f"磁盘使用率过高: {system_metrics.disk_percent:.1f}%",
                    timestamp=datetime.now(),
                    source="system",
                    details={"disk_percent": system_metrics.disk_percent},
                )
            )

        # 测试失败率告警
        if test_metrics.total_tests > 0:
            failure_rate = test_metrics.failed_tests / test_metrics.total_tests
            if failure_rate > alert_config.get("test_failure_threshold", 0.2):
                alerts.append(
                    Alert(
                        level=AlertLevel.ERROR,
                        message=f"测试失败率过高: {failure_rate:.1%}",
                        timestamp=datetime.now(),
                        source="test",
                        details={
                            "failure_rate": failure_rate,
                            "failed_tests": test_metrics.failed_tests,
                        },
                    )
                )

        return alerts

    def _create_system_panel(self, metrics: SystemMetrics) -> Panel:
        """创建系统监控面板"""
        # CPU 使用率
        cpu_color = (
            "green"
            if metrics.cpu_percent < 70
            else "yellow" if metrics.cpu_percent < 90 else "red"
        )
        cpu_bar = "█" * int(metrics.cpu_percent / 5) + "░" * (
            20 - int(metrics.cpu_percent / 5)
        )

        # 内存使用率
        memory_color = (
            "green"
            if metrics.memory_percent < 70
            else "yellow" if metrics.memory_percent < 90 else "red"
        )
        memory_bar = "█" * int(metrics.memory_percent / 5) + "░" * (
            20 - int(metrics.memory_percent / 5)
        )

        # 磁盘使用率
        disk_color = (
            "green"
            if metrics.disk_percent < 80
            else "yellow" if metrics.disk_percent < 90 else "red"
        )
        disk_bar = "█" * int(metrics.disk_percent / 5) + "░" * (
            20 - int(metrics.disk_percent / 5)
        )

        content = f"""
[bold blue]💻 系统资源监控[/bold blue]

[bold]CPU 使用率:[/bold] [{cpu_color}]{metrics.cpu_percent:.1f}%[/{cpu_color}] {cpu_bar}
[bold]内存使用率:[/bold] [{memory_color}]{metrics.memory_percent:.1f}%[/{memory_color}] {memory_bar}
[bold]可用内存:[/bold] {metrics.memory_available_mb:.1f} MB
[bold]磁盘使用率:[/bold] [{disk_color}]{metrics.disk_percent:.1f}%[/{disk_color}] {disk_bar}
[bold]网络发送:[/bold] {metrics.network_sent_mb:.1f} MB
[bold]网络接收:[/bold] {metrics.network_recv_mb:.1f} MB
[bold]系统负载:[/bold] {', '.join(f'{load:.2f}' for load in metrics.load_average)}
        """

        return Panel(content, title="系统监控", border_style="blue")

    def _create_test_panel(self, metrics: TestMetrics) -> Panel:
        """创建测试监控面板"""
        # 成功率颜色
        success_color = (
            "green"
            if metrics.success_rate > 0.8
            else "yellow" if metrics.success_rate > 0.6 else "red"
        )

        # 进度条
        progress_bar = "█" * int(metrics.success_rate * 20) + "░" * (
            20 - int(metrics.success_rate * 20)
        )

        content = f"""
[bold blue]🧪 测试执行监控[/bold blue]

[bold]总测试数:[/bold] {metrics.total_tests}
[bold]运行中:[/bold] {metrics.running_tests}
[bold]已通过:[/bold] [green]{metrics.passed_tests}[/green]
[bold]已失败:[/bold] [red]{metrics.failed_tests}[/red]
[bold]成功率:[/bold] [{success_color}]{metrics.success_rate:.1%}[/{success_color}] {progress_bar}
[bold]平均耗时:[/bold] {metrics.average_duration:.2f}s
[bold]总耗时:[/bold] {metrics.total_duration:.2f}s
        """

        return Panel(content, title="测试监控", border_style="green")

    def _create_alerts_panel(self, alerts: List[Alert]) -> Panel:
        """创建告警面板"""
        if not alerts:
            return Panel(
                "[green]✅ 无告警[/green]", title="告警监控", border_style="green"
            )

        content = ""
        for alert in alerts[-5:]:  # 显示最近5个告警
            level_color = {
                AlertLevel.INFO: "blue",
                AlertLevel.WARNING: "yellow",
                AlertLevel.ERROR: "red",
                AlertLevel.CRITICAL: "red",
            }.get(alert.level, "white")

            content += f"[{level_color}]● {alert.message}[/{level_color}]\n"

        return Panel(content, title="告警监控", border_style="red")

    def _create_layout(
        self,
        system_metrics: SystemMetrics,
        test_metrics: TestMetrics,
        alerts: List[Alert],
    ) -> Layout:
        """创建布局"""
        layout = Layout()

        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="main"),
            Layout(name="footer", size=3),
        )

        layout["main"].split_row(Layout(name="left"), Layout(name="right"))

        layout["left"].split_column(Layout(name="system"), Layout(name="test"))

        layout["right"].split_column(Layout(name="alerts"), Layout(name="status"))

        # 头部
        layout["header"].update(
            Panel(
                f"[bold blue]🚀 AI-Code 实时监控系统[/bold blue] | "
                f"时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | "
                f"运行时间: {self._get_uptime()}",
                border_style="blue",
            )
        )

        # 系统监控
        layout["system"].update(self._create_system_panel(system_metrics))

        # 测试监控
        layout["test"].update(self._create_test_panel(test_metrics))

        # 告警监控
        layout["alerts"].update(self._create_alerts_panel(alerts))

        # 状态
        layout["status"].update(
            Panel(
                f"[bold]📊 监控状态:[/bold] {'运行中' if self.monitoring else '已停止'}\n"
                f"[bold]📈 指标历史:[/bold] {len(self.metrics_history)} 条记录\n"
                f"[bold]🚨 告警总数:[/bold] {len(self.alerts)} 条",
                title="状态信息",
                border_style="cyan",
            )
        )

        # 底部
        layout["footer"].update(
            Panel(
                "[bold]💡 提示:[/bold] 按 Ctrl+C 停止监控 | "
                "[bold]📊 数据:[/bold] 实时更新 | "
                "[bold]🔔 告警:[/bold] 自动检测",
                border_style="green",
            )
        )

        return layout

    def _get_uptime(self) -> str:
        """获取运行时间"""
        if not self.start_time:
            return "0s"

        uptime = datetime.now() - self.start_time
        hours, remainder = divmod(int(uptime.total_seconds()), 3600)
        minutes, seconds = divmod(remainder, 60)

        if hours > 0:
            return f"{hours}h {minutes}m {seconds}s"
        elif minutes > 0:
            return f"{minutes}m {seconds}s"
        else:
            return f"{seconds}s"

    def add_alert_callback(self, callback: Callable[[Alert], None]):
        """添加告警回调"""
        self.alert_callbacks.append(callback)

    def _trigger_alerts(self, alerts: List[Alert]):
        """触发告警"""
        for alert in alerts:
            self.alerts.append(alert)

            # 调用回调函数
            for callback in self.alert_callbacks:
                try:
                    callback(alert)
                except Exception as e:
                    console.print(f"[red]❌ 告警回调异常: {e}[/red]")

    async def start_monitoring(self, test_results: Dict[str, Any] = None):
        """开始监控"""
        self.monitoring = True
        self.start_time = datetime.now()

        config = self._get_monitoring_config()
        interval = config.get("interval", 5.0)

        console.print("[green]🚀 启动实时监控系统[/green]")

        try:
            with Live(console=console, refresh_per_second=2) as live:
                while self.monitoring:
                    # 收集指标
                    system_metrics = self._collect_system_metrics()
                    test_metrics = self._collect_test_metrics(test_results or {})

                    # 检查告警
                    alerts = self._check_alerts(system_metrics, test_metrics)
                    if alerts:
                        self._trigger_alerts(alerts)

                    # 保存历史数据
                    self.metrics_history.append(system_metrics)
                    self.test_metrics_history.append(test_metrics)

                    # 限制历史数据长度
                    if len(self.metrics_history) > 100:
                        self.metrics_history = self.metrics_history[-100:]
                    if len(self.test_metrics_history) > 100:
                        self.test_metrics_history = self.test_metrics_history[-100:]

                    # 更新显示
                    layout = self._create_layout(
                        system_metrics, test_metrics, self.alerts
                    )
                    live.update(layout)

                    # 等待下次更新
                    await asyncio.sleep(interval)

        except KeyboardInterrupt:
            console.print("\n[yellow]⚠️  监控被用户中断[/yellow]")
        finally:
            self.monitoring = False
            console.print("[red]🛑 监控已停止[/red]")

    def stop_monitoring(self):
        """停止监控"""
        self.monitoring = False

    def get_metrics_summary(self) -> Dict[str, Any]:
        """获取指标摘要"""
        if not self.metrics_history:
            return {}

        latest_metrics = self.metrics_history[-1]
        latest_test_metrics = (
            self.test_metrics_history[-1] if self.test_metrics_history else None
        )

        return {
            "system": {
                "cpu_percent": latest_metrics.cpu_percent,
                "memory_percent": latest_metrics.memory_percent,
                "disk_percent": latest_metrics.disk_percent,
                "load_average": latest_metrics.load_average,
            },
            "test": latest_test_metrics.__dict__ if latest_test_metrics else {},
            "alerts": {
                "total": len(self.alerts),
                "recent": [alert.__dict__ for alert in self.alerts[-5:]],
            },
            "uptime": self._get_uptime(),
        }

    def export_metrics(self, output_path: str = "monitoring_data.json"):
        """导出监控数据"""
        data = {
            "summary": self.get_metrics_summary(),
            "system_metrics": [asdict(m) for m in self.metrics_history],
            "test_metrics": [asdict(m) for m in self.test_metrics_history],
            "alerts": [asdict(a) for a in self.alerts],
        }

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False, default=str)

        console.print(f"[green]✅ 监控数据已导出: {output_path}[/green]")


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="AI-Code 实时监控系统")
    parser.add_argument("--config", default="config.yml", help="配置文件路径")
    parser.add_argument("--export", help="导出监控数据到文件")

    args = parser.parse_args()

    # 创建监控器
    monitor = RealtimeMonitor(args.config)

    # 添加告警回调
    def alert_callback(alert: Alert):
        console.print(f"[yellow]🚨 告警: {alert.message}[/yellow]")

    monitor.add_alert_callback(alert_callback)

    try:
        # 启动监控
        asyncio.run(monitor.start_monitoring())

    except KeyboardInterrupt:
        console.print("\n[yellow]⚠️  监控被用户中断[/yellow]")
    finally:
        # 导出数据
        if args.export:
            monitor.export_metrics(args.export)
        else:
            monitor.export_metrics()


if __name__ == "__main__":
    main()
