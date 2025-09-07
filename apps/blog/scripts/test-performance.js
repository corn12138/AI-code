#!/usr/bin/env node

/**
 * 测试性能监控脚本
 * 用于监控和分析测试执行性能
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestPerformanceAnalyzer {
    constructor() {
        this.results = [];
        this.startTime = Date.now();
    }

    /**
     * 运行测试并收集性能数据
     */
    async runTests() {
        console.log('🚀 开始测试性能分析...\n');

        try {
            // 运行测试并收集输出
            const output = execSync('npm run test:run -- --reporter=verbose', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            this.analyzeOutput(output);
            this.generateReport();
        } catch (error) {
            console.error('❌ 测试执行失败:', error.message);
            if (error.stdout) {
                this.analyzeOutput(error.stdout);
                this.generateReport();
            }
        }
    }

    /**
     * 分析测试输出
     */
    analyzeOutput(output) {
        const lines = output.split('\n');
        let currentTest = null;
        let testStartTime = null;

        for (const line of lines) {
            // 检测测试开始
            if (line.includes('✓') && line.includes('(') && line.includes(')')) {
                const match = line.match(/✓\s+(.+?)\s+\((\d+)\)/);
                if (match) {
                    currentTest = match[1];
                    testStartTime = Date.now();
                }
            }

            // 检测测试完成
            if (line.includes('ms') && currentTest) {
                const match = line.match(/(\d+)ms/);
                if (match) {
                    const duration = parseInt(match[1]);
                    this.results.push({
                        test: currentTest,
                        duration,
                        timestamp: testStartTime || Date.now()
                    });
                    currentTest = null;
                    testStartTime = null;
                }
            }
        }
    }

    /**
     * 生成性能报告
     */
    generateReport() {
        const totalDuration = Date.now() - this.startTime;
        const totalTests = this.results.length;

        if (totalTests === 0) {
            console.log('⚠️  没有收集到测试性能数据');
            return;
        }

        const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests;
        const slowestTest = this.results.reduce((slowest, current) =>
            current.duration > slowest.duration ? current : slowest
        );
        const fastestTest = this.results.reduce((fastest, current) =>
            current.duration < fastest.duration ? current : fastest
        );

        // 性能分类
        const fastTests = this.results.filter(r => r.duration < 100);
        const mediumTests = this.results.filter(r => r.duration >= 100 && r.duration < 500);
        const slowTests = this.results.filter(r => r.duration >= 500);

        console.log('\n📊 测试性能分析报告');
        console.log('='.repeat(60));
        console.log(`总测试数: ${totalTests}`);
        console.log(`总执行时间: ${totalDuration}ms`);
        console.log(`平均执行时间: ${averageDuration.toFixed(2)}ms`);
        console.log(`最快测试: ${fastestTest.test} (${fastestTest.duration}ms)`);
        console.log(`最慢测试: ${slowestTest.test} (${slowestTest.duration}ms)`);

        console.log('\n📈 性能分布:');
        console.log(`  快速测试 (<100ms): ${fastTests.length} (${(fastTests.length / totalTests * 100).toFixed(1)}%)`);
        console.log(`  中等测试 (100-500ms): ${mediumTests.length} (${(mediumTests.length / totalTests * 100).toFixed(1)}%)`);
        console.log(`  慢速测试 (>500ms): ${slowTests.length} (${(slowTests.length / totalTests * 100).toFixed(1)}%)`);

        // 性能建议
        console.log('\n💡 性能优化建议:');
        if (slowTests.length > 0) {
            console.log(`  • 有 ${slowTests.length} 个测试执行时间超过500ms，建议优化:`);
            slowTests.slice(0, 5).forEach(test => {
                console.log(`    - ${test.test}: ${test.duration}ms`);
            });
        }

        if (averageDuration > 200) {
            console.log('  • 平均测试时间较高，建议检查测试设置和mock数据');
        }

        if (fastTests.length / totalTests < 0.7) {
            console.log('  • 快速测试比例较低，建议优化测试逻辑');
        }

        // 保存报告
        this.saveReport({
            totalTests,
            totalDuration,
            averageDuration,
            fastestTest,
            slowestTest,
            performanceDistribution: {
                fast: fastTests.length,
                medium: mediumTests.length,
                slow: slowTests.length
            },
            timestamp: new Date().toISOString()
        });

        console.log('\n✅ 性能分析完成');
    }

    /**
     * 保存性能报告
     */
    saveReport(data) {
        const reportDir = path.join(__dirname, '../test-results');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, 'performance-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(data, null, 2));
        console.log(`📄 性能报告已保存到: ${reportPath}`);
    }
}

// 运行性能分析
if (require.main === module) {
    const analyzer = new TestPerformanceAnalyzer();
    analyzer.runTests();
}

module.exports = TestPerformanceAnalyzer;
