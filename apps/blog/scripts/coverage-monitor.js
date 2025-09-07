#!/usr/bin/env node

/**
 * 测试覆盖率监控工具
 * 用于监控和分析测试覆盖率
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class CoverageMonitor {
    constructor() {
        this.coverageThresholds = {
            statements: 70,
            branches: 70,
            functions: 70,
            lines: 70
        };
    }

    /**
     * 运行覆盖率测试
     */
    async runCoverage() {
        console.log('📊 开始测试覆盖率分析...\n');

        try {
            // 运行覆盖率测试
            const output = execSync('npm run test:coverage', {
                encoding: 'utf8',
                stdio: 'pipe'
            });

            this.analyzeCoverage(output);
        } catch (error) {
            console.error('❌ 覆盖率测试失败:', error.message);
            if (error.stdout) {
                this.analyzeCoverage(error.stdout);
            }
        }
    }

    /**
     * 分析覆盖率输出
     */
    analyzeCoverage(output) {
        const lines = output.split('\n');
        let coverageData = {};
        let currentFile = null;

        for (const line of lines) {
            // 解析覆盖率数据
            if (line.includes('All files')) {
                const match = line.match(/All files\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)/);
                if (match) {
                    coverageData = {
                        statements: parseFloat(match[1]),
                        branches: parseFloat(match[2]),
                        functions: parseFloat(match[3]),
                        lines: parseFloat(match[4])
                    };
                }
            }

            // 解析文件覆盖率
            if (line.includes('src/') && line.includes('|')) {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length >= 5) {
                    const fileName = parts[0];
                    const fileCoverage = {
                        statements: parseFloat(parts[1]) || 0,
                        branches: parseFloat(parts[2]) || 0,
                        functions: parseFloat(parts[3]) || 0,
                        lines: parseFloat(parts[4]) || 0
                    };

                    if (!coverageData.files) {
                        coverageData.files = {};
                    }
                    coverageData.files[fileName] = fileCoverage;
                }
            }
        }

        this.generateCoverageReport(coverageData);
    }

    /**
     * 生成覆盖率报告
     */
    generateCoverageReport(data) {
        if (!data.statements) {
            console.log('⚠️  没有收集到覆盖率数据');
            return;
        }

        console.log('\n📈 测试覆盖率报告');
        console.log('='.repeat(50));
        console.log(`语句覆盖率: ${data.statements}%`);
        console.log(`分支覆盖率: ${data.branches}%`);
        console.log(`函数覆盖率: ${data.functions}%`);
        console.log(`行覆盖率: ${data.lines}%`);

        // 检查覆盖率阈值
        const issues = [];
        Object.entries(this.coverageThresholds).forEach(([metric, threshold]) => {
            const coverage = data[metric];
            if (coverage < threshold) {
                issues.push(`${metric}: ${coverage}% < ${threshold}%`);
            }
        });

        if (issues.length > 0) {
            console.log('\n⚠️  覆盖率未达到阈值:');
            issues.forEach(issue => console.log(`  • ${issue}`));
        } else {
            console.log('\n✅ 所有覆盖率指标都达到阈值');
        }

        // 分析文件覆盖率
        if (data.files) {
            const lowCoverageFiles = Object.entries(data.files)
                .filter(([file, coverage]) => coverage.lines < 50)
                .sort((a, b) => a[1].lines - b[1].lines);

            if (lowCoverageFiles.length > 0) {
                console.log('\n📋 低覆盖率文件 (<50%):');
                lowCoverageFiles.slice(0, 10).forEach(([file, coverage]) => {
                    console.log(`  • ${file}: ${coverage.lines}%`);
                });
            }

            const uncoveredFiles = Object.entries(data.files)
                .filter(([file, coverage]) => coverage.lines === 0);

            if (uncoveredFiles.length > 0) {
                console.log('\n❌ 未覆盖文件:');
                uncoveredFiles.forEach(([file]) => {
                    console.log(`  • ${file}`);
                });
            }
        }

        // 生成建议
        this.generateRecommendations(data);

        // 保存报告
        this.saveCoverageReport(data);
    }

    /**
     * 生成优化建议
     */
    generateRecommendations(data) {
        console.log('\n💡 覆盖率优化建议:');

        if (data.branches < this.coverageThresholds.branches) {
            console.log('  • 分支覆盖率较低，建议添加更多条件分支测试');
        }

        if (data.functions < this.coverageThresholds.functions) {
            console.log('  • 函数覆盖率较低，建议为未测试的函数添加测试');
        }

        if (data.statements < this.coverageThresholds.statements) {
            console.log('  • 语句覆盖率较低，建议检查未执行的代码路径');
        }

        // 文件级别建议
        if (data.files) {
            const criticalFiles = Object.entries(data.files)
                .filter(([file, coverage]) => coverage.lines < 30)
                .slice(0, 5);

            if (criticalFiles.length > 0) {
                console.log('  • 重点关注以下文件的测试覆盖:');
                criticalFiles.forEach(([file, coverage]) => {
                    console.log(`    - ${file}: ${coverage.lines}%`);
                });
            }
        }
    }

    /**
     * 保存覆盖率报告
     */
    saveCoverageReport(data) {
        const reportDir = path.join(__dirname, '../test-results');
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const reportPath = path.join(reportDir, 'coverage-report.json');
        const report = {
            ...data,
            thresholds: this.coverageThresholds,
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles: data.files ? Object.keys(data.files).length : 0,
                averageCoverage: data.lines || 0,
                meetsThresholds: Object.entries(this.coverageThresholds).every(([metric, threshold]) =>
                    data[metric] >= threshold
                )
            }
        };

        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 覆盖率报告已保存到: ${reportPath}`);
    }

    /**
     * 设置覆盖率阈值
     */
    setThresholds(thresholds) {
        this.coverageThresholds = { ...this.coverageThresholds, ...thresholds };
    }
}

// 运行覆盖率监控
if (require.main === module) {
    const monitor = new CoverageMonitor();
    monitor.runCoverage();
}

module.exports = CoverageMonitor;
