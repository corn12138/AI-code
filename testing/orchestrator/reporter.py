"""
测试报告生成器
生成多种格式的测试报告和可视化图表
"""

import base64
import io
import json
import time
from dataclasses import asdict
from pathlib import Path
from typing import Any, Dict, List

from jinja2 import Environment, FileSystemLoader, Template
from utils.logger import get_logger

from config import TestConfig


class TestReporter:
    """测试报告生成器"""

    def __init__(self, config: TestConfig):
        self.config = config
        self.logger = get_logger("reporter")
        self.reports_dir = Path(config.test_root) / "reports"
        self.templates_dir = Path(__file__).parent / "templates"

        # 确保报告目录存在
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        (self.reports_dir / "html").mkdir(exist_ok=True)
        (self.reports_dir / "json").mkdir(exist_ok=True)
        (self.reports_dir / "coverage").mkdir(exist_ok=True)

    async def generate_reports(self, test_results: Dict[str, Any]):
        """生成所有格式的报告"""
        self.logger.info("开始生成测试报告...")

        # 处理测试结果数据
        report_data = self._process_test_results(test_results)

        # 生成不同格式的报告
        reports = {}

        if "json" in self.config.report_formats:
            reports["json"] = await self._generate_json_report(report_data)

        if "html" in self.config.report_formats:
            reports["html"] = await self._generate_html_report(report_data)

        if "allure" in self.config.report_formats:
            reports["allure"] = await self._generate_allure_report(report_data)

        self.logger.info(f"报告生成完成: {list(reports.keys())}")
        return reports

    def _process_test_results(self, test_results: Dict[str, Any]) -> Dict[str, Any]:
        """处理测试结果数据"""
        total_tests = len(test_results)
        passed_tests = len([t for t in test_results.values() if t.is_successful])
        failed_tests = total_tests - passed_tests

        # 按应用分组
        results_by_app = {}
        for task in test_results.values():
            app = task.app or "unknown"
            if app not in results_by_app:
                results_by_app[app] = {"passed": 0, "failed": 0, "tasks": []}

            if task.is_successful:
                results_by_app[app]["passed"] += 1
            else:
                results_by_app[app]["failed"] += 1

            results_by_app[app]["tasks"].append(task)

        # 按测试套件分组
        results_by_suite = {}
        for task in test_results.values():
            suite = task.suite.value
            if suite not in results_by_suite:
                results_by_suite[suite] = {"passed": 0, "failed": 0, "tasks": []}

            if task.is_successful:
                results_by_suite[suite]["passed"] += 1
            else:
                results_by_suite[suite]["failed"] += 1

            results_by_suite[suite]["tasks"].append(task)

        # 计算执行时间统计
        durations = [t.duration for t in test_results.values() if t.duration]
        total_duration = sum(durations) if durations else 0
        avg_duration = total_duration / len(durations) if durations else 0

        # 获取失败的测试详情
        failed_tasks = [t for t in test_results.values() if not t.is_successful]

        return {
            "summary": {
                "total_tests": total_tests,
                "passed_tests": passed_tests,
                "failed_tests": failed_tests,
                "success_rate": (
                    (passed_tests / total_tests * 100) if total_tests > 0 else 0
                ),
                "total_duration": total_duration,
                "average_duration": avg_duration,
                "timestamp": time.time(),
                "timestamp_str": time.strftime("%Y-%m-%d %H:%M:%S"),
            },
            "results_by_app": results_by_app,
            "results_by_suite": results_by_suite,
            "failed_tasks": [self._task_to_dict(t) for t in failed_tasks],
            "all_tasks": [self._task_to_dict(t) for t in test_results.values()],
            "config": {
                "parallel_workers": self.config.parallel_workers,
                "test_timeout": self.config.test_timeout,
                "retry_failed": self.config.retry_failed,
                "project_root": self.config.project_root,
            },
        }

    def _task_to_dict(self, task) -> Dict[str, Any]:
        """将任务对象转换为字典"""
        return {
            "id": task.id,
            "suite": task.suite.value,
            "app": task.app,
            "command": task.command,
            "status": task.status.value,
            "duration": task.duration,
            "start_time": task.start_time,
            "end_time": task.end_time,
            "output": task.output,
            "error": task.error,
            "return_code": task.return_code,
            "retry_count": task.retry_count,
            "max_retries": task.max_retries,
        }

    async def _generate_json_report(self, report_data: Dict[str, Any]) -> str:
        """生成 JSON 格式报告"""
        report_file = self.reports_dir / "json" / "test_results.json"

        with open(report_file, "w", encoding="utf-8") as f:
            json.dump(report_data, f, indent=2, ensure_ascii=False, default=str)

        self.logger.info(f"JSON 报告生成: {report_file}")
        return str(report_file)

    async def _generate_html_report(self, report_data: Dict[str, Any]) -> str:
        """生成 HTML 格式报告"""
        # 创建 Jinja2 环境
        env = Environment(loader=FileSystemLoader(str(self.templates_dir)))

        # 如果模板不存在，使用内置模板
        try:
            template = env.get_template("report.html")
        except:
            template = Template(self._get_default_html_template())

        # 生成图表数据
        chart_data = self._generate_chart_data(report_data)

        # 渲染模板
        html_content = template.render(data=report_data, charts=chart_data)

        # 保存 HTML 文件
        report_file = self.reports_dir / "html" / "index.html"
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(html_content)

        # 复制静态资源
        self._copy_static_assets()

        self.logger.info(f"HTML 报告生成: {report_file}")
        return str(report_file)

    def _generate_chart_data(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """生成图表数据"""
        summary = report_data["summary"]

        # 饼图数据 - 测试结果分布
        pie_data = {
            "labels": ["通过", "失败"],
            "datasets": [
                {
                    "data": [summary["passed_tests"], summary["failed_tests"]],
                    "backgroundColor": ["#4CAF50", "#F44336"],
                    "borderWidth": 1,
                }
            ],
        }

        # 柱状图数据 - 应用测试结果
        app_labels = list(report_data["results_by_app"].keys())
        app_passed = [
            report_data["results_by_app"][app]["passed"] for app in app_labels
        ]
        app_failed = [
            report_data["results_by_app"][app]["failed"] for app in app_labels
        ]

        bar_data = {
            "labels": app_labels,
            "datasets": [
                {"label": "通过", "data": app_passed, "backgroundColor": "#4CAF50"},
                {"label": "失败", "data": app_failed, "backgroundColor": "#F44336"},
            ],
        }

        # 时间线数据 - 测试执行时间
        timeline_data = []
        for task in report_data["all_tasks"]:
            if task["start_time"] and task["end_time"]:
                timeline_data.append(
                    {
                        "task": task["id"],
                        "start": task["start_time"],
                        "end": task["end_time"],
                        "duration": task["duration"],
                        "status": task["status"],
                    }
                )

        return {"pie": pie_data, "bar": bar_data, "timeline": timeline_data}

    def _get_default_html_template(self) -> str:
        """获取默认 HTML 模板"""
        return """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自动化测试报告</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .summary-card h3 { margin: 0 0 10px 0; color: #333; }
        .summary-card .value { font-size: 2em; font-weight: bold; color: #667eea; }
        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .chart-container { background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .chart-container h3 { margin-top: 0; }
        .failed-tests { background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; padding: 20px; }
        .failed-test { background: white; margin: 10px 0; padding: 15px; border-radius: 4px; border-left: 4px solid #f56565; }
        .test-list { margin-top: 30px; }
        .test-item { background: #f8f9fa; margin: 10px 0; padding: 15px; border-radius: 4px; border-left: 4px solid #48bb78; }
        .test-item.failed { border-left-color: #f56565; background: #fff5f5; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
        .status-passed { background: #c6f6d5; color: #22543d; }
        .status-failed { background: #fed7d7; color: #822727; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 自动化测试报告</h1>
            <p>生成时间: {{ data.summary.timestamp_str }}</p>
        </div>
        
        <div class="content">
            <!-- 概览 -->
            <div class="summary-grid">
                <div class="summary-card">
                    <h3>总测试数</h3>
                    <div class="value">{{ data.summary.total_tests }}</div>
                </div>
                <div class="summary-card">
                    <h3>通过测试</h3>
                    <div class="value" style="color: #48bb78;">{{ data.summary.passed_tests }}</div>
                </div>
                <div class="summary-card">
                    <h3>失败测试</h3>
                    <div class="value" style="color: #f56565;">{{ data.summary.failed_tests }}</div>
                </div>
                <div class="summary-card">
                    <h3>成功率</h3>
                    <div class="value">{{ "%.1f"|format(data.summary.success_rate) }}%</div>
                </div>
                <div class="summary-card">
                    <h3>总耗时</h3>
                    <div class="value">{{ "%.2f"|format(data.summary.total_duration) }}s</div>
                </div>
                <div class="summary-card">
                    <h3>平均耗时</h3>
                    <div class="value">{{ "%.2f"|format(data.summary.average_duration) }}s</div>
                </div>
            </div>
            
            <!-- 图表 -->
            <div class="charts-grid">
                <div class="chart-container">
                    <h3>测试结果分布</h3>
                    <canvas id="pieChart" width="400" height="300"></canvas>
                </div>
                <div class="chart-container">
                    <h3>各应用测试结果</h3>
                    <canvas id="barChart" width="400" height="300"></canvas>
                </div>
            </div>
            
            <!-- 失败的测试 -->
            {% if data.failed_tasks %}
            <div class="failed-tests">
                <h3>❌ 失败的测试 ({{ data.failed_tasks|length }})</h3>
                {% for task in data.failed_tasks %}
                <div class="failed-test">
                    <h4>{{ task.id }}</h4>
                    <p><strong>应用:</strong> {{ task.app or 'Unknown' }}</p>
                    <p><strong>套件:</strong> {{ task.suite }}</p>
                    <p><strong>错误:</strong> {{ task.error or '命令执行失败' }}</p>
                    {% if task.duration %}
                    <p><strong>耗时:</strong> {{ "%.2f"|format(task.duration) }}s</p>
                    {% endif %}
                </div>
                {% endfor %}
            </div>
            {% endif %}
            
            <!-- 所有测试 -->
            <div class="test-list">
                <h3>📋 所有测试详情</h3>
                {% for task in data.all_tasks %}
                <div class="test-item {{ 'failed' if not task.status == 'passed' else '' }}">
                    <h4>{{ task.id }}</h4>
                    <span class="status-badge {{ 'status-passed' if task.status == 'passed' else 'status-failed' }}">
                        {{ task.status.upper() }}
                    </span>
                    <p><strong>应用:</strong> {{ task.app or 'Unknown' }} | 
                       <strong>套件:</strong> {{ task.suite }} |
                       {% if task.duration %}
                       <strong>耗时:</strong> {{ "%.2f"|format(task.duration) }}s
                       {% endif %}
                    </p>
                    {% if task.error %}
                    <p><strong>错误:</strong> {{ task.error }}</p>
                    {% endif %}
                </div>
                {% endfor %}
            </div>
        </div>
        
        <div class="footer">
            <p>由 AI-Code Test Orchestrator 生成</p>
        </div>
    </div>
    
    <script>
        // 饼图
        const pieCtx = document.getElementById('pieChart').getContext('2d');
        new Chart(pieCtx, {
            type: 'pie',
            data: {{ charts.pie | tojson }},
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
        
        // 柱状图
        const barCtx = document.getElementById('barChart').getContext('2d');
        new Chart(barCtx, {
            type: 'bar',
            data: {{ charts.bar | tojson }},
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                },
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    </script>
</body>
</html>
        """

    async def _generate_allure_report(self, report_data: Dict[str, Any]) -> str:
        """生成 Allure 格式报告"""
        # 这里可以实现 Allure 报告生成逻辑
        # 目前先创建一个占位文件
        allure_dir = self.reports_dir / "allure"
        allure_dir.mkdir(exist_ok=True)

        placeholder_file = allure_dir / "placeholder.txt"
        with open(placeholder_file, "w") as f:
            f.write("Allure 报告功能待实现")

        return str(allure_dir)

    def _copy_static_assets(self):
        """复制静态资源文件"""
        # 这里可以复制 CSS、JS 等静态文件
        # 目前使用 CDN 资源，所以不需要复制
        pass
