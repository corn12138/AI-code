"""
日志配置和管理
"""

import logging
import sys
from pathlib import Path
from typing import Optional

from rich.console import Console
from rich.logging import RichHandler


def setup_logging(verbose: bool = False, log_file: Optional[str] = None):
    """设置日志配置"""
    level = logging.DEBUG if verbose else logging.INFO

    # 创建根日志器
    root_logger = logging.getLogger()
    root_logger.setLevel(level)

    # 清除现有处理器
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # 创建格式器
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # 添加控制台处理器（使用 Rich）
    console_handler = RichHandler(
        console=Console(stderr=True), show_time=False, show_path=verbose
    )
    console_handler.setLevel(level)
    root_logger.addHandler(console_handler)

    # 添加文件处理器（如果指定）
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)


def get_logger(name: str) -> logging.Logger:
    """获取日志器"""
    return logging.getLogger(name)
