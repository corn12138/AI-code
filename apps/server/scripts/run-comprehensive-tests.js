#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 综合测试运行器
 * 运行所有类型的测试并生成详细报告
 */
class ComprehensiveTestRunner {
    constructor() {
        this.results = {
            unit: null,
            integration: null,
            e2e: null,
            performance: null,
            coverage: null,
        };
        this.startTime = Date.now();
    }

    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🚀 开始运行综合测试套件...\n');

        try {
            // 1. 运行单元测试
            console.log('📋 运行单元测试...');
            await this.runUnitTests();

            // 2. 运行集成测试
            console.log('\n🔗 运行集成测试...');
            await this.runIntegrationTests();

            // 3. 运行端到端测试
            console.log('\n🌐 运行端到端测试...');
            await this.runE2ETests();

            // 4. 运行性能测试
            console.log('\n⚡ 运行性能测试...');
            await this.runPerformanceTests();

            // 5. 生成覆盖率报告
            console.log('\n📊 生成覆盖率报告...');
            await this.generateCoverageReport();

            // 6. 生成综合报告
            console.log('\n📄 生成综合测试报告...');
            await this.generateComprehensiveReport();

            console.log('\n✅ 所有测试完成！');
            this.printSummary();

        } catch (error) {
            console.error('\n❌ 测试运行失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 运行单元测试
     */
    async runUnitTests() {
        try {
            const result = await this.runCommand('npx vitest run src/**/*.spec.ts --reporter=json --outputFile=test-results/unit-tests.json');
            this.results.unit = {
                success: true,
                output: result,
                duration: this.getTestDuration('test-results/unit-tests.json'),
            };
            console.log('✅ 单元测试完成');
        } catch (error) {
            this.results.unit = {
                success: false,
                error: error.message,
                duration: 0,
            };
            console.log('❌ 单元测试失败');
        }
    }

    /**
     * 运行集成测试
     */
    async runIntegrationTests() {
        try {
            const result = await this.runCommand('npx vitest run test/integration/**/*.spec.ts --reporter=json --outputFile=test-results/integration-tests.json');
            this.results.integration = {
                success: true,
                output: result,
                duration: this.getTestDuration('test-results/integration-tests.json'),
            };
            console.log('✅ 集成测试完成');
        } catch (error) {
            this.results.integration = {
                success: false,
                error: error.message,
                duration: 0,
            };
            console.log('❌ 集成测试失败');
        }
    }

    /**
     * 运行端到端测试
     */
    async runE2ETests() {
        try {
            const result = await this.runCommand('npx vitest run test/e2e/**/*.spec.ts --reporter=json --outputFile=test-results/e2e-tests.json');
            this.results.e2e = {
                success: true,
                output: result,
                duration: this.getTestDuration('test-results/e2e-tests.json'),
            };
            console.log('✅ 端到端测试完成');
        } catch (error) {
            this.results.e2e = {
                success: false,
                error: error.message,
                duration: 0,
            };
            console.log('❌ 端到端测试失败');
        }
    }

    /**
     * 运行性能测试
     */
    async runPerformanceTests() {
        try {
            const result = await this.runCommand('npx vitest run test/performance/**/*.spec.ts --reporter=json --outputFile=test-results/performance-tests.json');
            this.results.performance = {
                success: true,
                output: result,
                duration: this.getTestDuration('test-results/performance-tests.json'),
            };
            console.log('✅ 性能测试完成');
        } catch (error) {
            this.results.performance = {
                success: false,
                error: error.message,
                duration: 0,
            };
            console.log('❌ 性能测试失败');
        }
    }

    /**
     * 生成覆盖率报告
     */
    async generateCoverageReport() {
        try {
            const result = await this.runCommand('npx vitest run --coverage --reporter=json --outputFile=test-results/coverage-tests.json');
            this.results.coverage = {
                success: true,
                output: result,
                duration: 0,
            };
            console.log('✅ 覆盖率报告生成完成');
        } catch (error) {
            this.results.coverage = {
                success: false,
                error: error.message,
                duration: 0,
            };
            console.log('❌ 覆盖率报告生成失败');
        }
    }

    /**
     * 生成综合报告
     */
    async generateComprehensiveReport() {
        const totalDuration = Date.now() - this.startTime;

        const report = {
            timestamp: new Date().toISOString(),
            totalDuration,
            results: this.results,
            summary: this.generateSummary(),
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                cwd: process.cwd(),
            },
        };

        // 确保目录存在
        const reportsDir = path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // 保存 JSON 报告
        const jsonReportPath = path.join(reportsDir, 'comprehensive-report.json');
        fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));

        // 生成 HTML 报告
        const htmlReport = this.generateHtmlReport(report);
        const htmlReportPath = path.join(reportsDir, 'comprehensive-report.html');
        fs.writeFileSync(htmlReportPath, htmlReport);

        console.log(`📄 综合报告已生成:`);
        console.log(`   JSON: ${jsonReportPath}`);
        console.log(`   HTML: ${htmlReportPath}`);
    }

    /**
     * 生成测试摘要
     */
    generateSummary() {
        const testTypes = ['unit', 'integration', 'e2e', 'performance'];
        let totalPassed = 0;
        let totalFailed = 0;
        let totalDuration = 0;

        testTypes.forEach(type => {
            const result = this.results[type];
            if (result && result.success) {
                const stats = this.getTestStats(`test-results/${type}-tests.json`);
                if (stats) {
                    totalPassed += stats.numPassedTests || 0;
                    totalFailed += stats.numFailedTests || 0;
                }
                totalDuration += result.duration || 0;
            }
        });

        return {
            totalTests: totalPassed + totalFailed,
            totalPassed,
            totalFailed,
            totalDuration,
            passRate: totalPassed + totalFailed > 0 ? (totalPassed / (totalPassed + totalFailed)) * 100 : 0,
            testTypes: testTypes.map(type => ({
                type,
                success: this.results[type]?.success || false,
                duration: this.results[type]?.duration || 0,
            })),
        };
    }

    /**
     * 生成 HTML 报告
     */
    generateHtmlReport(report) {
        const summary = report.summary;

        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>综合测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5em; font-weight: 300; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .total { color: #007bff; }
        .test-types { padding: 30px; }
        .test-type { display: flex; align-items: center; padding: 15px; margin-bottom: 10px; border-radius: 6px; }
        .test-type.success { background: #f8fff9; border-left: 4px solid #28a745; }
        .test-type.failed { background: #fff8f8; border-left: 4px solid #dc3545; }
        .status-icon { width: 20px; height: 20px; border-radius: 50%; margin-right: 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .status-icon.success { background: #28a745; }
        .status-icon.failed { background: #dc3545; }
        .test-info { flex: 1; }
        .test-name { font-weight: 600; margin-bottom: 5px; text-transform: capitalize; }
        .test-duration { color: #999; font-size: 0.9em; margin-left: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>综合测试报告</h1>
            <p>生成时间: ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number total">${summary.totalTests}</div>
                <div>总测试数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number passed">${summary.totalPassed}</div>
                <div>通过</div>
            </div>
            <div class="stat-card">
                <div class="stat-number failed">${summary.totalFailed}</div>
                <div>失败</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.passRate.toFixed(1)}%</div>
                <div>通过率</div>
            </div>
        </div>

        <div class="test-types">
            <h2>测试类型详情</h2>
            ${summary.testTypes.map(testType => `
                <div class="test-type ${testType.success ? 'success' : 'failed'}">
                    <div class="status-icon ${testType.success ? 'success' : 'failed'}">
                        ${testType.success ? '✓' : '✗'}
                    </div>
                    <div class="test-info">
                        <div class="test-name">${testType.type} 测试</div>
                        <div>状态: ${testType.success ? '成功' : '失败'}</div>
                    </div>
                    <div class="test-duration">${(testType.duration / 1000).toFixed(2)}s</div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * 运行命令
     */
    async runCommand(command) {
        return new Promise((resolve, reject) => {
            try {
                const result = execSync(command, {
                    encoding: 'utf8',
                    stdio: 'pipe',
                    maxBuffer: 1024 * 1024 * 10, // 10MB buffer
                });
                resolve(result);
            } catch (error) {
                // Vitest 可能会在有失败测试时返回非零退出码，但仍然生成报告
                if (error.stdout) {
                    resolve(error.stdout);
                } else {
                    reject(error);
                }
            }
        });
    }

    /**
     * 获取测试持续时间
     */
    getTestDuration(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return data.testResults?.reduce((total, result) => total + (result.perfStats?.runtime || 0), 0) || 0;
            }
        } catch (error) {
            console.warn(`无法读取测试结果文件: ${filePath}`);
        }
        return 0;
    }

    /**
     * 获取测试统计信息
     */
    getTestStats(filePath) {
        try {
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                return data;
            }
        } catch (error) {
            console.warn(`无法读取测试统计文件: ${filePath}`);
        }
        return null;
    }

    /**
     * 打印测试摘要
     */
    printSummary() {
        const summary = this.generateSummary();

        console.log('\n📊 测试摘要:');
        console.log('─'.repeat(50));
        console.log(`总测试数: ${summary.totalTests}`);
        console.log(`通过: ${summary.totalPassed}`);
        console.log(`失败: ${summary.totalFailed}`);
        console.log(`通过率: ${summary.passRate.toFixed(1)}%`);
        console.log(`总耗时: ${(summary.totalDuration / 1000).toFixed(2)}s`);
        console.log('─'.repeat(50));

        summary.testTypes.forEach(testType => {
            const status = testType.success ? '✅' : '❌';
            const duration = (testType.duration / 1000).toFixed(2);
            console.log(`${status} ${testType.type.padEnd(12)} ${duration}s`);
        });

        console.log('\n📄 详细报告已保存到 test-results/ 目录');
    }
}

// 运行测试
if (require.main === module) {
    const runner = new ComprehensiveTestRunner();
    runner.runAllTests().catch(error => {
        console.error('测试运行器出错:', error);
        process.exit(1);
    });
}

module.exports = ComprehensiveTestRunner;