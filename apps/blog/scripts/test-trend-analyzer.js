#!/usr/bin/env node

/**
 * 测试趋势分析工具
 * 用于分析测试覆盖率、性能和质量的长期趋势
 */

const fs = require('fs');
const path = require('path');

class TestTrendAnalyzer {
    constructor() {
        this.reportsDir = path.join(__dirname, '../test-results');
        this.historyFile = path.join(this.reportsDir, 'test-history.json');
        this.trends = {
            coverage: [],
            performance: [],
            quality: []
        };
    }

    /**
     * 分析测试趋势
     */
    async analyzeTrends() {
        console.log('📈 开始分析测试趋势...\n');

        try {
            // 加载历史数据
            this.loadHistory();

            // 分析覆盖率趋势
            this.analyzeCoverageTrend();

            // 分析性能趋势
            this.analyzePerformanceTrend();

            // 分析质量趋势
            this.analyzeQualityTrend();

            // 生成趋势报告
            this.generateTrendReport();

            // 生成建议
            this.generateRecommendations();

            console.log('✅ 测试趋势分析完成');
        } catch (error) {
            console.error('❌ 测试趋势分析失败:', error.message);
            throw error;
        }
    }

    /**
     * 加载历史数据
     */
    loadHistory() {
        if (fs.existsSync(this.historyFile)) {
            const historyData = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
            this.trends = historyData.trends || this.trends;
        }

        // 添加当前数据点
        this.addCurrentDataPoint();
    }

    /**
     * 添加当前数据点
     */
    addCurrentDataPoint() {
        const timestamp = new Date().toISOString();

        // 读取最新的测试报告
        const automatedReportPath = path.join(this.reportsDir, 'automated-test-report.json');
        const performanceReportPath = path.join(this.reportsDir, 'performance-report.json');
        const coverageReportPath = path.join(this.reportsDir, 'coverage-report.json');

        let currentData = {
            timestamp,
            coverage: { statements: 0, branches: 0, functions: 0, lines: 0 },
            performance: { totalTime: 0, averageTime: 0, slowTests: 0 },
            quality: { passRate: 0, totalTests: 0, failedTests: 0 }
        };

        // 读取自动化测试报告
        if (fs.existsSync(automatedReportPath)) {
            const report = JSON.parse(fs.readFileSync(automatedReportPath, 'utf8'));
            currentData.coverage = report.coverage;
            currentData.performance = report.performance;
            currentData.quality = {
                passRate: report.tests.total > 0 ? (report.tests.passed / report.tests.total) * 100 : 0,
                totalTests: report.tests.total,
                failedTests: report.tests.failed
            };
        }

        // 添加到趋势数据
        this.trends.coverage.push({
            timestamp,
            ...currentData.coverage
        });

        this.trends.performance.push({
            timestamp,
            ...currentData.performance
        });

        this.trends.quality.push({
            timestamp,
            ...currentData.quality
        });

        // 保存历史数据
        this.saveHistory();
    }

    /**
     * 保存历史数据
     */
    saveHistory() {
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }

        const historyData = {
            lastUpdated: new Date().toISOString(),
            trends: this.trends
        };

        fs.writeFileSync(this.historyFile, JSON.stringify(historyData, null, 2));
    }

    /**
     * 分析覆盖率趋势
     */
    analyzeCoverageTrend() {
        console.log('📊 分析覆盖率趋势...');

        if (this.trends.coverage.length < 2) {
            console.log('⚠️ 覆盖率数据不足，无法分析趋势');
            return;
        }

        const recent = this.trends.coverage.slice(-5); // 最近5个数据点
        const avgCoverage = recent.map(point =>
            (point.statements + point.branches + point.functions + point.lines) / 4
        );

        const trend = this.calculateTrend(avgCoverage);
        const currentAvg = avgCoverage[avgCoverage.length - 1];

        console.log(`当前平均覆盖率: ${currentAvg.toFixed(1)}%`);
        console.log(`趋势: ${trend > 0 ? '📈 上升' : trend < 0 ? '📉 下降' : '➡️ 稳定'}`);
    }

    /**
     * 分析性能趋势
     */
    analyzePerformanceTrend() {
        console.log('⚡ 分析性能趋势...');

        if (this.trends.performance.length < 2) {
            console.log('⚠️ 性能数据不足，无法分析趋势');
            return;
        }

        const recent = this.trends.performance.slice(-5);
        const totalTimes = recent.map(point => point.totalTime);
        const slowTests = recent.map(point => point.slowTests);

        const timeTrend = this.calculateTrend(totalTimes);
        const slowTestsTrend = this.calculateTrend(slowTests);

        const currentTime = totalTimes[totalTimes.length - 1];
        const currentSlowTests = slowTests[slowTests.length - 1];

        console.log(`当前总执行时间: ${currentTime}ms`);
        console.log(`当前慢速测试数: ${currentSlowTests}`);
        console.log(`执行时间趋势: ${timeTrend < 0 ? '📈 改善' : timeTrend > 0 ? '📉 恶化' : '➡️ 稳定'}`);
        console.log(`慢速测试趋势: ${slowTestsTrend < 0 ? '📈 改善' : slowTestsTrend > 0 ? '📉 恶化' : '➡️ 稳定'}`);
    }

    /**
     * 分析质量趋势
     */
    analyzeQualityTrend() {
        console.log('🎯 分析质量趋势...');

        if (this.trends.quality.length < 2) {
            console.log('⚠️ 质量数据不足，无法分析趋势');
            return;
        }

        const recent = this.trends.quality.slice(-5);
        const passRates = recent.map(point => point.passRate);
        const totalTests = recent.map(point => point.totalTests);

        const passRateTrend = this.calculateTrend(passRates);
        const testCountTrend = this.calculateTrend(totalTests);

        const currentPassRate = passRates[passRates.length - 1];
        const currentTotalTests = totalTests[totalTests.length - 1];

        console.log(`当前通过率: ${currentPassRate.toFixed(1)}%`);
        console.log(`当前总测试数: ${currentTotalTests}`);
        console.log(`通过率趋势: ${passRateTrend > 0 ? '📈 改善' : passRateTrend < 0 ? '📉 恶化' : '➡️ 稳定'}`);
        console.log(`测试数量趋势: ${testCountTrend > 0 ? '📈 增加' : testCountTrend < 0 ? '📉 减少' : '➡️ 稳定'}`);
    }

    /**
     * 计算趋势
     */
    calculateTrend(data) {
        if (data.length < 2) return 0;

        const n = data.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = data.reduce((sum, val) => sum + val, 0);
        const sumXY = data.reduce((sum, val, index) => sum + (index * val), 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    /**
     * 生成趋势报告
     */
    generateTrendReport() {
        console.log('📄 生成趋势报告...');

        const reportPath = path.join(this.reportsDir, 'trend-analysis-report.md');
        const report = this.generateMarkdownReport();

        fs.writeFileSync(reportPath, report);
        console.log(`📄 趋势报告已保存到: ${reportPath}`);
    }

    /**
     * 生成Markdown报告
     */
    generateMarkdownReport() {
        const now = new Date();
        const dataPoints = this.trends.coverage.length;

        return `# 测试趋势分析报告

## 分析概览
- **分析时间**: ${now.toLocaleString('zh-CN')}
- **数据点数量**: ${dataPoints}
- **分析周期**: 最近${Math.min(dataPoints, 30)}天

## 覆盖率趋势
${this.generateCoverageTrendSection()}

## 性能趋势
${this.generatePerformanceTrendSection()}

## 质量趋势
${this.generateQualityTrendSection()}

## 趋势总结
${this.generateTrendSummary()}

## 建议和行动项
${this.generateRecommendations()}

---
*报告生成时间: ${now.toLocaleString('zh-CN')}*
*数据来源: 自动化测试监控*
`;
    }

    /**
     * 生成覆盖率趋势部分
     */
    generateCoverageTrendSection() {
        if (this.trends.coverage.length < 2) {
            return '- 数据不足，无法分析趋势';
        }

        const recent = this.trends.coverage.slice(-5);
        const avgCoverage = recent.map(point =>
            (point.statements + point.branches + point.functions + point.lines) / 4
        );

        const trend = this.calculateTrend(avgCoverage);
        const current = avgCoverage[avgCoverage.length - 1];
        const previous = avgCoverage[0];
        const change = current - previous;

        return `
### 平均覆盖率
- **当前值**: ${current.toFixed(1)}%
- **变化**: ${change > 0 ? '+' : ''}${change.toFixed(1)}%
- **趋势**: ${trend > 0 ? '📈 上升' : trend < 0 ? '📉 下降' : '➡️ 稳定'}

### 各指标详情
- **语句覆盖率**: ${recent[recent.length - 1].statements.toFixed(1)}%
- **分支覆盖率**: ${recent[recent.length - 1].branches.toFixed(1)}%
- **函数覆盖率**: ${recent[recent.length - 1].functions.toFixed(1)}%
- **行覆盖率**: ${recent[recent.length - 1].lines.toFixed(1)}%
    `.trim();
    }

    /**
     * 生成性能趋势部分
     */
    generatePerformanceTrendSection() {
        if (this.trends.performance.length < 2) {
            return '- 数据不足，无法分析趋势';
        }

        const recent = this.trends.performance.slice(-5);
        const totalTimes = recent.map(point => point.totalTime);
        const slowTests = recent.map(point => point.slowTests);

        const timeTrend = this.calculateTrend(totalTimes);
        const slowTestsTrend = this.calculateTrend(slowTests);

        const currentTime = totalTimes[totalTimes.length - 1];
        const currentSlowTests = slowTests[slowTests.length - 1];

        return `
### 执行时间
- **当前值**: ${currentTime}ms
- **趋势**: ${timeTrend < 0 ? '📈 改善' : timeTrend > 0 ? '📉 恶化' : '➡️ 稳定'}

### 慢速测试
- **当前数量**: ${currentSlowTests}个
- **趋势**: ${slowTestsTrend < 0 ? '📈 改善' : slowTestsTrend > 0 ? '📉 恶化' : '➡️ 稳定'}

### 平均测试时间
- **当前值**: ${recent[recent.length - 1].averageTime.toFixed(2)}ms
    `.trim();
    }

    /**
     * 生成质量趋势部分
     */
    generateQualityTrendSection() {
        if (this.trends.quality.length < 2) {
            return '- 数据不足，无法分析趋势';
        }

        const recent = this.trends.quality.slice(-5);
        const passRates = recent.map(point => point.passRate);
        const totalTests = recent.map(point => point.totalTests);

        const passRateTrend = this.calculateTrend(passRates);
        const testCountTrend = this.calculateTrend(totalTests);

        const currentPassRate = passRates[passRates.length - 1];
        const currentTotalTests = totalTests[totalTests.length - 1];

        return `
### 测试通过率
- **当前值**: ${currentPassRate.toFixed(1)}%
- **趋势**: ${passRateTrend > 0 ? '📈 改善' : passRateTrend < 0 ? '📉 恶化' : '➡️ 稳定'}

### 测试数量
- **当前值**: ${currentTotalTests}个
- **趋势**: ${testCountTrend > 0 ? '📈 增加' : testCountTrend < 0 ? '📉 减少' : '➡️ 稳定'}

### 失败测试
- **当前值**: ${recent[recent.length - 1].failedTests}个
    `.trim();
    }

    /**
     * 生成趋势总结
     */
    generateTrendSummary() {
        const summaries = [];

        // 覆盖率总结
        if (this.trends.coverage.length >= 2) {
            const recent = this.trends.coverage.slice(-5);
            const avgCoverage = recent.map(point =>
                (point.statements + point.branches + point.functions + point.lines) / 4
            );
            const trend = this.calculateTrend(avgCoverage);

            if (trend > 0) {
                summaries.push('✅ 覆盖率呈上升趋势，测试覆盖在改善');
            } else if (trend < 0) {
                summaries.push('⚠️ 覆盖率呈下降趋势，需要关注测试覆盖');
            } else {
                summaries.push('➡️ 覆盖率保持稳定');
            }
        }

        // 性能总结
        if (this.trends.performance.length >= 2) {
            const recent = this.trends.performance.slice(-5);
            const totalTimes = recent.map(point => point.totalTime);
            const trend = this.calculateTrend(totalTimes);

            if (trend < 0) {
                summaries.push('✅ 测试性能在改善');
            } else if (trend > 0) {
                summaries.push('⚠️ 测试性能在恶化，需要优化');
            } else {
                summaries.push('➡️ 测试性能保持稳定');
            }
        }

        // 质量总结
        if (this.trends.quality.length >= 2) {
            const recent = this.trends.quality.slice(-5);
            const passRates = recent.map(point => point.passRate);
            const trend = this.calculateTrend(passRates);

            if (trend > 0) {
                summaries.push('✅ 测试质量在改善');
            } else if (trend < 0) {
                summaries.push('⚠️ 测试质量在下降，需要关注');
            } else {
                summaries.push('➡️ 测试质量保持稳定');
            }
        }

        return summaries.join('\n');
    }

    /**
     * 生成建议
     */
    generateRecommendations() {
        const recommendations = [];

        // 基于覆盖率趋势的建议
        if (this.trends.coverage.length >= 2) {
            const recent = this.trends.coverage.slice(-5);
            const avgCoverage = recent.map(point =>
                (point.statements + point.branches + point.functions + point.lines) / 4
            );
            const current = avgCoverage[avgCoverage.length - 1];

            if (current < 70) {
                recommendations.push('- 🎯 **立即行动**: 覆盖率低于70%，需要添加更多测试');
            } else if (current < 80) {
                recommendations.push('- 📈 **建议**: 覆盖率可以进一步提高到80%');
            }
        }

        // 基于性能趋势的建议
        if (this.trends.performance.length >= 2) {
            const recent = this.trends.performance.slice(-5);
            const totalTimes = recent.map(point => point.totalTime);
            const trend = this.calculateTrend(totalTimes);

            if (trend > 0) {
                recommendations.push('- ⚡ **优化**: 测试执行时间在增加，建议优化测试性能');
            }

            const currentSlowTests = recent[recent.length - 1].slowTests;
            if (currentSlowTests > 10) {
                recommendations.push('- 🐌 **优化**: 慢速测试数量较多，建议优化或拆分');
            }
        }

        // 基于质量趋势的建议
        if (this.trends.quality.length >= 2) {
            const recent = this.trends.quality.slice(-5);
            const passRates = recent.map(point => point.passRate);
            const current = passRates[passRates.length - 1];

            if (current < 80) {
                recommendations.push('- 🚨 **紧急**: 测试通过率较低，需要立即修复失败测试');
            } else if (current < 90) {
                recommendations.push('- 🔧 **修复**: 建议修复失败的测试以提高通过率');
            }
        }

        // 通用建议
        recommendations.push('- 📊 **监控**: 继续监控测试趋势，及时发现问题');
        recommendations.push('- 📚 **培训**: 定期进行测试培训，提高团队测试能力');
        recommendations.push('- 🔄 **改进**: 持续改进测试流程和工具');

        return recommendations.join('\n');
    }
}

// 运行趋势分析
if (require.main === module) {
    const analyzer = new TestTrendAnalyzer();

    analyzer.analyzeTrends()
        .then(() => {
            console.log('\n✅ 测试趋势分析完成');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ 测试趋势分析失败:', error.message);
            process.exit(1);
        });
}

module.exports = TestTrendAnalyzer;
