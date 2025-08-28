"""
资源监控工具
"""

import time
from dataclasses import dataclass
from threading import Event, Thread
from typing import Dict, List, Optional

import psutil
from utils.logger import get_logger


@dataclass
class ResourceSnapshot:
    """资源快照"""

    timestamp: float
    cpu_percent: float
    memory_percent: float
    disk_usage_percent: float
    network_io: Dict
    load_average: List[float]


class ResourceMonitor:
    """资源监控器"""

    def __init__(self, interval: float = 5.0):
        self.interval = interval
        self.logger = get_logger("resource_monitor")
        self.snapshots: List[ResourceSnapshot] = []
        self._monitoring = False
        self._stop_event = Event()
        self._monitor_thread: Optional[Thread] = None

    def start(self):
        """开始监控"""
        if self._monitoring:
            return

        self._monitoring = True
        self._stop_event.clear()
        self._monitor_thread = Thread(target=self._monitor_loop, daemon=True)
        self._monitor_thread.start()
        self.logger.info("开始资源监控")

    def stop(self):
        """停止监控"""
        if not self._monitoring:
            return

        self._monitoring = False
        self._stop_event.set()

        if self._monitor_thread:
            self._monitor_thread.join(timeout=5)

        self.logger.info("停止资源监控")

    def _monitor_loop(self):
        """监控循环"""
        while not self._stop_event.wait(self.interval):
            try:
                snapshot = self._take_snapshot()
                self.snapshots.append(snapshot)

                # 保留最近1000个快照
                if len(self.snapshots) > 1000:
                    self.snapshots = self.snapshots[-1000:]

                # 检查资源使用情况
                self._check_resource_thresholds(snapshot)

            except Exception as e:
                self.logger.error(f"资源监控错误: {e}")

    def _take_snapshot(self) -> ResourceSnapshot:
        """拍摄资源快照"""
        # CPU 使用率
        cpu_percent = psutil.cpu_percent(interval=1)

        # 内存使用率
        memory = psutil.virtual_memory()
        memory_percent = memory.percent

        # 磁盘使用率
        disk = psutil.disk_usage("/")
        disk_usage_percent = (disk.used / disk.total) * 100

        # 网络 I/O
        network_io = psutil.net_io_counters()._asdict()

        # 系统负载
        try:
            load_average = list(psutil.getloadavg())
        except AttributeError:
            # Windows 不支持 getloadavg
            load_average = [0.0, 0.0, 0.0]

        return ResourceSnapshot(
            timestamp=time.time(),
            cpu_percent=cpu_percent,
            memory_percent=memory_percent,
            disk_usage_percent=disk_usage_percent,
            network_io=network_io,
            load_average=load_average,
        )

    def _check_resource_thresholds(self, snapshot: ResourceSnapshot):
        """检查资源阈值"""
        # CPU 使用率过高
        if snapshot.cpu_percent > 90:
            self.logger.warning(f"CPU 使用率过高: {snapshot.cpu_percent:.1f}%")

        # 内存使用率过高
        if snapshot.memory_percent > 90:
            self.logger.warning(f"内存使用率过高: {snapshot.memory_percent:.1f}%")

        # 磁盘使用率过高
        if snapshot.disk_usage_percent > 95:
            self.logger.warning(f"磁盘使用率过高: {snapshot.disk_usage_percent:.1f}%")

    def get_current_stats(self) -> Optional[ResourceSnapshot]:
        """获取当前资源状态"""
        if not self.snapshots:
            return self._take_snapshot()
        return self.snapshots[-1]

    def get_average_stats(self, duration_minutes: int = 5) -> Optional[Dict]:
        """获取平均统计信息"""
        if not self.snapshots:
            return None

        cutoff_time = time.time() - (duration_minutes * 60)
        recent_snapshots = [s for s in self.snapshots if s.timestamp >= cutoff_time]

        if not recent_snapshots:
            return None

        avg_cpu = sum(s.cpu_percent for s in recent_snapshots) / len(recent_snapshots)
        avg_memory = sum(s.memory_percent for s in recent_snapshots) / len(
            recent_snapshots
        )
        avg_disk = sum(s.disk_usage_percent for s in recent_snapshots) / len(
            recent_snapshots
        )

        return {
            "average_cpu_percent": avg_cpu,
            "average_memory_percent": avg_memory,
            "average_disk_percent": avg_disk,
            "sample_count": len(recent_snapshots),
            "duration_minutes": duration_minutes,
        }

    def is_system_under_pressure(self) -> bool:
        """检查系统是否处于压力状态"""
        current = self.get_current_stats()
        if not current:
            return False

        # 任一资源使用率超过80%则认为系统有压力
        return (
            current.cpu_percent > 80
            or current.memory_percent > 80
            or current.disk_usage_percent > 90
        )

    def get_resource_report(self) -> Dict:
        """生成资源使用报告"""
        if not self.snapshots:
            return {"status": "no_data"}

        current = self.snapshots[-1]
        avg_5min = self.get_average_stats(5)
        avg_15min = self.get_average_stats(15)

        return {
            "status": "ok",
            "current": {
                "cpu_percent": current.cpu_percent,
                "memory_percent": current.memory_percent,
                "disk_percent": current.disk_usage_percent,
                "load_average": current.load_average,
                "timestamp": current.timestamp,
            },
            "averages": {"5_minutes": avg_5min, "15_minutes": avg_15min},
            "total_snapshots": len(self.snapshots),
            "monitoring_duration": (
                self.snapshots[-1].timestamp - self.snapshots[0].timestamp
                if len(self.snapshots) > 1
                else 0
            ),
        }
