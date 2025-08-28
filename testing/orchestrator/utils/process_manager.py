"""
进程管理工具
"""

import signal
import subprocess
from typing import Dict, List, Optional

import psutil
from utils.logger import get_logger


class ProcessManager:
    """进程管理器"""

    def __init__(self):
        self.logger = get_logger("process_manager")
        self.managed_processes: Dict[str, subprocess.Popen] = {}

    def start_process(
        self,
        name: str,
        command: str,
        cwd: Optional[str] = None,
        env: Optional[Dict] = None,
    ) -> subprocess.Popen:
        """启动进程"""
        try:
            process = subprocess.Popen(
                command,
                shell=True,
                cwd=cwd,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

            self.managed_processes[name] = process
            self.logger.info(f"启动进程 {name}: PID {process.pid}")
            return process

        except Exception as e:
            self.logger.error(f"启动进程 {name} 失败: {e}")
            raise

    def stop_process(self, name: str, timeout: int = 10) -> bool:
        """停止进程"""
        if name not in self.managed_processes:
            return True

        process = self.managed_processes[name]

        try:
            if process.poll() is None:  # 进程仍在运行
                # 优雅关闭
                process.terminate()

                try:
                    process.wait(timeout=timeout)
                except subprocess.TimeoutExpired:
                    # 强制关闭
                    process.kill()
                    process.wait()

                self.logger.info(f"停止进程 {name}")

            del self.managed_processes[name]
            return True

        except Exception as e:
            self.logger.error(f"停止进程 {name} 失败: {e}")
            return False

    def stop_all(self):
        """停止所有管理的进程"""
        for name in list(self.managed_processes.keys()):
            self.stop_process(name)

    def is_running(self, name: str) -> bool:
        """检查进程是否运行中"""
        if name not in self.managed_processes:
            return False

        process = self.managed_processes[name]
        return process.poll() is None

    def get_process_info(self, name: str) -> Optional[Dict]:
        """获取进程信息"""
        if name not in self.managed_processes:
            return None

        process = self.managed_processes[name]

        try:
            ps_process = psutil.Process(process.pid)
            return {
                "pid": process.pid,
                "status": ps_process.status(),
                "cpu_percent": ps_process.cpu_percent(),
                "memory_info": ps_process.memory_info(),
                "create_time": ps_process.create_time(),
            }
        except psutil.NoSuchProcess:
            return None

    def kill_by_port(self, port: int) -> bool:
        """根据端口杀死进程"""
        try:
            for proc in psutil.process_iter(["pid", "name", "connections"]):
                try:
                    for conn in proc.info.get("connections", []):
                        if conn.laddr.port == port:
                            proc.kill()
                            self.logger.info(
                                f"杀死占用端口 {port} 的进程: PID {proc.pid}"
                            )
                            return True
                except (psutil.AccessDenied, psutil.NoSuchProcess):
                    continue
            return False
        except Exception as e:
            self.logger.error(f"杀死端口 {port} 进程失败: {e}")
            return False
