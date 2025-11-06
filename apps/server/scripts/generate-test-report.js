#!/usr/bin/env node

/**
 * 测试报告生成器
 * 基于最新的 Vitest 3.x 特性，生成详细的测试报告
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestReportGenerator {
  constructor() {
    this.reportDir = './test-results';
    this.coverageDir = './coverage';
    this.timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  }

  /**
   * 生成完整的测试报告
   */
  async generateFullReport() {
    console.log('📊 生成完整测试报告...');

    try {
      // 1. 运行测试并收集数据
      const testResults = await this.runTests();

      // 2. 生成覆盖率报告
      const coverageResults = await this.generateCoverageReport();

      // 3. 生成性能报告
      const performanceResults = await this.generatePerformanceReport();

      // 4. 生成综合报告
      const comprehensiveReport = this.generateComprehensiveReport({
        testResults,
        coverageResults,
        performanceResults,
      });

      // 5. 保存报告
      await this.saveReports(comprehensiveReport);

      console.log('✅ 测试报告生成完成');
      console.log(`📁 报告位置: ${this.reportDir}`);

    } catch (error) {
      console.error('❌ 生成测试报告时出错:', error);
      process.exit(1);
    }
  }

  /**
   * 运行测试并收集结果
   */
  async runTests() {
    console.log('🧪 运行测试...');

    try {
      // 运行所有测试
      execSync('pnpm test:run --reporter=json --reporter=html --reporter=junit', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      // 读取测试结果
      const jsonResults = this.readJsonFile('./test-results/results.json');
      const htmlResults = this.readFile('./test-results/results.html');
      const junitResults = this.readFile('./test-results/junit.xml');

      return {
        json: jsonResults,
        html: htmlResults,
        junit: junitResults,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.warn('⚠️ 运行测试时出错:', error.message);
      return null;
    }
  }

  /**
   * 生成覆盖率报告
   */
  async generateCoverageReport() {
    console.log('📈 生成覆盖率报告...');

    try {
      // 运行覆盖率测试
      execSync('pnpm test:coverage', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      // 读取覆盖率数据
      const coverageJson = this.readJsonFile('./coverage/coverage-summary.json');
      const coverageHtml = this.readFile('./coverage/index.html');
      const coverageLcov = this.readFile('./coverage/lcov.info');

      return {
        json: coverageJson,
        html: this.readFile('./coverage/index.html'),
        lcov: coverageLcov,
        summary: coverageJson,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.warn('⚠️ 生成覆盖率报告时出错:', error.message);
      return null;
    }
  }

  /**
   * 生成性能报告
   */
  async generatePerformanceReport() {
    console.log('⚡ 生成性能报告...');

    try {
      // 运行性能测试
      execSync('pnpm test:performance', {
        stdio: 'pipe',
        cwd: process.cwd(),
      });

      // 收集性能数据
      const performanceData = {
        timestamp: new Date().toISOString(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage(),
        uptime: process.uptime(),
      };

      return performanceData;

    } catch (error) {
      console.warn('⚠️ 生成性能报告时出错:', error.message);
      return null;
    }
  }

  /**
   * 生成综合报告
   */
  generateComprehensiveReport(data) {
    const { testResults, coverageResults, performanceResults } = data;

    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        generator: 'Vitest Test Report Generator',
        version: '3.x',
        environment: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
        },
      },
      summary: {
        tests: testResults?.json ? {
          total: testResults.json.numTotalTests || 0,
          passed: testResults.json.numPassedTests || 0,
          failed: testResults.json.numFailedTests || 0,
          skipped: testResults.json.numPendingTests || 0,
          successRate: testResults.json.numTotalTests > 0
            ? Math.round((testResults.json.numPassedTests / testResults.json.numTotalTests) * 100)
            : 0,
        } : null,
        coverage: coverageResults?.summary ? {
          statements: coverageResults.summary.statements?.pct || 0,
          branches: coverageResults.summary.branches?.pct || 0,
          functions: coverageResults.summary.functions?.pct || 0,
          lines: coverageResults.summary.lines?.pct || 0,
        } : null,
        performance: performanceResults ? {
          memoryUsage: {
            rss: Math.round(performanceResults.memoryUsage.rss / 1024 / 1024),
            heapTotal: Math.round(performanceResults.memoryUsage.heapTotal / 1024 / 1024),
            heapUsed: Math.round(performanceResults.memoryUsage.heapUsed / 1024 / 1024),
            external: Math.round(performanceResults.memoryUsage.external / 1024 / 1024),
          },
          uptime: performanceResults.uptime,
        } : null,
      },
      details: {
        testResults,
        coverageResults,
        performanceResults,
      },
    };

    return report;
  }

  /**
   * 保存报告文件
   */
  async saveReports(report) {
    console.log('💾 保存报告文件...');

    // 确保报告目录存在
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    // 保存综合报告
    const reportFile = path.join(this.reportDir, `comprehensive-report-${this.timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    // 生成 Markdown 报告
    const markdownReport = this.generateMarkdownReport(report);
    const markdownFile = path.join(this.reportDir, `test-report-${this.timestamp}.md`);
    fs.writeFileSync(markdownFile, markdownReport);

    // 生成 HTML 报告
    const htmlReport = this.generateHtmlReport(report);
    const htmlFile = path.join(this.reportDir, `test-report-${this.timestamp}.html`);
    fs.writeFileSync(htmlFile, htmlReport);

    console.log(`📄 报告文件已保存:`);
    console.log(`   JSON: ${reportFile}`);
    console.log(`   Markdown: ${markdownFile}`);
    console.log(`   HTML: ${htmlFile}`);
  }

  /**
   * 生成 Markdown 报告
   */
  generateMarkdownReport(report) {
    const { metadata, summary } = report;

    return `# 测试报告

## 基本信息
- **生成时间**: ${metadata.generatedAt}
- **Node.js 版本**: ${metadata.environment.node}
- **平台**: ${metadata.environment.platform} (${metadata.environment.arch})
- **生成器**: ${metadata.generator} v${metadata.version}

## 测试摘要
${summary.tests ? `
- **总测试数**: ${summary.tests.total}
- **通过**: ${summary.tests.passed} ✅
- **失败**: ${summary.tests.failed} ❌
- **跳过**: ${summary.tests.skipped} ⏭️
- **成功率**: ${summary.tests.successRate}%
` : '无测试数据'}

## 覆盖率摘要
${summary.coverage ? `
- **语句覆盖率**: ${summary.coverage.statements}%
- **分支覆盖率**: ${summary.coverage.branches}%
- **函数覆盖率**: ${summary.coverage.functions}%
- **行覆盖率**: ${summary.coverage.lines}%
` : '无覆盖率数据'}

## 性能摘要
${summary.performance ? `
- **内存使用**: ${summary.performance.memoryUsage.rss}MB RSS
- **堆内存**: ${summary.performance.memoryUsage.heapUsed}MB / ${summary.performance.memoryUsage.heapTotal}MB
- **运行时间**: ${Math.round(summary.performance.uptime)}s
` : '无性能数据'}

---
*报告由 Vitest Test Report Generator 自动生成*
`;
  }

  /**
   * 生成 HTML 报告
   */
  generateHtmlReport(report) {
    const { metadata, summary } = report;

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>测试报告 - ${metadata.generatedAt}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border-left: 4px solid #667eea; }
        .stat-value { font-size: 2em; font-weight: bold; color: #667eea; }
        .stat-label { color: #666; margin-top: 5px; }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 测试报告</h1>
            <p>生成时间: ${metadata.generatedAt}</p>
        </div>
        <div class="content">
            <div class="section">
                <h2>📊 测试摘要</h2>
                <div class="stats">
                    ${summary.tests ? `
                    <div class="stat-card">
                        <div class="stat-value">${summary.tests.total}</div>
                        <div class="stat-label">总测试数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value success">${summary.tests.passed}</div>
                        <div class="stat-label">通过</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value error">${summary.tests.failed}</div>
                        <div class="stat-label">失败</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value warning">${summary.tests.skipped}</div>
                        <div class="stat-label">跳过</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value info">${summary.tests.successRate}%</div>
                        <div class="stat-label">成功率</div>
                    </div>
                    ` : '<p>无测试数据</p>'}
                </div>
            </div>
            
            <div class="section">
                <h2>📈 覆盖率摘要</h2>
                <div class="stats">
                    ${summary.coverage ? `
                    <div class="stat-card">
                        <div class="stat-value">${summary.coverage.statements}%</div>
                        <div class="stat-label">语句覆盖率</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${summary.coverage.branches}%</div>
                        <div class="stat-label">分支覆盖率</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${summary.coverage.functions}%</div>
                        <div class="stat-label">函数覆盖率</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${summary.coverage.lines}%</div>
                        <div class="stat-label">行覆盖率</div>
                    </div>
                    ` : '<p>无覆盖率数据</p>'}
                </div>
            </div>
            
            <div class="section">
                <h2>⚡ 性能摘要</h2>
                ${summary.performance ? `
                <div class="stats">
                    <div class="stat-card">
                        <div class="stat-value">${summary.performance.memoryUsage.rss}MB</div>
                        <div class="stat-label">内存使用</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${summary.performance.memoryUsage.heapUsed}MB</div>
                        <div class="stat-label">堆内存使用</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Math.round(summary.performance.uptime)}s</div>
                        <div class="stat-label">运行时间</div>
                    </div>
                </div>
                ` : '<p>无性能数据</p>'}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * 读取 JSON 文件
   */
  readJsonFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (error) {
      console.warn(`⚠️ 读取文件失败: ${filePath}`, error.message);
    }
    return null;
  }

  /**
   * 读取文件
   */
  readFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8');
      }
    } catch (error) {
      console.warn(`⚠️ 读取文件失败: ${filePath}`, error.message);
    }
    return null;
  }
}

// 主函数
async function main() {
  const generator = new TestReportGenerator();
  await generator.generateFullReport();
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestReportGenerator;
