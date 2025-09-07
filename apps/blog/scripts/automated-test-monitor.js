#!/usr/bin/env node

/**
 * 自动化测试监控脚本
 * 用于监控测试执行状态、性能和覆盖率
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutomatedTestMonitor {
  constructor() {
    this.config = {
      testTimeout: 300000, // 5分钟
      coverageThreshold: 70,
      performanceThreshold: 5000, // 5秒
      maxRetries: 3,
      notificationEnabled: true
    };

    this.results = {
      timestamp: new Date().toISOString(),
      tests: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      },
      coverage: {
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0
      },
      performance: {
        totalTime: 0,
        averageTime: 0,
        slowTests: 0
      },
      status: 'unknown'
    };
  }

  /**
   * 运行完整的测试套件
   */
  async runFullTestSuite() {
    console.log('🚀 开始自动化测试监控...\n');

    try {
      // 运行测试并收集结果
      await this.runTests();

      // 分析覆盖率
      await this.analyzeCoverage();

      // 分析性能
      await this.analyzePerformance();

      // 生成报告
      this.generateReport();

      // 发送通知
      if (this.config.notificationEnabled) {
        await this.sendNotification();
      }

      return this.results;
    } catch (error) {
      console.error('❌ 自动化测试监控失败:', error.message);
      this.results.status = 'failed';
      throw error;
    }
  }

  /**
   * 运行测试
   */
  async runTests() {
    console.log('📋 执行测试套件...');

    try {
      const output = execSync('npm run test:coverage', {
        encoding: 'utf8',
        timeout: this.config.testTimeout
      });

      this.parseTestResults(output);
      console.log('✅ 测试执行完成');
    } catch (error) {
      console.error('❌ 测试执行失败:', error.message);
      this.results.status = 'failed';
      throw error;
    }
  }

  /**
   * 解析测试结果
   */
  parseTestResults(output) {
    const lines = output.split('\n');

    for (const line of lines) {
      // 解析测试统计
      if (line.includes('Test Files')) {
        const match = line.match(/(\d+) passed.*?(\d+) failed/);
        if (match) {
          this.results.tests.passed = parseInt(match[1]);
          this.results.tests.failed = parseInt(match[2]);
        }
      }

      // 解析覆盖率
      if (line.includes('All files')) {
        const match = line.match(/All files\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)\s+\|\s+(\d+(?:\.\d+)?)/);
        if (match) {
          this.results.coverage.statements = parseFloat(match[1]);
          this.results.coverage.branches = parseFloat(match[2]);
          this.results.coverage.functions = parseFloat(match[3]);
          this.results.coverage.lines = parseFloat(match[4]);
        }
      }
    }

    this.results.tests.total = this.results.tests.passed + this.results.tests.failed;
  }

  /**
   * 分析覆盖率
   */
  async analyzeCoverage() {
    console.log('📊 分析覆盖率...');

    const coverageReportPath = path.join(__dirname, '../coverage/coverage-summary.json');

    if (fs.existsSync(coverageReportPath)) {
      const coverageData = JSON.parse(fs.readFileSync(coverageReportPath, 'utf8'));

      // 检查覆盖率阈值
      const meetsThreshold = Object.values(coverageData.total).every(
        metric => metric.pct >= this.config.coverageThreshold
      );

      if (!meetsThreshold) {
        console.warn('⚠️ 覆盖率未达到阈值');
        this.results.status = 'warning';
      } else {
        console.log('✅ 覆盖率达标');
        this.results.status = 'success';
      }
    }
  }

  /**
   * 分析性能
   */
  async analyzePerformance() {
    console.log('⚡ 分析性能...');

    const performanceReportPath = path.join(__dirname, '../test-results/performance-report.json');

    if (fs.existsSync(performanceReportPath)) {
      const performanceData = JSON.parse(fs.readFileSync(performanceReportPath, 'utf8'));

      this.results.performance.totalTime = performanceData.totalDuration || 0;
      this.results.performance.averageTime = performanceData.averageDuration || 0;
      this.results.performance.slowTests = performanceData.performanceDistribution?.slow || 0;

      if (this.results.performance.totalTime > this.config.performanceThreshold) {
        console.warn('⚠️ 测试执行时间过长');
        if (this.results.status === 'success') {
          this.results.status = 'warning';
        }
      }
    }
  }

  /**
   * 生成报告
   */
  generateReport() {
    console.log('📄 生成测试报告...');

    const reportDir = path.join(__dirname, '../test-results');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, 'automated-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // 生成Markdown报告
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = path.join(reportDir, 'automated-test-report.md');
    fs.writeFileSync(markdownPath, markdownReport);

    console.log(`📄 报告已保存到: ${reportPath}`);
    console.log(`📄 Markdown报告已保存到: ${markdownPath}`);
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport() {
    const statusEmoji = {
      'success': '✅',
      'warning': '⚠️',
      'failed': '❌',
      'unknown': '❓'
    };

    return `# 自动化测试报告

## 执行时间
- **时间戳**: ${this.results.timestamp}
- **状态**: ${statusEmoji[this.results.status]} ${this.results.status.toUpperCase()}

## 测试结果
- **总测试数**: ${this.results.tests.total}
- **通过**: ${this.results.tests.passed} ✅
- **失败**: ${this.results.tests.failed} ❌
- **跳过**: ${this.results.tests.skipped} ⏭️
- **成功率**: ${this.results.tests.total > 0 ? ((this.results.tests.passed / this.results.tests.total) * 100).toFixed(1) : 0}%

## 覆盖率
- **语句覆盖率**: ${this.results.coverage.statements}%
- **分支覆盖率**: ${this.results.coverage.branches}%
- **函数覆盖率**: ${this.results.coverage.functions}%
- **行覆盖率**: ${this.results.coverage.lines}%

## 性能指标
- **总执行时间**: ${this.results.performance.totalTime}ms
- **平均测试时间**: ${this.results.performance.averageTime.toFixed(2)}ms
- **慢速测试数**: ${this.results.performance.slowTests}

## 质量评估
${this.generateQualityAssessment()}

---
*报告生成时间: ${new Date().toLocaleString('zh-CN')}*
`;
  }

  /**
   * 生成质量评估
   */
  generateQualityAssessment() {
    const assessments = [];

    // 测试通过率评估
    const passRate = this.results.tests.total > 0 ? (this.results.tests.passed / this.results.tests.total) * 100 : 0;
    if (passRate >= 90) {
      assessments.push('- ✅ 测试通过率优秀');
    } else if (passRate >= 80) {
      assessments.push('- ⚠️ 测试通过率良好，需要关注失败测试');
    } else {
      assessments.push('- ❌ 测试通过率较低，需要立即修复');
    }

    // 覆盖率评估
    const avgCoverage = (this.results.coverage.statements + this.results.coverage.branches +
      this.results.coverage.functions + this.results.coverage.lines) / 4;
    if (avgCoverage >= 80) {
      assessments.push('- ✅ 测试覆盖率优秀');
    } else if (avgCoverage >= 70) {
      assessments.push('- ⚠️ 测试覆盖率达标，建议提高');
    } else {
      assessments.push('- ❌ 测试覆盖率不达标，需要添加更多测试');
    }

    // 性能评估
    if (this.results.performance.totalTime <= this.config.performanceThreshold) {
      assessments.push('- ✅ 测试性能良好');
    } else {
      assessments.push('- ⚠️ 测试执行时间较长，建议优化');
    }

    return assessments.join('\n');
  }

  /**
   * 发送通知
   */
  async sendNotification() {
    console.log('📢 发送通知...');

    // 这里可以集成各种通知服务
    // 例如：Slack、Teams、邮件等

    const message = this.generateNotificationMessage();

    // 示例：控制台输出通知
    console.log('\n' + '='.repeat(50));
    console.log('📢 测试通知');
    console.log('='.repeat(50));
    console.log(message);
    console.log('='.repeat(50));

    // 在实际环境中，这里会调用相应的通知API
    // await this.sendSlackNotification(message);
    // await this.sendEmailNotification(message);
  }

  /**
   * 生成通知消息
   */
  generateNotificationMessage() {
    const statusEmoji = {
      'success': '✅',
      'warning': '⚠️',
      'failed': '❌',
      'unknown': '❓'
    };

    const passRate = this.results.tests.total > 0 ? (this.results.tests.passed / this.results.tests.total) * 100 : 0;

    return `
测试执行完成！

状态: ${statusEmoji[this.results.status]} ${this.results.status.toUpperCase()}
时间: ${new Date().toLocaleString('zh-CN')}

测试结果:
- 总测试数: ${this.results.tests.total}
- 通过: ${this.results.tests.passed}
- 失败: ${this.results.tests.failed}
- 通过率: ${passRate.toFixed(1)}%

覆盖率:
- 行覆盖率: ${this.results.coverage.lines}%

性能:
- 总执行时间: ${this.results.performance.totalTime}ms
- 慢速测试: ${this.results.performance.slowTests}个

${this.results.status === 'failed' ? '🚨 需要立即关注！' :
        this.results.status === 'warning' ? '⚠️ 需要关注' : '🎉 一切正常！'}
    `.trim();
  }

  /**
   * 设置配置
   */
  setConfig(config) {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取结果
   */
  getResults() {
    return this.results;
  }
}

// 运行监控
if (require.main === module) {
  const monitor = new AutomatedTestMonitor();

  // 设置配置
  monitor.setConfig({
    testTimeout: 300000,
    coverageThreshold: 70,
    performanceThreshold: 5000,
    notificationEnabled: true
  });

  monitor.runFullTestSuite()
    .then(results => {
      console.log('\n✅ 自动化测试监控完成');
      process.exit(results.status === 'failed' ? 1 : 0);
    })
    .catch(error => {
      console.error('\n❌ 自动化测试监控失败:', error.message);
      process.exit(1);
    });
}

module.exports = AutomatedTestMonitor;
