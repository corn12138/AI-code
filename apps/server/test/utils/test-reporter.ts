import * as fs from 'fs';
import * as path from 'path';

/**
 * 测试报告生成器
 * 用于生成 HTML 和 JSON 格式的测试报告
 */
export class TestReporter {
    private testResults: TestResult[] = [];
    private startTime: number = Date.now();
    private endTime: number = 0;

    /**
     * 添加测试结果
     */
    addTestResult(result: TestResult): void {
        this.testResults.push(result);
    }

    /**
     * 标记测试结束
     */
    markTestEnd(): void {
        this.endTime = Date.now();
    }

    /**
     * 生成测试统计信息
     */
    generateStats(): TestStats {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.status === 'passed').length;
        const failed = this.testResults.filter(r => r.status === 'failed').length;
        const skipped = this.testResults.filter(r => r.status === 'skipped').length;
        const duration = this.endTime - this.startTime;

        return {
            total,
            passed,
            failed,
            skipped,
            passRate: total > 0 ? (passed / total) * 100 : 0,
            duration,
            startTime: this.startTime,
            endTime: this.endTime,
        };
    }

    /**
     * 生成 JSON 报告
     */
    generateJsonReport(): TestReport {
        const stats = this.generateStats();

        return {
            summary: stats,
            tests: this.testResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                memory: process.memoryUsage(),
            },
            generatedAt: new Date().toISOString(),
        };
    }

    /**
     * 生成 HTML 报告
     */
    generateHtmlReport(): string {
        const report = this.generateJsonReport();
        const stats = report.summary;

        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试报告 - ${new Date().toLocaleDateString()}</title>
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
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            color: #666;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .total { color: #007bff; }
        .tests-section {
            padding: 30px;
        }
        .section-title {
            font-size: 1.5em;
            margin-bottom: 20px;
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 10px;
        }
        .test-item {
            display: flex;
            align-items: center;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 6px;
            border-left: 4px solid;
        }
        .test-item.passed {
            background: #f8fff9;
            border-left-color: #28a745;
        }
        .test-item.failed {
            background: #fff8f8;
            border-left-color: #dc3545;
        }
        .test-item.skipped {
            background: #fffdf7;
            border-left-color: #ffc107;
        }
        .test-status {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
        }
        .test-status.passed { background: #28a745; }
        .test-status.failed { background: #dc3545; }
        .test-status.skipped { background: #ffc107; }
        .test-info {
            flex: 1;
        }
        .test-name {
            font-weight: 600;
            margin-bottom: 5px;
        }
        .test-suite {
            color: #666;
            font-size: 0.9em;
        }
        .test-duration {
            color: #999;
            font-size: 0.8em;
            margin-left: auto;
        }
        .error-message {
            background: #f8f8f8;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
            color: #d73a49;
            white-space: pre-wrap;
        }
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #e9ecef;
            border-radius: 4px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
        .environment {
            background: #f8f9fa;
            padding: 20px;
            margin-top: 20px;
            border-radius: 6px;
        }
        .environment h3 {
            margin-top: 0;
            color: #495057;
        }
        .env-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            font-size: 0.9em;
        }
        .env-item {
            display: flex;
            justify-content: space-between;
        }
        .env-label {
            font-weight: 600;
            color: #495057;
        }
        .env-value {
            color: #6c757d;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>测试报告</h1>
            <p>生成时间: ${new Date(report.generatedAt).toLocaleString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number total">${stats.total}</div>
                <div class="stat-label">总测试数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number passed">${stats.passed}</div>
                <div class="stat-label">通过</div>
            </div>
            <div class="stat-card">
                <div class="stat-number failed">${stats.failed}</div>
                <div class="stat-label">失败</div>
            </div>
            <div class="stat-card">
                <div class="stat-number skipped">${stats.skipped}</div>
                <div class="stat-label">跳过</div>
            </div>
        </div>

        <div class="tests-section">
            <div class="section-title">
                测试通过率: ${stats.passRate.toFixed(1)}%
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${stats.passRate}%"></div>
            </div>

            <div class="section-title">测试结果详情</div>
            ${this.testResults.map(test => `
                <div class="test-item ${test.status}">
                    <div class="test-status ${test.status}">
                        ${test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : '○'}
                    </div>
                    <div class="test-info">
                        <div class="test-name">${test.name}</div>
                        <div class="test-suite">${test.suite}</div>
                        ${test.error ? `<div class="error-message">${test.error}</div>` : ''}
                    </div>
                    <div class="test-duration">${test.duration}ms</div>
                </div>
            `).join('')}

            <div class="environment">
                <h3>运行环境</h3>
                <div class="env-grid">
                    <div class="env-item">
                        <span class="env-label">Node.js 版本:</span>
                        <span class="env-value">${report.environment.nodeVersion}</span>
                    </div>
                    <div class="env-item">
                        <span class="env-label">平台:</span>
                        <span class="env-value">${report.environment.platform}</span>
                    </div>
                    <div class="env-item">
                        <span class="env-label">架构:</span>
                        <span class="env-value">${report.environment.arch}</span>
                    </div>
                    <div class="env-item">
                        <span class="env-label">内存使用:</span>
                        <span class="env-value">${(report.environment.memory.heapUsed / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div class="env-item">
                        <span class="env-label">测试耗时:</span>
                        <span class="env-value">${(stats.duration / 1000).toFixed(2)}s</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * 保存 JSON 报告到文件
     */
    async saveJsonReport(filePath: string): Promise<void> {
        const report = this.generateJsonReport();
        const dir = path.dirname(filePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    }

    /**
     * 保存 HTML 报告到文件
     */
    async saveHtmlReport(filePath: string): Promise<void> {
        const html = this.generateHtmlReport();
        const dir = path.dirname(filePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, html);
    }

    /**
     * 生成覆盖率报告摘要
     */
    generateCoverageSummary(coverageData: any): CoverageSummary {
        if (!coverageData) {
            return {
                statements: { total: 0, covered: 0, percentage: 0 },
                branches: { total: 0, covered: 0, percentage: 0 },
                functions: { total: 0, covered: 0, percentage: 0 },
                lines: { total: 0, covered: 0, percentage: 0 },
            };
        }

        const summary = coverageData.total || {};

        return {
            statements: {
                total: summary.statements?.total || 0,
                covered: summary.statements?.covered || 0,
                percentage: summary.statements?.pct || 0,
            },
            branches: {
                total: summary.branches?.total || 0,
                covered: summary.branches?.covered || 0,
                percentage: summary.branches?.pct || 0,
            },
            functions: {
                total: summary.functions?.total || 0,
                covered: summary.functions?.covered || 0,
                percentage: summary.functions?.pct || 0,
            },
            lines: {
                total: summary.lines?.total || 0,
                covered: summary.lines?.covered || 0,
                percentage: summary.lines?.pct || 0,
            },
        };
    }

    /**
     * 清空测试结果
     */
    clear(): void {
        this.testResults = [];
        this.startTime = Date.now();
        this.endTime = 0;
    }
}

// 类型定义
export interface TestResult {
    name: string;
    suite: string;
    status: 'passed' | 'failed' | 'skipped';
    duration: number;
    error?: string;
    startTime: number;
    endTime: number;
}

export interface TestStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    duration: number;
    startTime: number;
    endTime: number;
}

export interface TestReport {
    summary: TestStats;
    tests: TestResult[];
    environment: {
        nodeVersion: string;
        platform: string;
        arch: string;
        memory: NodeJS.MemoryUsage;
    };
    generatedAt: string;
}

export interface CoverageMetric {
    total: number;
    covered: number;
    percentage: number;
}

export interface CoverageSummary {
    statements: CoverageMetric;
    branches: CoverageMetric;
    functions: CoverageMetric;
    lines: CoverageMetric;
}

// 导出单例实例
export const testReporter = new TestReporter();