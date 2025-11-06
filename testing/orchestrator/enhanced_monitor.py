#!/usr/bin/env python3
"""
AI-Code 企业级测试监控系统
实时监控测试执行、资源使用、性能指标和告警
"""

import asyncio
import json
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from threading import Lock
from typing import Any, Callable, Dict, List, Optional

try:
    import aiofiles
    import psutil
    import requests
    import websockets
    from websockets.server import serve
except ImportError:
    # 如果依赖不可用，使用模拟实现
    aiofiles = None
    psutil = None
    requests = None
    websockets = None
    serve = None


class AlertLevel(Enum):
    """告警级别"""

    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"


class MetricType(Enum):
    """指标类型"""

    CPU_USAGE = "cpu_usage"
    MEMORY_USAGE = "memory_usage"
    DISK_USAGE = "disk_usage"
    NETWORK_IO = "network_io"
    TEST_EXECUTION = "test_execution"
    TEST_SUCCESS_RATE = "test_success_rate"
    TEST_DURATION = "test_duration"
    FLAKY_TEST_RATE = "flaky_test_rate"


@dataclass
class Metric:
    """指标数据类"""

    name: str
    value: float
    timestamp: datetime
    tags: Dict[str, str] = field(default_factory=dict)
    unit: str = ""


@dataclass
class Alert:
    """告警数据类"""

    id: str
    level: AlertLevel
    message: str
    metric_name: str
    threshold: float
    current_value: float
    timestamp: datetime
    resolved: bool = False
    resolved_at: Optional[datetime] = None


@dataclass
class TestExecution:
    """测试执行数据类"""

    test_id: str
    app_name: str
    test_type: str
    status: str
    start_time: datetime
    end_time: Optional[datetime] = None
    duration: Optional[float] = None
    coverage: Optional[float] = None
    error_message: Optional[str] = None


class TestMonitor:
    """测试监控器"""

    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.logger = setup_logger("monitor", level=logging.INFO)

        # 监控状态
        self.is_monitoring = False
        self.metrics: List[Metric] = []
        self.alerts: List[Alert] = []
        self.test_executions: List[TestExecution] = []

        # 阈值配置
        self.thresholds = self.config.get(
            "thresholds",
            {
                "cpu_usage": 80.0,
                "memory_usage": 85.0,
                "disk_usage": 90.0,
                "test_success_rate": 80.0,
                "flaky_test_rate": 10.0,
            },
        )

        # 回调函数
        self.alert_callbacks: List[Callable[[Alert], None]] = []
        self.metric_callbacks: List[Callable[[Metric], None]] = []

        # 线程锁
        self.lock = Lock()

        # WebSocket 服务器
        self.websocket_server = None
        self.connected_clients = set()

    async def start_monitoring(self, interval: float = 5.0):
        """开始监控"""
        self.logger.info("🔍 开始测试监控")
        self.is_monitoring = True

        # 启动 WebSocket 服务器
        await self._start_websocket_server()

        # 启动监控任务
        tasks = [
            self._monitor_system_metrics(interval),
            self._monitor_test_executions(),
            self._check_alerts(),
            self._cleanup_old_data(),
        ]

        await asyncio.gather(*tasks)

    async def stop_monitoring(self):
        """停止监控"""
        self.logger.info("🛑 停止测试监控")
        self.is_monitoring = False

        if self.websocket_server:
            self.websocket_server.close()
            await self.websocket_server.wait_closed()

    async def _monitor_system_metrics(self, interval: float):
        """监控系统指标"""
        while self.is_monitoring:
            try:
                # CPU 使用率
                cpu_percent = psutil.cpu_percent(interval=1)
                await self._record_metric(MetricType.CPU_USAGE, cpu_percent)

                # 内存使用率
                memory = psutil.virtual_memory()
                await self._record_metric(MetricType.MEMORY_USAGE, memory.percent)

                # 磁盘使用率
                disk = psutil.disk_usage("/")
                disk_percent = (disk.used / disk.total) * 100
                await self._record_metric(MetricType.DISK_USAGE, disk_percent)

                # 网络 I/O
                network = psutil.net_io_counters()
                await self._record_metric(
                    MetricType.NETWORK_IO, network.bytes_sent + network.bytes_recv
                )

                await asyncio.sleep(interval)

            except Exception as e:
                self.logger.error(f"系统指标监控异常: {e}")
                await asyncio.sleep(interval)

    async def _monitor_test_executions(self):
        """监控测试执行"""
        while self.is_monitoring:
            try:
                # 这里可以监控测试执行状态
                # 例如从测试编排器获取实时状态
                await asyncio.sleep(1)

            except Exception as e:
                self.logger.error(f"测试执行监控异常: {e}")
                await asyncio.sleep(1)

    async def _check_alerts(self):
        """检查告警"""
        while self.is_monitoring:
            try:
                with self.lock:
                    # 检查 CPU 使用率告警
                    cpu_metrics = [
                        m for m in self.metrics if m.name == MetricType.CPU_USAGE.value
                    ]
                    if cpu_metrics:
                        latest_cpu = cpu_metrics[-1]
                        if latest_cpu.value > self.thresholds["cpu_usage"]:
                            await self._create_alert(
                                AlertLevel.WARNING,
                                f"CPU 使用率过高: {latest_cpu.value:.1f}%",
                                MetricType.CPU_USAGE.value,
                                self.thresholds["cpu_usage"],
                                latest_cpu.value,
                            )

                    # 检查内存使用率告警
                    memory_metrics = [
                        m
                        for m in self.metrics
                        if m.name == MetricType.MEMORY_USAGE.value
                    ]
                    if memory_metrics:
                        latest_memory = memory_metrics[-1]
                        if latest_memory.value > self.thresholds["memory_usage"]:
                            await self._create_alert(
                                AlertLevel.WARNING,
                                f"内存使用率过高: {latest_memory.value:.1f}%",
                                MetricType.MEMORY_USAGE.value,
                                self.thresholds["memory_usage"],
                                latest_memory.value,
                            )

                    # 检查磁盘使用率告警
                    disk_metrics = [
                        m for m in self.metrics if m.name == MetricType.DISK_USAGE.value
                    ]
                    if disk_metrics:
                        latest_disk = disk_metrics[-1]
                        if latest_disk.value > self.thresholds["disk_usage"]:
                            await self._create_alert(
                                AlertLevel.ERROR,
                                f"磁盘使用率过高: {latest_disk.value:.1f}%",
                                MetricType.DISK_USAGE.value,
                                self.thresholds["disk_usage"],
                                latest_disk.value,
                            )

                await asyncio.sleep(10)  # 每10秒检查一次告警

            except Exception as e:
                self.logger.error(f"告警检查异常: {e}")
                await asyncio.sleep(10)

    async def _cleanup_old_data(self):
        """清理旧数据"""
        while self.is_monitoring:
            try:
                cutoff_time = datetime.now() - timedelta(hours=24)

                with self.lock:
                    # 清理旧指标
                    self.metrics = [
                        m for m in self.metrics if m.timestamp > cutoff_time
                    ]

                    # 清理旧告警
                    self.alerts = [a for a in self.alerts if a.timestamp > cutoff_time]

                    # 清理旧测试执行记录
                    self.test_executions = [
                        t for t in self.test_executions if t.start_time > cutoff_time
                    ]

                await asyncio.sleep(3600)  # 每小时清理一次

            except Exception as e:
                self.logger.error(f"数据清理异常: {e}")
                await asyncio.sleep(3600)

    async def _record_metric(
        self, metric_type: MetricType, value: float, tags: Dict[str, str] = None
    ):
        """记录指标"""
        metric = Metric(
            name=metric_type.value,
            value=value,
            timestamp=datetime.now(),
            tags=tags or {},
            unit=self._get_metric_unit(metric_type),
        )

        with self.lock:
            self.metrics.append(metric)

        # 触发回调
        for callback in self.metric_callbacks:
            try:
                callback(metric)
            except Exception as e:
                self.logger.error(f"指标回调异常: {e}")

        # 广播到 WebSocket 客户端
        await self._broadcast_metric(metric)

    async def _create_alert(
        self,
        level: AlertLevel,
        message: str,
        metric_name: str,
        threshold: float,
        current_value: float,
    ):
        """创建告警"""
        alert_id = f"{metric_name}_{int(time.time())}"

        # 检查是否已存在相同告警
        with self.lock:
            existing_alert = next(
                (
                    a
                    for a in self.alerts
                    if a.metric_name == metric_name and not a.resolved
                ),
                None,
            )

            if existing_alert:
                return  # 避免重复告警

        alert = Alert(
            id=alert_id,
            level=level,
            message=message,
            metric_name=metric_name,
            threshold=threshold,
            current_value=current_value,
            timestamp=datetime.now(),
        )

        with self.lock:
            self.alerts.append(alert)

        # 触发回调
        for callback in self.alert_callbacks:
            try:
                callback(alert)
            except Exception as e:
                self.logger.error(f"告警回调异常: {e}")

        # 广播到 WebSocket 客户端
        await self._broadcast_alert(alert)

        self.logger.warning(f"🚨 告警: {message}")

    def _get_metric_unit(self, metric_type: MetricType) -> str:
        """获取指标单位"""
        units = {
            MetricType.CPU_USAGE: "%",
            MetricType.MEMORY_USAGE: "%",
            MetricType.DISK_USAGE: "%",
            MetricType.NETWORK_IO: "bytes",
            MetricType.TEST_EXECUTION: "count",
            MetricType.TEST_SUCCESS_RATE: "%",
            MetricType.TEST_DURATION: "seconds",
            MetricType.FLAKY_TEST_RATE: "%",
        }
        return units.get(metric_type, "")

    async def _start_websocket_server(self):
        """启动 WebSocket 服务器"""
        port = self.config.get("websocket_port", 8765)

        async def handle_client(websocket, path):
            self.connected_clients.add(websocket)
            self.logger.info(f"WebSocket 客户端连接: {websocket.remote_address}")

            try:
                # 发送历史数据
                await self._send_historical_data(websocket)

                # 保持连接
                await websocket.wait_closed()
            except websockets.exceptions.ConnectionClosed:
                pass
            finally:
                self.connected_clients.remove(websocket)
                self.logger.info(f"WebSocket 客户端断开: {websocket.remote_address}")

        self.websocket_server = await serve(handle_client, "localhost", port)
        self.logger.info(f"WebSocket 服务器启动: ws://localhost:{port}")

    async def _send_historical_data(self, websocket):
        """发送历史数据"""
        try:
            # 发送最近的指标
            recent_metrics = self.metrics[-100:]  # 最近100个指标
            for metric in recent_metrics:
                data = {
                    "type": "metric",
                    "data": {
                        "name": metric.name,
                        "value": metric.value,
                        "timestamp": metric.timestamp.isoformat(),
                        "tags": metric.tags,
                        "unit": metric.unit,
                    },
                }
                await websocket.send(json.dumps(data))

            # 发送未解决的告警
            unresolved_alerts = [a for a in self.alerts if not a.resolved]
            for alert in unresolved_alerts:
                data = {
                    "type": "alert",
                    "data": {
                        "id": alert.id,
                        "level": alert.level.value,
                        "message": alert.message,
                        "metric_name": alert.metric_name,
                        "threshold": alert.threshold,
                        "current_value": alert.current_value,
                        "timestamp": alert.timestamp.isoformat(),
                    },
                }
                await websocket.send(json.dumps(data))

        except Exception as e:
            self.logger.error(f"发送历史数据异常: {e}")

    async def _broadcast_metric(self, metric: Metric):
        """广播指标到所有客户端"""
        if not self.connected_clients:
            return

        data = {
            "type": "metric",
            "data": {
                "name": metric.name,
                "value": metric.value,
                "timestamp": metric.timestamp.isoformat(),
                "tags": metric.tags,
                "unit": metric.unit,
            },
        }

        message = json.dumps(data)
        disconnected = set()

        for client in self.connected_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)

        # 清理断开的连接
        self.connected_clients -= disconnected

    async def _broadcast_alert(self, alert: Alert):
        """广播告警到所有客户端"""
        if not self.connected_clients:
            return

        data = {
            "type": "alert",
            "data": {
                "id": alert.id,
                "level": alert.level.value,
                "message": alert.message,
                "metric_name": alert.metric_name,
                "threshold": alert.threshold,
                "current_value": alert.current_value,
                "timestamp": alert.timestamp.isoformat(),
            },
        }

        message = json.dumps(data)
        disconnected = set()

        for client in self.connected_clients:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                disconnected.add(client)

        # 清理断开的连接
        self.connected_clients -= disconnected

    def add_alert_callback(self, callback: Callable[[Alert], None]):
        """添加告警回调"""
        self.alert_callbacks.append(callback)

    def add_metric_callback(self, callback: Callable[[Metric], None]):
        """添加指标回调"""
        self.metric_callbacks.append(callback)

    def get_metrics_summary(self) -> Dict[str, Any]:
        """获取指标摘要"""
        with self.lock:
            if not self.metrics:
                return {}

            # 按指标类型分组
            metrics_by_type = {}
            for metric in self.metrics:
                if metric.name not in metrics_by_type:
                    metrics_by_type[metric.name] = []
                metrics_by_type[metric.name].append(metric)

            summary = {}
            for metric_name, metrics in metrics_by_type.items():
                values = [m.value for m in metrics]
                summary[metric_name] = {
                    "count": len(values),
                    "min": min(values),
                    "max": max(values),
                    "avg": sum(values) / len(values),
                    "latest": values[-1] if values else 0,
                }

            return summary

    def get_alerts_summary(self) -> Dict[str, Any]:
        """获取告警摘要"""
        with self.lock:
            total_alerts = len(self.alerts)
            unresolved_alerts = len([a for a in self.alerts if not a.resolved])

            # 按级别统计
            alerts_by_level = {}
            for alert in self.alerts:
                level = alert.level.value
                if level not in alerts_by_level:
                    alerts_by_level[level] = 0
                alerts_by_level[level] += 1

            return {
                "total": total_alerts,
                "unresolved": unresolved_alerts,
                "by_level": alerts_by_level,
                "recent": [a.__dict__ for a in self.alerts[-10:]],  # 最近10个告警
            }

    async def record_test_execution(self, test_execution: TestExecution):
        """记录测试执行"""
        with self.lock:
            self.test_executions.append(test_execution)

        # 计算测试成功率
        recent_tests = [
            t
            for t in self.test_executions
            if t.start_time > datetime.now() - timedelta(hours=1)
        ]

        if recent_tests:
            success_count = len([t for t in recent_tests if t.status == "passed"])
            success_rate = (success_count / len(recent_tests)) * 100

            await self._record_metric(
                MetricType.TEST_SUCCESS_RATE,
                success_rate,
                {"app": test_execution.app_name, "type": test_execution.test_type},
            )

            # 检查成功率告警
            if success_rate < self.thresholds["test_success_rate"]:
                await self._create_alert(
                    AlertLevel.ERROR,
                    f"测试成功率过低: {success_rate:.1f}%",
                    MetricType.TEST_SUCCESS_RATE.value,
                    self.thresholds["test_success_rate"],
                    success_rate,
                )

    async def save_monitoring_data(
        self, output_dir: str = "./testing/reports/monitoring"
    ):
        """保存监控数据"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        # 保存指标数据
        metrics_file = output_path / "metrics.json"
        async with aiofiles.open(metrics_file, "w", encoding="utf-8") as f:
            metrics_data = [
                {
                    "name": m.name,
                    "value": m.value,
                    "timestamp": m.timestamp.isoformat(),
                    "tags": m.tags,
                    "unit": m.unit,
                }
                for m in self.metrics
            ]
            await f.write(json.dumps(metrics_data, indent=2, ensure_ascii=False))

        # 保存告警数据
        alerts_file = output_path / "alerts.json"
        async with aiofiles.open(alerts_file, "w", encoding="utf-8") as f:
            alerts_data = [
                {
                    "id": a.id,
                    "level": a.level.value,
                    "message": a.message,
                    "metric_name": a.metric_name,
                    "threshold": a.threshold,
                    "current_value": a.current_value,
                    "timestamp": a.timestamp.isoformat(),
                    "resolved": a.resolved,
                    "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
                }
                for a in self.alerts
            ]
            await f.write(json.dumps(alerts_data, indent=2, ensure_ascii=False))

        # 保存摘要
        summary_file = output_path / "summary.json"
        async with aiofiles.open(summary_file, "w", encoding="utf-8") as f:
            summary_data = {
                "metrics_summary": self.get_metrics_summary(),
                "alerts_summary": self.get_alerts_summary(),
                "generated_at": datetime.now().isoformat(),
            }
            await f.write(json.dumps(summary_data, indent=2, ensure_ascii=False))


def setup_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """设置日志记录器"""
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


async def main():
    """主函数"""
    # 创建监控器
    config = {
        "thresholds": {
            "cpu_usage": 80.0,
            "memory_usage": 85.0,
            "disk_usage": 90.0,
            "test_success_rate": 80.0,
            "flaky_test_rate": 10.0,
        },
        "websocket_port": 8765,
    }

    monitor = TestMonitor(config)

    # 添加回调
    def alert_callback(alert: Alert):
        print(f"🚨 告警: {alert.message}")

    def metric_callback(metric: Metric):
        if metric.name in ["cpu_usage", "memory_usage"]:
            print(f"📊 {metric.name}: {metric.value}{metric.unit}")

    monitor.add_alert_callback(alert_callback)
    monitor.add_metric_callback(metric_callback)

    try:
        # 开始监控
        await monitor.start_monitoring(interval=5.0)
    except KeyboardInterrupt:
        print("\n监控被用户中断")
    finally:
        await monitor.stop_monitoring()
        await monitor.save_monitoring_data()


if __name__ == "__main__":
    asyncio.run(main())
