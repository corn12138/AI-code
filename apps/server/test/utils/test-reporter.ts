import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 测试报告生成器
 */
export class TestReporter {
    private results: TestResult[] = [];
    private startTime: number = Date.now();
    private endTime?: number;

    /**
     * 添加测试结果
     */
    addResult(result: TestResult): void {
        this.results.push({
            ...result,
            timestamp: Date.now(),
        });
    }

    /**
     * 标记测试结束
     */
    finish(): void {
        this.endTime = Date.now();
    }

    /**
     * 生成 HTML 报告
     */
    generateHtmlReport(outputPath: string = './test-results'): void {
        if (!existsSync(outputPath)) {
            mkdirSync(outputPath, { recursive: true });
        }

        const html = this.generateHtmlContent();
        const filePath = join(outputPath, 'test-report.html');

        writeFileSync(filePath, html, 'utf8');
        console.log(`📊 测试报告已生成: ${filePath}`);
    }

    /**
     * 生成 JSON 报告
     */
    generateJsonReport(outputPath: string = './test-results'): void {
        if (!existsSync(outputPath)) {
            mkdirSync(outputPath, { recursive: true });
        }

        const report = this.generateReportData();
        const filePath = join(outputPath, 'test-report.json');

        writeFileSync(filePath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`📊 JSON 报告已生成: ${filePath}`);
    }

    /**
     * 生成覆盖率报告
     */
    generateCoverageReport(): CoverageReport {
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.status === 'passed').length;
        const failedTests = this.results.filter(r => r.status === 'failed').length;
        const skippedTests = this.results.filter(r => r.status === 'skipped').length;

        return {
            total: totalTests,
            passed: passedTests,
            failed: failedTests,
            skipped: skippedTests,
            passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
            duration: this.endTime ? this.endTime - this.startTime : 0,
        };
    }

    /**
     * 生成性能报告
     */
    generatePerformanceReport(): PerformanceReport {
        const performanceTests = this.results.filter(r => r.type === 'performance');

        if (performanceTests.length === 0) {
            return {
                totalTests: 0,
                averageDuration: 0,
                minDuration: 0,
                maxDuration: 0,
                p95Duration: 0,
            };
        }

        const durations = performanceTests
            .map(r => r.duration || 0)
            .sort((a, b) => a - b);

        return {
            totalTests: performanceTests.length,
            averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
            minDuration: durations[0],
            maxDuration: durations[durations.length - 1],
            p95Duration: durations[Math.floor(durations.length * 0.95)],
        };
    }

    /**
     * 生成完整报告数据
     */
    private generateReportData(): TestReportData {
        const coverage = this.generateCoverageReport();
        const performance = this.generatePerformanceReport();

        const testsByType = this.groupTestsByType();
        const testsByStatus = this.groupTestsByStatus();

        return {
            summary: {
                startTime: this.startTime,
                endTime: this.endTime || Date.now(),
                duration: (this.endTime || Date.now()) - this.startTime,
                totalTests: this.results.length,
            },
            coverage,
            performance,
            testsByType,
            testsByStatus,
            results: this.results,
        };
    }

    /**
     * 按类型分组测试
     */
    private groupTestsByType(): Record<string, TestResult[]> {
        return this.results.reduce((groups, result) => {
            const type = result.type || 'unit';
            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(result);
            return groups;
        }, {} as Record<string, TestResult[]>);
    }

    /**
     * 按状态分组测试
     */
    private groupTestsByStatus(): Record<string, TestResult[]> {
        return this.results.reduce((groups, result) => {
            const status = result.status;
            if (!groups[status]) {
                groups[status] = [];
            }
            groups[status].push(result);
            return groups;
        }, {} as Record<string, TestResult[]>);
    }

    /**
     * 生成 HTML 内容
     */
    private generateHtmlContent(): string {
        const report = this.generateReportData();

        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试报告</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            margin: 0;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .duration { color: #17a2b8; }
        .content {
            padding: 30px;
        }
        .section {
            margin-bottom: 40px;
        }
        .section h2 {
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .test-list {
            background: #f8f9fa;
            border-radius: 8px;
            overflow: hidden;
        }
        .test-item {
            padding: 15px 20px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-item:last-child {
            border-bottom: none;
        }
        .test-name {
            font-weight: 500;
        }
        .test-status {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        .status-skipped {
            background: #fff3cd;
            color: #856404;
        }
        .performance-chart {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .chart-bar {
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 10px 0;
        }
        .chart-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 测试报告</h1>
            <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>总测试数</h3>
                <p class="value">${report.summary.totalTests}</p>
            </div>
            <div class="summary-card">
                <h3>通过</h3>
                <p class="value passed">${report.coverage.passed}</p>
            </div>
            <div class="summary-card">
                <h3>失败</h3>
                <p class="value failed">${report.coverage.failed}</p>
            </div>
            <div class="summary-card">
                <h3>跳过</h3>
                <p class="value skipped">${report.coverage.skipped}</p>
            </div>
            <div class="summary-card">
                <h3>通过率</h3>
                <p class="value passed">${report.coverage.passRate.toFixed(1)}%</p>
            </div>
            <div class="summary-card">
                <h3>执行时间</h3>
                <p class="value duration">${(report.summary.duration / 1000).toFixed(2)}s</p>
            </div>
        </div>

        <div class="content">
            <div class="section">
                <h2>📊 测试覆盖率</h2>
                <div class="performance-chart">
                    <div>通过率: ${report.coverage.passRate.toFixed(1)}%</div>
                    <div class="chart-bar">
                        <div class="chart-fill" style="width: ${report.coverage.passRate}%"></div>
                    </div>
                </div>
            </div>

            ${report.performance.totalTests > 0 ? `
            <div class="section">
                <h2>⚡ 性能测试</h2>
                <div class="performance-chart">
                    <p>平均响应时间: ${report.performance.averageDuration.toFixed(2)}ms</p>
                    <p>最小响应时间: ${report.performance.minDuration.toFixed(2)}ms</p>
                    <p>最大响应时间: ${report.performance.maxDuration.toFixed(2)}ms</p>
                    <p>P95 响应时间: ${report.performance.p95Duration.toFixed(2)}ms</p>
                </div>
            </div>
            ` : ''}

            <div class="section">
                <h2>📋 测试详情</h2>
                <div class="test-list">
                    ${report.results.map(result => `
                        <div class="test-item">
                            <div class="test-name">${result.name}</div>
                            <div class="test-status status-${result.status}">${result.status}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }
}

/**
 * 测试结果接口
 */
export interface TestResult {
    name: string;
    status: 'passed' | 'failed' | 'skipped';
    type?: 'unit' | 'integration' | 'e2e' | 'performance';
    duration?: number;
    error?: string;
    timestamp?: number;
}

/**
 * 覆盖率报告接口
 */
export interface CoverageReport {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    duration: number;
}

/**
 * 性能报告接口
 */
export interface PerformanceReport {
    totalTests: number;
    averageDuration: number;
    minDuration: number;
    maxDuration: number;
    p95Duration: number;
}

/**
 * 测试报告数据接口
 */
export interface TestReportData {
    summary: {
        startTime: number;
        endTime: number;
        duration: number;
        totalTests: number;
    };
    coverage: CoverageReport;
    performance: PerformanceReport;
    testsByType: Record<string, TestResult[]>;
    testsByStatus: Record<string, TestResult[]>;
    results: TestResult[];
}

/**
 * 全局测试报告实例
 */
export const globalTestReporter = new TestReporter();
