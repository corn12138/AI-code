"""
通知管理工具
"""

import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any, Dict, Optional

import aiohttp
from utils.logger import get_logger

from config import NotificationConfig


class NotificationManager:
    """通知管理器"""

    def __init__(self, config: NotificationConfig):
        self.config = config
        self.logger = get_logger("notification")

    async def send_test_results(self, results: Dict[str, Any], success: bool):
        """发送测试结果通知"""
        if not self.config.enabled:
            return

        message = self._format_test_results_message(results, success)

        # 发送 Slack 通知
        if self.config.slack_webhook:
            await self._send_slack_notification(message, success)

        # 发送邮件通知
        if self.config.email_to:
            await self._send_email_notification(message, success)

    def _format_test_results_message(
        self, results: Dict[str, Any], success: bool
    ) -> str:
        """格式化测试结果消息"""
        total = len(results)
        passed = len([t for t in results.values() if t.is_successful])
        failed = total - passed

        status = "✅ 成功" if success else "❌ 失败"

        message = f"""
🧪 自动化测试报告

📊 结果概览:
  • 状态: {status}
  • 总测试数: {total}
  • 通过: {passed}
  • 失败: {failed}
  • 成功率: {(passed/total)*100:.1f}%

⏱️ 执行详情:
"""

        # 添加失败的测试详情
        if not success:
            failed_tasks = [t for t in results.values() if not t.is_successful]
            message += "\n❌ 失败的测试:\n"
            for task in failed_tasks[:5]:  # 只显示前5个
                message += f"  • {task.id}: {task.error or '执行失败'}\n"

            if len(failed_tasks) > 5:
                message += f"  ... 还有 {len(failed_tasks) - 5} 个失败的测试\n"

        return message

    async def _send_slack_notification(self, message: str, success: bool):
        """发送 Slack 通知"""
        try:
            color = "good" if success else "danger"

            payload = {
                "attachments": [
                    {
                        "color": color,
                        "title": "自动化测试报告",
                        "text": message,
                        "footer": "AI-Code Test Orchestrator",
                        "ts": int(asyncio.get_event_loop().time()),
                    }
                ]
            }

            async with aiohttp.ClientSession() as session:
                async with session.post(
                    self.config.slack_webhook, json=payload
                ) as response:
                    if response.status == 200:
                        self.logger.info("Slack 通知发送成功")
                    else:
                        self.logger.error(f"Slack 通知发送失败: {response.status}")

        except Exception as e:
            self.logger.error(f"发送 Slack 通知时出错: {e}")

    async def _send_email_notification(self, message: str, success: bool):
        """发送邮件通知"""
        try:
            subject = f"自动化测试报告 - {'成功' if success else '失败'}"

            # 创建邮件
            msg = MIMEMultipart()
            msg["From"] = self.config.email_username
            msg["Subject"] = subject

            # 添加邮件正文
            msg.attach(MIMEText(message, "plain", "utf-8"))

            # 发送邮件
            await self._send_email(msg)

        except Exception as e:
            self.logger.error(f"发送邮件通知时出错: {e}")

    async def _send_email(self, msg: MIMEMultipart):
        """发送邮件"""
        loop = asyncio.get_event_loop()

        def send_sync():
            with smtplib.SMTP(
                self.config.email_smtp_host, self.config.email_smtp_port
            ) as server:
                server.starttls()
                server.login(self.config.email_username, self.config.email_password)

                for recipient in self.config.email_to:
                    msg["To"] = recipient
                    server.send_message(msg)
                    del msg["To"]

        await loop.run_in_executor(None, send_sync)
        self.logger.info(f"邮件通知发送成功，收件人: {', '.join(self.config.email_to)}")

    async def send_custom_notification(
        self, title: str, message: str, level: str = "info"
    ):
        """发送自定义通知"""
        if not self.config.enabled:
            return

        color_map = {
            "info": "#36a64f",
            "warning": "#ff9500",
            "error": "#ff0000",
            "success": "#00ff00",
        }

        # Slack 通知
        if self.config.slack_webhook:
            payload = {
                "attachments": [
                    {
                        "color": color_map.get(level, "#36a64f"),
                        "title": title,
                        "text": message,
                        "footer": "AI-Code Test Orchestrator",
                    }
                ]
            }

            try:
                async with aiohttp.ClientSession() as session:
                    await session.post(self.config.slack_webhook, json=payload)
            except Exception as e:
                self.logger.error(f"发送自定义 Slack 通知失败: {e}")

        # 邮件通知（仅错误和警告）
        if self.config.email_to and level in ["error", "warning"]:
            try:
                msg = MIMEMultipart()
                msg["From"] = self.config.email_username
                msg["Subject"] = f"[{level.upper()}] {title}"
                msg.attach(MIMEText(message, "plain", "utf-8"))

                await self._send_email(msg)
            except Exception as e:
                self.logger.error(f"发送自定义邮件通知失败: {e}")
