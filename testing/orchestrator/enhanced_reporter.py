#!/usr/bin/env python3
"""
AI-Code 企业级测试报告生成器
支持多格式、多维度、智能分析的测试报告系统
"""

import asyncio
import json
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List

try:
    import aiofiles
    import jinja2
    import matplotlib.pyplot as plt
    import pandas as pd
    import seaborn as sns
except ImportError:
    # 如果依赖不可用，使用模拟实现
    aiofiles = None
    jinja2 = None
    plt = None
    pd = None
    sns = None


@dataclass
class ReportConfig:
    """报告配置"""

    output_dir: str = "./testing/reports"
    formats: List[str] = None
    include_coverage: bool = True
    include_timeline: bool = True
    include_charts: bool = True
    include_metadata: bool = True
    template: str = "enterprise"

    def __post_init__(self):
        if self.formats is None:
            self.formats = ["html", "json", "junit"]


class TestReporter:
    """测试报告生成器"""

    def __init__(self):
        self.templates_dir = Path(__file__).parent / "templates"
        self.assets_dir = Path(__file__).parent / "assets"
        self.jinja_env = jinja2.Environment(
            loader=jinja2.FileSystemLoader(str(self.templates_dir)),
            autoescape=jinja2.select_autoescape(["html", "xml"]),
        )

    async def generate_reports(
        self, test_data: Dict[str, Any], config: Dict[str, Any]
    ) -> None:
        """生成测试报告"""
        report_config = ReportConfig(**config)

        # 确保输出目录存在
        output_dir = Path(report_config.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)

        # 生成各种格式的报告
        tasks = []

        if "html" in report_config.formats:
            tasks.append(self._generate_html_report(test_data, report_config))

        if "json" in report_config.formats:
            tasks.append(self._generate_json_report(test_data, report_config))

        if "junit" in report_config.formats:
            tasks.append(self._generate_junit_report(test_data, report_config))

        if "allure" in report_config.formats:
            tasks.append(self._generate_allure_report(test_data, report_config))

        # 并行生成报告
        await asyncio.gather(*tasks)

        print(f"📊 测试报告已生成到: {output_dir}")

    async def _generate_html_report(
        self, test_data: Dict[str, Any], config: ReportConfig
    ) -> None:
        """生成 HTML 报告"""
        try:
            # 准备数据
            report_data = self._prepare_html_data(test_data, config)

            # 渲染模板
            template = self.jinja_env.get_template("test_report.html")
            html_content = template.render(**report_data)

            # 保存文件
            output_path = Path(config.output_dir) / "html" / "test_report.html"
            output_path.parent.mkdir(parents=True, exist_ok=True)

            async with aiofiles.open(output_path, "w", encoding="utf-8") as f:
                await f.write(html_content)

            print(f"✅ HTML 报告已生成: {output_path}")

        except Exception as e:
            print(f"❌ HTML 报告生成失败: {e}")

    async def _generate_json_report(
        self, test_data: Dict[str, Any], config: ReportConfig
    ) -> None:
        """生成 JSON 报告"""
        try:
            # 增强数据
            enhanced_data = self._enhance_report_data(test_data)

            # 保存文件
            output_path = Path(config.output_dir) / "json" / "test_report.json"
            output_path.parent.mkdir(parents=True, exist_ok=True)

            async with aiofiles.open(output_path, "w", encoding="utf-8") as f:
                await f.write(json.dumps(enhanced_data, indent=2, ensure_ascii=False))

            print(f"✅ JSON 报告已生成: {output_path}")

        except Exception as e:
            print(f"❌ JSON 报告生成失败: {e}")

    async def _generate_junit_report(
        self, test_data: Dict[str, Any], config: ReportConfig
    ) -> None:
        """生成 JUnit XML 报告"""
        try:
            # 生成 JUnit XML
            junit_xml = self._generate_junit_xml(test_data)

            # 保存文件
            output_path = Path(config.output_dir) / "junit" / "test_report.xml"
            output_path.parent.mkdir(parents=True, exist_ok=True)

            async with aiofiles.open(output_path, "w", encoding="utf-8") as f:
                await f.write(junit_xml)

            print(f"✅ JUnit 报告已生成: {output_path}")

        except Exception as e:
            print(f"❌ JUnit 报告生成失败: {e}")

    async def _generate_allure_report(
        self, test_data: Dict[str, Any], config: ReportConfig
    ) -> None:
        """生成 Allure 报告"""
        try:
            # 生成 Allure 结果文件
            allure_dir = Path(config.output_dir) / "allure" / "results"
            allure_dir.mkdir(parents=True, exist_ok=True)

            # 为每个测试结果生成 Allure 文件
            for i, result in enumerate(test_data.get("results", [])):
                allure_data = self._convert_to_allure_format(result, i)

                allure_file = allure_dir / f"test_result_{i}.json"
                async with aiofiles.open(allure_file, "w", encoding="utf-8") as f:
                    await f.write(json.dumps(allure_data, ensure_ascii=False))

            print(f"✅ Allure 报告已生成: {allure_dir}")

        except Exception as e:
            print(f"❌ Allure 报告生成失败: {e}")

    def _prepare_html_data(
        self, test_data: Dict[str, Any], config: ReportConfig
    ) -> Dict[str, Any]:
        """准备 HTML 报告数据"""
        summary = test_data.get("summary", {})
        results = test_data.get("results", [])

        # 计算统计信息
        total_tests = summary.get("total_tests", 0)
        passed = summary.get("passed", 0)
        failed = summary.get("failed", 0)
        flaky = summary.get("flaky", 0)
        skipped = summary.get("skipped", 0)
        duration = summary.get("duration", 0)
        success_rate = summary.get("success_rate", 0)

        # 按应用分组结果
        app_results = {}
        for result in results:
            app_name = result.get("app_name", "unknown")
            if app_name not in app_results:
                app_results[app_name] = []
            app_results[app_name].append(result)

        # 按测试类型分组
        type_results = {}
        for result in results:
            test_type = result.get("test_type", "unknown")
            if test_type not in type_results:
                type_results[test_type] = []
            type_results[test_type].append(result)

        # 生成图表数据
        chart_data = self._generate_chart_data(test_data)

        return {
            "title": "AI-Code 测试报告",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "summary": {
                "total_tests": total_tests,
                "passed": passed,
                "failed": failed,
                "flaky": flaky,
                "skipped": skipped,
                "duration": f"{duration:.2f}s",
                "success_rate": f"{success_rate:.1f}%",
            },
            "app_results": app_results,
            "type_results": type_results,
            "chart_data": chart_data,
            "include_coverage": config.include_coverage,
            "include_timeline": config.include_timeline,
            "include_charts": config.include_charts,
        }

    def _generate_chart_data(self, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """生成图表数据"""
        results = test_data.get("results", [])

        # 按应用统计
        app_stats = {}
        for result in results:
            app_name = result.get("app_name", "unknown")
            status = result.get("status", "unknown")

            if app_name not in app_stats:
                app_stats[app_name] = {
                    "passed": 0,
                    "failed": 0,
                    "flaky": 0,
                    "skipped": 0,
                }

            if status == "passed":
                app_stats[app_name]["passed"] += 1
            elif status == "failed":
                app_stats[app_name]["failed"] += 1
            elif result.get("is_flaky", False):
                app_stats[app_name]["flaky"] += 1
            else:
                app_stats[app_name]["skipped"] += 1

        # 按时间统计
        time_stats = []
        for result in results:
            start_time = result.get("start_time")
            duration = result.get("duration", 0)
            if start_time:
                time_stats.append(
                    {
                        "time": start_time,
                        "duration": duration,
                        "status": result.get("status", "unknown"),
                    }
                )

        return {"app_stats": app_stats, "time_stats": time_stats}

    def _enhance_report_data(self, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """增强报告数据"""
        enhanced = test_data.copy()

        # 添加元数据
        enhanced["metadata"] = {
            "generated_at": datetime.now().isoformat(),
            "generator": "AI-Code Test Reporter",
            "version": "2.0.0",
            "environment": {"python_version": sys.version, "platform": sys.platform},
        }

        # 添加分析数据
        enhanced["analysis"] = self._analyze_test_results(test_data)

        return enhanced

    def _analyze_test_results(self, test_data: Dict[str, Any]) -> Dict[str, Any]:
        """分析测试结果"""
        results = test_data.get("results", [])
        # 获取测试摘要数据
        test_data.get("summary", {})

        analysis = {
            "performance": {
                "avg_duration": 0,
                "slowest_test": None,
                "fastest_test": None,
            },
            "reliability": {"flaky_rate": 0, "failure_rate": 0},
            "coverage": {"avg_coverage": 0, "coverage_distribution": {}},
        }

        if not results:
            return analysis

        # 性能分析
        durations = [r.get("duration", 0) for r in results if r.get("duration")]
        if durations:
            analysis["performance"]["avg_duration"] = sum(durations) / len(durations)
            analysis["performance"]["slowest_test"] = max(
                results, key=lambda x: x.get("duration", 0)
            )
            analysis["performance"]["fastest_test"] = min(
                results, key=lambda x: x.get("duration", 0)
            )

        # 可靠性分析
        total_tests = len(results)
        flaky_count = sum(1 for r in results if r.get("is_flaky", False))
        failed_count = sum(1 for r in results if r.get("status") == "failed")

        analysis["reliability"]["flaky_rate"] = (
            (flaky_count / total_tests * 100) if total_tests > 0 else 0
        )
        analysis["reliability"]["failure_rate"] = (
            (failed_count / total_tests * 100) if total_tests > 0 else 0
        )

        # 覆盖率分析
        coverages = [r.get("coverage", 0) for r in results if r.get("coverage")]
        if coverages:
            analysis["coverage"]["avg_coverage"] = sum(coverages) / len(coverages)

        return analysis

    def _generate_junit_xml(self, test_data: Dict[str, Any]) -> str:
        """生成 JUnit XML"""
        summary = test_data.get("summary", {})
        results = test_data.get("results", [])

        xml_parts = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            f'<testsuites name="AI-Code Tests" tests="{summary.get("total_tests", 0)}" '
            f'failures="{summary.get("failed", 0)}" skipped="{summary.get("skipped", 0)}" '
            f'time="{summary.get("duration", 0):.2f}">',
        ]

        # 按应用分组
        app_groups = {}
        for result in results:
            app_name = result.get("app_name", "unknown")
            if app_name not in app_groups:
                app_groups[app_name] = []
            app_groups[app_name].append(result)

        for app_name, app_results in app_groups.items():
            app_duration = sum(r.get("duration", 0) for r in app_results)
            app_failures = sum(1 for r in app_results if r.get("status") == "failed")
            app_skipped = sum(1 for r in app_results if r.get("status") == "skipped")

            xml_parts.append(
                f'<testsuite name="{app_name}" tests="{len(app_results)}" '
                f'failures="{app_failures}" skipped="{app_skipped}" time="{app_duration:.2f}">'
            )

            for result in app_results:
                test_name = result.get("test_id", "unknown")
                duration = result.get("duration", 0)
                status = result.get("status", "unknown")
                error_message = result.get("error_message", "")

                if status == "failed":
                    xml_parts.append(
                        f'<testcase name="{test_name}" time="{duration:.2f}">'
                    )
                    xml_parts.append(
                        f'<failure message="Test failed">{error_message}</failure>'
                    )
                    xml_parts.append("</testcase>")
                elif status == "skipped":
                    xml_parts.append(
                        f'<testcase name="{test_name}" time="{duration:.2f}">'
                    )
                    xml_parts.append("<skipped/>")
                    xml_parts.append("</testcase>")
                else:
                    xml_parts.append(
                        f'<testcase name="{test_name}" time="{duration:.2f}"/>'
                    )

            xml_parts.append("</testsuite>")

        xml_parts.append("</testsuites>")

        return "\n".join(xml_parts)

    def _convert_to_allure_format(
        self, result: Dict[str, Any], index: int
    ) -> Dict[str, Any]:
        """转换为 Allure 格式"""
        return {
            "uuid": f"test-{index}",
            "name": result.get("test_id", f"test_{index}"),
            "fullName": f"{result.get('app_name', 'unknown')}.{result.get('test_id', f'test_{index}')}",
            "status": result.get("status", "unknown"),
            "stage": "finished",
            "start": result.get("start_time", datetime.now().isoformat()),
            "stop": result.get("end_time", datetime.now().isoformat()),
            "duration": result.get("duration", 0) * 1000000000,  # 转换为纳秒
            "labels": [
                {"name": "suite", "value": result.get("app_name", "unknown")},
                {"name": "testClass", "value": result.get("test_type", "unknown")},
            ],
            "steps": [
                {
                    "name": "Test execution",
                    "status": result.get("status", "unknown"),
                    "stage": "finished",
                    "start": result.get("start_time", datetime.now().isoformat()),
                    "stop": result.get("end_time", datetime.now().isoformat()),
                    "duration": result.get("duration", 0) * 1000000000,
                }
            ],
        }


# 创建模板目录和文件
def create_templates():
    """创建报告模板"""
    templates_dir = Path(__file__).parent / "templates"
    templates_dir.mkdir(exist_ok=True)

    # HTML 模板
    html_template = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; border-radius: 8px; background: #f8f9fa; }
        .metric.passed { background: #d4edda; color: #155724; }
        .metric.failed { background: #f8d7da; color: #721c24; }
        .metric.flaky { background: #fff3cd; color: #856404; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { font-size: 0.9em; opacity: 0.8; }
        .results { padding: 30px; }
        .app-section { margin-bottom: 40px; }
        .app-title { font-size: 1.5em; font-weight: bold; margin-bottom: 20px; color: #333; }
        .test-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; }
        .test-card { padding: 15px; border: 1px solid #ddd; border-radius: 6px; background: #fafafa; }
        .test-card.passed { border-left: 4px solid #28a745; }
        .test-card.failed { border-left: 4px solid #dc3545; }
        .test-card.flaky { border-left: 4px solid #ffc107; }
        .test-name { font-weight: bold; margin-bottom: 5px; }
        .test-status { font-size: 0.9em; margin-bottom: 5px; }
        .test-duration { font-size: 0.8em; color: #666; }
        .charts { padding: 30px; }
        .chart-container { margin-bottom: 30px; }
        .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ title }}</h1>
            <p>生成时间: {{ timestamp }}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">{{ summary.total_tests }}</div>
                <div class="metric-label">总测试数</div>
            </div>
            <div class="metric passed">
                <div class="metric-value">{{ summary.passed }}</div>
                <div class="metric-label">通过</div>
            </div>
            <div class="metric failed">
                <div class="metric-value">{{ summary.failed }}</div>
                <div class="metric-label">失败</div>
            </div>
            <div class="metric flaky">
                <div class="metric-value">{{ summary.flaky }}</div>
                <div class="metric-label">不稳定</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ summary.duration }}</div>
                <div class="metric-label">执行时间</div>
            </div>
            <div class="metric">
                <div class="metric-value">{{ summary.success_rate }}</div>
                <div class="metric-label">成功率</div>
            </div>
        </div>
        
        <div class="results">
            {% for app_name, tests in app_results.items() %}
            <div class="app-section">
                <div class="app-title">{{ app_name }}</div>
                <div class="test-grid">
                    {% for test in tests %}
                    <div class="test-card {{ test.status }}">
                        <div class="test-name">{{ test.test_id }}</div>
                        <div class="test-status">状态: {{ test.status }}</div>
                        <div class="test-duration">耗时: {{ test.duration }}s</div>
                        {% if test.error_message %}
                        <div style="margin-top: 10px; font-size: 0.8em; color: #dc3545;">
                            {{ test.error_message }}
                        </div>
                        {% endif %}
                    </div>
                    {% endfor %}
                </div>
            </div>
            {% endfor %}
        </div>
        
        <div class="footer">
            <p>AI-Code 测试报告系统 v2.0.0</p>
        </div>
    </div>
</body>
</html>"""

    with open(templates_dir / "test_report.html", "w", encoding="utf-8") as f:
        f.write(html_template)


if __name__ == "__main__":
    # 创建模板文件
    create_templates()
    print("✅ 测试报告模板已创建")
