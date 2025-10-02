#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 综合测试运行脚本
 * 按照严格标准执行完整的测试流程
 */
class ComprehensiveTestRunner {
    constructor() {
        this.results = {
            unit: { passed: 0, failed: 0, duration: 0 },
            integration: { passed: 0, failed: 0, duration: 0 },
            e2e: { passed: 0, failed: 0, duration: 0 },
            performance: { passed: 0, failed: 0, duration: 0 },
            coverage: { lines: 0, functions: 0, branches: 0, statements: 0 },
        };

        this.startTime = Date.now();
    }

    /**
     * 运行所有测试
     */
    async runAll() {
        console.log('🚀 开始运行综合测试套件...\n');

        try {
            // 1. 环境检查
            await this.checkEnvironment();

            // 2. 单元测试
            await this.runUnitTests();

            // 3. 集成测试
            await this.runIntegrationTests();

            // 4. 端到端测试
            await this.runE2ETests();

            // 5. 性能测试
            await this.runPerformanceTests();

            // 6. 生成覆盖率报告
            await this.generateCoverageReport();

            // 7. 生成综合报告
            await this.generateComprehensiveReport();

            console.log('\n✅ 所有测试完成！');

        } catch (error) {
            console.error('\n❌ 测试执行失败:', error.message);
            process.exit(1);
        }
    }

    /**
     * 检查测试环境
     */
    async checkEnvironment() {
        console.log('🔍 检查测试环境...');

        // 检查 Node.js 版本
        const nodeVersion = process.version;
        console.log(`   Node.js 版本: ${nodeVersion}`);

        // 检查依赖
        try {
            execSync('npm list vitest --depth=0', { stdio: 'pipe' });
            console.log('   ✓ Vitest 已安装');
        } catch (error) {
            throw new Error('Vitest 未安装或版本不兼容');
        }

        // 检查数据库连接
        try {
            execSync('npm run test:db', { stdio: 'pipe' });
            console.log('   ✓ 数据库连接正常');
        } catch (error) {
            console.log('   ⚠️  数据库连接失败，将使用内存数据库');
        }

        console.log('   ✅ 环境检查完成\n');
    }

    /**
     * 运行单元测试
     */
    async runUnitTests() {
        console.log('🧪 运行单元测试...');

        try {
            const startTime = Date.now();
            const output = execSync('npm run test:unit', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            const duration = Date.now() - startTime;
            const results = this.parseTestOutput(output);

            this.results.unit = { ...results, duration };

            console.log(`   ✓ 单元测试完成 (${results.passed} 通过, ${results.failed} 失败, ${duration}ms)`);

            if (results.failed > 0) {
                console.log('   ⚠️  存在失败的单元测试');
            }

        } catch (error) {
            console.log('   ❌ 单元测试执行失败');
            this.results.unit.failed = 999;
        }

        console.log('');
    }

    /**
     * 运行集成测试
     */
    async runIntegrationTests() {
        console.log('🔗 运行集成测试...');

        try {
            const startTime = Date.now();
            const output = execSync('npm run test:integration', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            const duration = Date.now() - startTime;
            const results = this.parseTestOutput(output);

            this.results.integration = { ...results, duration };

            console.log(`   ✓ 集成测试完成 (${results.passed} 通过, ${results.failed} 失败, ${duration}ms)`);

        } catch (error) {
            console.log('   ❌ 集成测试执行失败');
            this.results.integration.failed = 999;
        }

        console.log('');
    }

    /**
     * 运行端到端测试
     */
    async runE2ETests() {
        console.log('🎯 运行端到端测试...');

        try {
            const startTime = Date.now();
            const output = execSync('npm run test:e2e', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            const duration = Date.now() - startTime;
            const results = this.parseTestOutput(output);

            this.results.e2e = { ...results, duration };

            console.log(`   ✓ 端到端测试完成 (${results.passed} 通过, ${results.failed} 失败, ${duration}ms)`);

        } catch (error) {
            console.log('   ❌ 端到端测试执行失败');
            this.results.e2e.failed = 999;
        }

        console.log('');
    }

    /**
     * 运行性能测试
     */
    async runPerformanceTests() {
        console.log('⚡ 运行性能测试...');

        try {
            const startTime = Date.now();
            const output = execSync('npm run test:performance', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            const duration = Date.now() - startTime;
            const results = this.parseTestOutput(output);

            this.results.performance = { ...results, duration };

            console.log(`   ✓ 性能测试完成 (${results.passed} 通过, ${results.failed} 失败, ${duration}ms)`);

        } catch (error) {
            console.log('   ❌ 性能测试执行失败');
            this.results.performance.failed = 999;
        }

        console.log('');
    }

    /**
     * 生成覆盖率报告
     */
    async generateCoverageReport() {
        console.log('📊 生成覆盖率报告...');

        try {
            const output = execSync('npm run test:coverage', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            const coverage = this.parseCoverageOutput(output);
            this.results.coverage = coverage;

            console.log(`   ✓ 覆盖率报告生成完成`);
            console.log(`   📈 代码覆盖率: ${coverage.lines}% 行, ${coverage.functions}% 函数, ${coverage.branches}% 分支`);

        } catch (error) {
            console.log('   ❌ 覆盖率报告生成失败');
        }

        console.log('');
    }

    /**
     * 生成综合报告
     */
    async generateComprehensiveReport() {
        console.log('📋 生成综合测试报告...');

        const totalDuration = Date.now() - this.startTime;
        const totalTests = Object.values(this.results).reduce((sum, result) => {
            return sum + (result.passed || 0) + (result.failed || 0);
        }, 0);

        const totalPassed = Object.values(this.results).reduce((sum, result) => {
            return sum + (result.passed || 0);
        }, 0);

        const totalFailed = Object.values(this.results).reduce((sum, result) => {
            return sum + (result.failed || 0);
        }, 0);

        const passRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(2) : '0.00';

        const report = {
            summary: {
                totalTests,
                totalPassed,
                totalFailed,
                passRate: parseFloat(passRate),
                totalDuration,
                timestamp: new Date().toISOString(),
            },
            details: this.results,
            recommendations: this.generateRecommendations(),
        };

        // 保存 JSON 报告
        const reportPath = path.join(__dirname, '../test-results');
        if (!fs.existsSync(reportPath)) {
            fs.mkdirSync(reportPath, { recursive: true });
        }

        fs.writeFileSync(
            path.join(reportPath, 'comprehensive-report.json'),
            JSON.stringify(report, null, 2)
        );

        // 生成 HTML 报告
        const htmlReport = this.generateHtmlReport(report);
        fs.writeFileSync(
            path.join(reportPath, 'comprehensive-report.html'),
            htmlReport
        );

        console.log('   ✓ 综合报告生成完成');
        console.log(`   📁 报告位置: ${reportPath}`);

        // 打印摘要
        this.printSummary(report);
    }

    /**
     * 解析测试输出
     */
    parseTestOutput(output) {
        // 简化的解析逻辑，实际应该根据 Vitest 的输出格式来解析
        const passedMatch = output.match(/(\d+) passed/);
        const failedMatch = output.match(/(\d+) failed/);

        return {
            passed: passedMatch ? parseInt(passedMatch[1]) : 0,
            failed: failedMatch ? parseInt(failedMatch[1]) : 0,
        };
    }

    /**
     * 解析覆盖率输出
     */
    parseCoverageOutput(output) {
        // 简化的解析逻辑
        const linesMatch = output.match(/Lines\s*:\s*(\d+\.?\d*)%/);
        const functionsMatch = output.match(/Functions\s*:\s*(\d+\.?\d*)%/);
        const branchesMatch = output.match(/Branches\s*:\s*(\d+\.?\d*)%/);
        const statementsMatch = output.match(/Statements\s*:\s*(\d+\.?\d*)%/);

        return {
            lines: linesMatch ? parseFloat(linesMatch[1]) : 0,
            functions: functionsMatch ? parseFloat(functionsMatch[1]) : 0,
            branches: branchesMatch ? parseFloat(branchesMatch[1]) : 0,
            statements: statementsMatch ? parseFloat(statementsMatch[1]) : 0,
        };
    }

    /**
     * 生成建议
     */
    generateRecommendations() {
        const recommendations = [];

        // 检查测试覆盖率
        if (this.results.coverage.lines < 80) {
            recommendations.push({
                type: 'coverage',
                priority: 'high',
                message: `代码行覆盖率 ${this.results.coverage.lines}% 低于推荐的 80%`,
                action: '增加单元测试以提高代码覆盖率',
            });
        }

        // 检查失败的测试
        const totalFailed = Object.values(this.results).reduce((sum, result) => {
            return sum + (result.failed || 0);
        }, 0);

        if (totalFailed > 0) {
            recommendations.push({
                type: 'failures',
                priority: 'critical',
                message: `存在 ${totalFailed} 个失败的测试`,
                action: '修复失败的测试用例',
            });
        }

        // 检查性能测试
        if (this.results.performance.duration > 30000) {
            recommendations.push({
                type: 'performance',
                priority: 'medium',
                message: '性能测试执行时间过长',
                action: '优化性能测试或减少测试数据量',
            });
        }

        return recommendations;
    }

    /**
     * 生成 HTML 报告
     */
    generateHtmlReport(report) {
        return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>综合测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .value { font-size: 2em; font-weight: bold; margin: 10px 0; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .recommendations { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; }
        .recommendation { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }
        .priority-critical { border-left: 4px solid #dc3545; }
        .priority-high { border-left: 4px solid #fd7e14; }
        .priority-medium { border-left: 4px solid #ffc107; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 综合测试报告</h1>
            <p>生成时间: ${new Date(report.summary.timestamp).toLocaleString('zh-CN')}</p>
        </div>
        
        <div class="summary">
            <div class="card">
                <h3>总测试数</h3>
                <div class="value">${report.summary.totalTests}</div>
            </div>
            <div class="card">
                <h3>通过</h3>
                <div class="value passed">${report.summary.totalPassed}</div>
            </div>
            <div class="card">
                <h3>失败</h3>
                <div class="value failed">${report.summary.totalFailed}</div>
            </div>
            <div class="card">
                <h3>通过率</h3>
                <div class="value passed">${report.summary.passRate}%</div>
            </div>
            <div class="card">
                <h3>执行时间</h3>
                <div class="value">${(report.summary.totalDuration / 1000).toFixed(2)}s</div>
            </div>
        </div>

        <div class="content">
            ${report.recommendations.length > 0 ? `
            <div class="section">
                <h2>📋 改进建议</h2>
                <div class="recommendations">
                    ${report.recommendations.map(rec => `
                        <div class="recommendation priority-${rec.priority}">
                            <strong>${rec.message}</strong><br>
                            <small>建议: ${rec.action}</small>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            <div class="section">
                <h2>📊 详细结果</h2>
                <pre>${JSON.stringify(report.details, null, 2)}</pre>
            </div>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * 打印摘要
     */
    printSummary(report) {
        console.log('\n' + '='.repeat(60));
        console.log('📊 测试执行摘要');
        console.log('='.repeat(60));
        console.log(`总测试数: ${report.summary.totalTests}`);
        console.log(`通过: ${report.summary.totalPassed} ✅`);
        console.log(`失败: ${report.summary.totalFailed} ${report.summary.totalFailed > 0 ? '❌' : '✅'}`);
        console.log(`通过率: ${report.summary.passRate}%`);
        console.log(`执行时间: ${(report.summary.totalDuration / 1000).toFixed(2)}s`);
        console.log(`代码覆盖率: ${this.results.coverage.lines}%`);

        if (report.recommendations.length > 0) {
            console.log('\n📋 改进建议:');
            report.recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
                console.log(`   建议: ${rec.action}`);
            });
        }

        console.log('='.repeat(60));

        // 根据结果设置退出码
        if (report.summary.totalFailed > 0) {
            console.log('❌ 测试执行完成，但存在失败的测试');
            process.exit(1);
        } else {
            console.log('✅ 所有测试通过！');
            process.exit(0);
        }
    }
}

// 运行测试
if (require.main === module) {
    const runner = new ComprehensiveTestRunner();
    runner.runAll().catch(error => {
        console.error('测试运行器执行失败:', error);
        process.exit(1);
    });
}

module.exports = ComprehensiveTestRunner;
