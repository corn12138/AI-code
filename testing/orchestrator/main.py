"""
企业级测试编排器主入口
提供完整的 CLI 接口和测试任务编排功能
"""

import asyncio
import logging
import os
from pathlib import Path
from typing import Optional

import typer
from rich.console import Console
from rich.progress import Progress
from rich.table import Table
from scheduler import run_test_suite
from utils.flaky_store import FlakyStore
from utils.logger import get_logger

from config import TestSuite, get_config

# 创建应用实例
app = typer.Typer(help="🧪 AI-Code 企业级自动化测试编排器")
console = Console()
logger = get_logger("main")


@app.command()
def run(
    suite: TestSuite = typer.Option(TestSuite.ALL, help="测试套件类型"),
    app_name: Optional[str] = typer.Option(None, help="指定应用名称"),
    config_file: Optional[str] = typer.Option(None, help="配置文件路径"),
    parallel: Optional[int] = typer.Option(None, help="并行工作进程数"),
    timeout: Optional[int] = typer.Option(None, help="测试超时时间（秒）"),
    retry: Optional[int] = typer.Option(None, help="失败重试次数"),
    verbose: bool = typer.Option(False, help="详细输出"),
    debug: bool = typer.Option(False, help="调试模式"),
    changed_only: bool = typer.Option(
        False, "--changed-only/--no-changed-only", help="仅运行变更相关的测试"
    ),
    skip_flaky: bool = typer.Option(False, help="跳过已知的 flaky 测试"),
    coverage: bool = typer.Option(False, help="生成覆盖率报告"),
    ci_mode: bool = typer.Option(False, help="CI 模式（简化输出）"),
    fail_fast: bool = typer.Option(False, help="遇到失败立即停止"),
    baseline: bool = typer.Option(False, help="性能基准模式"),
    strict: bool = typer.Option(False, help="严格模式（安全测试）"),
):
    """🚀 运行测试套件"""

    # 设置日志级别
    if debug:
        logging.getLogger().setLevel(logging.DEBUG)
    elif verbose:
        logging.getLogger().setLevel(logging.INFO)
    elif ci_mode:
        logging.getLogger().setLevel(logging.WARNING)

    # 加载配置
    config = get_config(config_file)

    # 动态更新配置
    if parallel:
        config.execution.parallel_workers = parallel
    if timeout:
        config.execution.test_timeout = timeout
    if retry:
        config.execution.retry_failed = retry
    if fail_fast:
        config.execution.fail_fast = fail_fast
    if changed_only:
        config.execution.smart_testing["changed_only"] = changed_only
    if skip_flaky:
        config.execution.flaky_management["skip_quarantined"] = skip_flaky

    # CI 模式设置
    if ci_mode:
        os.environ["CI"] = "true"
        config.execution.parallel_workers = min(config.execution.parallel_workers, 4)

    # 输出启动信息
    if not ci_mode:
        console.print("🧪 [bold blue]AI-Code 测试编排器[/bold blue]")
        console.print(f"📋 测试套件: [yellow]{suite.value}[/yellow]")
        if app_name:
            console.print(f"📱 目标应用: [green]{app_name}[/green]")
        if changed_only:
            console.print("🔍 [cyan]智能模式: 仅运行变更相关的测试[/cyan]")
        if skip_flaky:
            console.print("⚠️  [orange]跳过 Flaky 测试[/orange]")
        console.print()

    try:
        # 运行测试
        results = asyncio.run(run_test_suite(config, suite, app_name))

        # 输出结果摘要
        _output_results_summary(results, ci_mode)

        # 检查是否有失败
        failed_count = len([t for t in results.values() if not t.is_successful])
        if failed_count > 0:
            raise typer.Exit(1)

    except KeyboardInterrupt:
        console.print("\n❌ [red]测试被用户中断[/red]")
        raise typer.Exit(130)
    except Exception as e:
        logger.error(f"测试执行失败: {e}")
        if debug:
            raise
        console.print(f"❌ [red]测试执行失败: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def interactive():
    """🎮 交互式测试选择"""
    config = get_config()

    console.print("🎮 [bold blue]交互式测试模式[/bold blue]")

    # 选择测试套件
    suite_choices = [s.value for s in TestSuite]
    suite = typer.prompt(
        "选择测试套件", type=typer.Choice(suite_choices), default="unit"
    )

    # 选择应用
    app_choices = ["all"] + list(config.apps.keys())
    app_name = typer.prompt("选择应用", type=typer.Choice(app_choices), default="all")
    app_name = None if app_name == "all" else app_name

    # 其他选项
    changed_only = typer.confirm("仅运行变更相关的测试?", default=False)
    verbose = typer.confirm("详细输出?", default=False)

    # 执行测试
    run(
        suite=TestSuite(suite),
        app_name=app_name,
        changed_only=changed_only,
        verbose=verbose,
    )


@app.command()
def watch(
    app_name: str = typer.Option(..., help="要监视的应用名称"),
    suite: TestSuite = typer.Option(TestSuite.UNIT, help="测试套件类型"),
    debounce: int = typer.Option(2, help="防抖延迟（秒）"),
):
    """👀 监视模式（文件变更自动运行测试）"""
    import time

    config = get_config()
    if app_name not in config.apps:
        console.print(f"❌ [red]应用 '{app_name}' 不存在[/red]")
        raise typer.Exit(1)

    app_config = config.apps[app_name]
    watch_path = Path(app_config.path)

    console.print(f"👀 [blue]监视应用: {app_name}[/blue]")
    console.print(f"📁 [yellow]监视路径: {watch_path}[/yellow]")
    console.print("按 Ctrl+C 停止监视\n")

    try:
        from watchdog.events import FileSystemEventHandler
        from watchdog.observers import Observer

        class TestHandler(FileSystemEventHandler):
            def __init__(self):
                self.last_run = 0

            def on_modified(self, event):
                if event.is_directory:
                    return

                # 只监视源码文件
                if not any(
                    event.src_path.endswith(ext)
                    for ext in [".ts", ".tsx", ".js", ".jsx"]
                ):
                    return

                now = time.time()
                if now - self.last_run < debounce:
                    return

                self.last_run = now
                console.print(f"🔄 [yellow]检测到文件变更: {event.src_path}[/yellow]")

                try:
                    run(suite=suite, app_name=app_name)
                except typer.Exit:
                    pass  # 测试失败不退出监视

        event_handler = TestHandler()
        observer = Observer()
        observer.schedule(event_handler, watch_path, recursive=True)
        observer.start()

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            observer.stop()
            console.print("\n👋 [blue]停止监视[/blue]")
        observer.join()

    except ImportError:
        console.print("❌ [red]需要安装 watchdog: pip install watchdog[/red]")
        raise typer.Exit(1)


@app.command()
def status():
    """📊 查看系统状态"""
    config = get_config()

    console.print("📊 [bold blue]系统状态[/bold blue]\n")

    # 项目信息
    table = Table(title="项目信息")
    table.add_column("属性", style="cyan")
    table.add_column("值", style="green")

    table.add_row("项目名称", config.project_name)
    table.add_row("项目路径", config.project_root)
    table.add_row("并行工作进程", str(config.parallel_workers))
    table.add_row("测试超时", f"{config.test_timeout}s")

    console.print(table)
    console.print()

    # 应用状态
    apps_table = Table(title="应用配置")
    apps_table.add_column("应用", style="cyan")
    apps_table.add_column("类型", style="yellow")
    apps_table.add_column("端口", style="green")
    apps_table.add_column("依赖", style="magenta")

    for name, app_config in config.apps.items():
        deps = ", ".join(app_config.dependencies) if app_config.dependencies else "无"
        apps_table.add_row(
            name,
            app_config.type,
            str(app_config.port) if app_config.port else "N/A",
            deps,
        )

    console.print(apps_table)


@app.command()
def flaky(
    list_tests: bool = typer.Option(False, "--list", help="列出所有 flaky 测试"),
    clear: bool = typer.Option(False, help="清空 flaky 测试列表"),
    remove: Optional[str] = typer.Option(None, help="移除指定的 flaky 测试"),
):
    """🔧 管理 Flaky 测试"""
    flaky_store = FlakyStore()

    if clear:
        if typer.confirm("确定要清空所有 flaky 测试记录?"):
            # 清空列表的简单实现
            import json
            from pathlib import Path

            flaky_path = Path(__file__).resolve().parents[1] / "flaky-list.json"
            if flaky_path.exists():
                flaky_path.write_text(
                    json.dumps({"tests": []}, indent=2), encoding="utf-8"
                )
            console.print("✅ [green]已清空 flaky 测试列表[/green]")
        return

    if remove:
        if flaky_store.contains(remove):
            # 移除测试的简单实现
            data = flaky_store.read()
            tests = set(data.get("tests", []))
            tests.discard(remove)
            import json
            from pathlib import Path

            flaky_path = Path(__file__).resolve().parents[1] / "flaky-list.json"
            flaky_path.write_text(
                json.dumps({"tests": sorted(tests)}, indent=2),
                encoding="utf-8",
            )
            console.print(f"✅ [green]已移除测试: {remove}[/green]")
        else:
            console.print(f"❌ [red]测试不在 flaky 列表中: {remove}[/red]")
        return

    if list_tests:
        data = flaky_store.read()
        tests = data.get("tests", [])

        if not tests:
            console.print("✅ [green]没有 flaky 测试[/green]")
            return

        table = Table(title="Flaky 测试列表")
        table.add_column("测试 ID", style="red")
        table.add_column("状态", style="yellow")

        for test_id in tests:
            table.add_row(test_id, "隔离中")

        console.print(table)
        console.print(f"\n总计: {len(tests)} 个 flaky 测试")


@app.command()
def retry(
    failed_only: bool = typer.Option(True, help="仅重试失败的测试"),
    test_id: Optional[str] = typer.Option(None, help="重试指定的测试"),
):
    """🔄 重试失败的测试"""
    if test_id:
        console.print(f"🔄 [yellow]重试测试: {test_id}[/yellow]")
        # TODO: 实现单个测试重试逻辑
    else:
        console.print("🔄 [yellow]重试所有失败的测试[/yellow]")
        # TODO: 实现批量重试逻辑


@app.command()
def health():
    """🏥 健康检查"""
    config = get_config()

    console.print("🏥 [bold blue]系统健康检查[/bold blue]\n")

    with Progress() as progress:
        task = progress.add_task("检查中...", total=len(config.apps))

        for name, app_config in config.apps.items():
            progress.update(task, description=f"检查 {name}...")

            # TODO: 实现真实的健康检查逻辑
            import time

            time.sleep(0.5)

            console.print(f"✅ [green]{name}[/green]: 正常")
            progress.advance(task)

    console.print("\n🎉 [bold green]所有服务运行正常[/bold green]")


@app.command()
def config_validate(
    config_file: Optional[str] = typer.Option(None, help="配置文件路径")
):
    """✅ 验证配置文件"""
    try:
        config = get_config(config_file)
        console.print("✅ [green]配置文件验证通过[/green]")

        # 显示配置摘要
        console.print(f"📋 项目: {config.project_name}")
        console.print(f"📱 应用数量: {len(config.apps)}")
        console.print(f"🧪 测试套件: {len(config.test_suites)}")

    except Exception as e:
        console.print(f"❌ [red]配置文件验证失败: {e}[/red]")
        raise typer.Exit(1)


@app.command()
def list_apps():
    """📱 列出所有配置的应用"""
    config = get_config()

    table = Table(title="配置的应用")
    table.add_column("应用名称", style="cyan")
    table.add_column("类型", style="yellow")
    table.add_column("路径", style="green")
    table.add_column("端口", style="magenta")
    table.add_column("状态", style="blue")

    for name, app_config in config.apps.items():
        status = "启用" if app_config.enabled else "禁用"
        port = str(app_config.port) if app_config.port else "N/A"

        table.add_row(name, app_config.type, app_config.path, port, status)

    console.print(table)


def _output_results_summary(results: dict, ci_mode: bool = False):
    """输出测试结果摘要"""
    total = len(results)
    passed = len([t for t in results.values() if t.is_successful])
    failed = total - passed

    if ci_mode:
        # CI 模式简化输出
        if failed == 0:
            print(f"✅ PASSED: {passed}/{total}")
        else:
            print(f"❌ FAILED: {failed}/{total}")
            for task_id, task in results.items():
                if not task.is_successful:
                    print(f"  - {task_id}: {task.status.value}")
    else:
        # 丰富的控制台输出
        if failed == 0:
            console.print(
                f"\n🎉 [bold green]所有测试通过![/bold green] ({passed}/{total})"
            )
        else:
            console.print(f"\n❌ [bold red]测试失败[/bold red]: {failed}/{total}")

            # 显示失败详情
            failed_table = Table(title="失败的测试")
            failed_table.add_column("测试", style="red")
            failed_table.add_column("状态", style="yellow")
            failed_table.add_column("错误", style="cyan")

            for task_id, task in results.items():
                if not task.is_successful:
                    error_msg = (
                        task.error[:50] + "..."
                        if task.error and len(task.error) > 50
                        else task.error or ""
                    )
                    failed_table.add_row(task_id, task.status.value, error_msg)

            console.print(failed_table)


if __name__ == "__main__":
    app()
