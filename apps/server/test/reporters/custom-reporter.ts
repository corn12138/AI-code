/**
 * 自定义测试报告器
 * 基于最新的 Vitest 3.x 特性，提供详细的测试报告
 */

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { File, Reporter, Task } from 'vitest';

export interface CustomReporterOptions {
    outputDir?: string;
    includeCoverage?: boolean;
    includePerformance?: boolean;
    includeTimeline?: boolean;
}

export class CustomReporter implements Reporter {
    private options: CustomReporterOptions;
    private startTime: number = 0;
    private endTime: number = 0;
    private testResults: any[] = [];
    private coverageData: any = null;
    private performanceData: any = {};

    constructor(options: CustomReporterOptions = {}) {
        this.options = {
            outputDir: './test-results',
            includeCoverage: true,
            includePerformance: true,
            includeTimeline: true,
            ...options,
        };
    }

    onInit() {
        console.log('🚀 自定义测试报告器初始化');
        this.startTime = Date.now();
    }

    onFinished(files: File[] = []) {
        this.endTime = Date.now();
        this.generateReport(files);
    }

    onTaskUpdate(packs: [string, Task[]][]) {
        // 收集测试结果
        packs.forEach(([projectName, tasks]) => {
            tasks.forEach(task => {
                if (task.type === 'test') {
                    this.testResults.push({
                        name: task.name,
                        file: task.file?.name,
                        project: projectName,
                        status: task.result?.state,
                        duration: task.result?.duration,
                        errors: task.result?.errors,
                    });
                }
            });
        });
    }

    private generateReport(files: File[]) {
        const reportData = this.collectReportData(files);
        this.writeJsonReport(reportData);
        this.writeHtmlReport(reportData);
        this.writeMarkdownReport(reportData);
        this.writePerformanceReport(reportData);
    }

    private collectReportData(files: File[]) {
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.status === 'pass').length;
        const failedTests = this.testResults.filter(t => t.status === 'fail').length;
        const skippedTests = this.testResults.filter(t => t.status === 'skip').length;
        const duration = this.endTime - this.startTime;

        return {
            summary: {
                totalTests,
                passedTests,
                failedTests,
                skippedTests,
                duration,
                successRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
            },
            testResults: this.testResults,
            files: files.map(file => ({
                name: file.name,
                tasks: file.tasks?.length || 0,
                duration: file.result?.duration || 0,
                status: file.result?.state,
            })),
            performance: this.performanceData,
            coverage: this.coverageData,
            timeline: this.generateTimeline(),
        };
    }

    private generateTimeline() {
        const timeline = [];
        let currentTime = this.startTime;

        this.testResults.forEach((test, index) => {
            timeline.push({
                time: currentTime,
                event: 'test_start',
                test: test.name,
                file: test.file,
            });

            if (test.duration) {
                currentTime += test.duration;
                timeline.push({
                    time: currentTime,
                    event: 'test_end',
                    test: test.name,
                    status: test.status,
                    duration: test.duration,
                });
            }
        });

        return timeline.sort((a, b) => a.time - b.time);
    }

    private writeJsonReport(data: any) {
        const outputPath = join(this.options.outputDir!, 'test-report.json');
        mkdirSync(this.options.outputDir!, { recursive: true });
        writeFileSync(outputPath, JSON.stringify(data, null, 2));
        console.log(`📊 JSON 报告已生成: ${outputPath}`);
    }

    private writeHtmlReport(data: any) {
        const htmlContent = this.generateHtmlContent(data);
        const outputPath = join(this.options.outputDir!, 'test-report.html');
        writeFileSync(outputPath, htmlContent);
        console.log(`🌐 HTML 报告已生成: ${outputPath}`);
    }

    private writeMarkdownReport(data: any) {
        const markdownContent = this.generateMarkdownContent(data);
        const outputPath = join(this.options.outputDir!, 'test-report.md');
        writeFileSync(outputPath, markdownContent);
        console.log(`📝 Markdown 报告已生成: ${outputPath}`);
    }

    private writePerformanceReport(data: any) {
        if (!this.options.includePerformance) return;

        const performanceContent = this.generatePerformanceContent(data);
        const outputPath = join(this.options.outputDir!, 'performance-report.json');
        writeFileSync(outputPath, JSON.stringify(performanceContent, null, 2));
        console.log(`⚡ 性能报告已生成: ${outputPath}`);
    }

    private generateHtmlContent(data: any): string {
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vitest 测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .header .subtitle { margin: 10px 0 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; background: #f8f9fa; }
        .summary-item { text-align: center; padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .summary-item h3 { margin: 0 0 10px 0; color: #666; font-size: 0.9em; text-transform: uppercase; letter-spacing: 1px; }
        .summary-item .value { font-size: 2.5em; font-weight: bold; margin: 0; }
        .summary-item.passed .value { color: #28a745; }
        .summary-item.failed .value { color: #dc3545; }
        .summary-item.skipped .value { color: #ffc107; }
        .summary-item.duration .value { color: #17a2b8; }
        .content { padding: 30px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-bottom: 2px solid #e9ecef; padding-bottom: 10px; margin-bottom: 20px; }
        .test-list { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .test-item { display: grid; grid-template-columns: 1fr auto auto; gap: 20px; padding: 15px 20px; border-bottom: 1px solid #e9ecef; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-item.passed { border-left: 4px solid #28a745; }
        .test-item.failed { border-left: 4px solid #dc3545; }
        .test-item.skipped { border-left: 4px solid #ffc107; }
        .test-name { font-weight: 500; }
        .test-status { padding: 4px 12px; border-radius: 20px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
        .test-status.passed { background: #d4edda; color: #155724; }
        .test-status.failed { background: #f8d7da; color: #721c24; }
        .test-status.skipped { background: #fff3cd; color: #856404; }
        .test-duration { color: #666; font-size: 0.9em; }
        .error-details { background: #f8f9fa; padding: 15px; margin-top: 10px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #dc3545; }
        .timeline { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .timeline-item { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
        .timeline-item:last-child { border-bottom: none; }
        .timeline-time { color: #666; font-size: 0.9em; margin-right: 15px; min-width: 100px; }
        .timeline-event { flex: 1; }
        .timeline-status { margin-left: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Vitest 测试报告</h1>
            <p class="subtitle">基于最新的 Vitest 3.x 特性</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <h3>总测试数</h3>
                <div class="value">${data.summary.totalTests}</div>
            </div>
            <div class="summary-item passed">
                <h3>通过</h3>
                <div class="value">${data.summary.passedTests}</div>
            </div>
            <div class="summary-item failed">
                <h3>失败</h3>
                <div class="value">${data.summary.failedTests}</div>
            </div>
            <div class="summary-item skipped">
                <h3>跳过</h3>
                <div class="value">${data.summary.skippedTests}</div>
            </div>
            <div class="summary-item duration">
                <h3>执行时间</h3>
                <div class="value">${Math.round(data.summary.duration)}ms</div>
            </div>
            <div class="summary-item">
                <h3>成功率</h3>
                <div class="value">${Math.round(data.summary.successRate)}%</div>
            </div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>📋 测试结果</h2>
                <div class="test-list">
                    ${data.testResults.map(test => `
                        <div class="test-item ${test.status}">
                            <div class="test-name">${test.name}</div>
                            <div class="test-status ${test.status}">${test.status}</div>
                            <div class="test-duration">${test.duration || 0}ms</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            ${this.options.includeTimeline ? `
            <div class="section">
                <h2>⏱️ 执行时间线</h2>
                <div class="timeline">
                    ${data.timeline.map(item => `
                        <div class="timeline-item">
                            <div class="timeline-time">${new Date(item.time).toLocaleTimeString()}</div>
                            <div class="timeline-event">${item.event}: ${item.test}</div>
                            <div class="timeline-status">${item.status || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    </div>
</body>
</html>`;
    }

    private generateMarkdownContent(data: any): string {
        return `# 🧪 Vitest 测试报告

## 📊 测试摘要

| 指标 | 值 |
|------|-----|
| 总测试数 | ${data.summary.totalTests} |
| 通过 | ${data.summary.passedTests} |
| 失败 | ${data.summary.failedTests} |
| 跳过 | ${data.summary.skippedTests} |
| 执行时间 | ${Math.round(data.summary.duration)}ms |
| 成功率 | ${Math.round(data.summary.successRate)}% |

## 📋 测试结果

${data.testResults.map(test => `
### ${test.name}
- **状态**: ${test.status}
- **文件**: ${test.file}
- **持续时间**: ${test.duration || 0}ms
- **项目**: ${test.project}
`).join('')}

## ⏱️ 执行时间线

${data.timeline.map(item => `
- **${new Date(item.time).toLocaleTimeString()}**: ${item.event} - ${item.test} ${item.status ? `(${item.status})` : ''}
`).join('')}

---
*报告生成时间: ${new Date().toLocaleString()}*
`;
    }

    private generatePerformanceContent(data: any): any {
        return {
            summary: {
                totalDuration: data.summary.duration,
                averageTestDuration: data.summary.duration / data.summary.totalTests,
                slowestTest: data.testResults.reduce((prev, current) =>
                    (current.duration > prev.duration) ? current : prev, { duration: 0 }),
                fastestTest: data.testResults.reduce((prev, current) =>
                    (current.duration < prev.duration) ? current : prev, { duration: Infinity }),
            },
            timeline: data.timeline,
            recommendations: this.generatePerformanceRecommendations(data),
        };
    }

    private generatePerformanceRecommendations(data: any): string[] {
        const recommendations = [];

        if (data.summary.duration > 30000) {
            recommendations.push('测试执行时间过长，建议优化测试性能');
        }

        if (data.summary.successRate < 80) {
            recommendations.push('测试成功率较低，建议检查失败的测试');
        }

        const slowTests = data.testResults.filter(t => t.duration > 1000);
        if (slowTests.length > 0) {
            recommendations.push(`发现 ${slowTests.length} 个慢测试，建议优化`);
        }

        return recommendations;
    }
}

export default CustomReporter;
