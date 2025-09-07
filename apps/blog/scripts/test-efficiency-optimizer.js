#!/usr/bin/env node

/**
 * 测试效率优化工具
 * 用于优化测试执行效率，减少重复工作
 */

const fs = require('fs');
const path = require('path');

class TestEfficiencyOptimizer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcDir = path.join(this.projectRoot, 'src');
    this.testDir = path.join(this.projectRoot, 'src/components/__tests__');
    this.config = {
      maxTestTime: 5000, // 5秒
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      parallelTests: 4,
      cacheEnabled: true
    };
  }

  /**
   * 分析测试性能
   */
  async analyzeTestPerformance() {
    console.log('⚡ 分析测试性能...');

    const performanceReportPath = path.join(this.projectRoot, 'test-results', 'performance-report.json');

    if (!fs.existsSync(performanceReportPath)) {
      console.warn('⚠️ 性能报告不存在，请先运行性能测试');
      return null;
    }

    const performanceData = JSON.parse(fs.readFileSync(performanceReportPath, 'utf8'));

    const analysis = {
      totalTests: performanceData.totalTests || 0,
      totalTime: performanceData.totalDuration || 0,
      averageTime: performanceData.averageDuration || 0,
      slowTests: performanceData.performanceDistribution?.slow || 0,
      mediumTests: performanceData.performanceDistribution?.medium || 0,
      fastTests: performanceData.performanceDistribution?.fast || 0,
      recommendations: []
    };

    // 生成优化建议
    if (analysis.slowTests > 0) {
      analysis.recommendations.push({
        type: 'slow-tests',
        priority: 'high',
        message: `发现 ${analysis.slowTests} 个慢速测试，建议优化`,
        action: '优化慢速测试或拆分复杂测试'
      });
    }

    if (analysis.averageTime > 200) {
      analysis.recommendations.push({
        type: 'high-average-time',
        priority: 'medium',
        message: `平均测试时间较高: ${analysis.averageTime.toFixed(2)}ms`,
        action: '检查测试设置和mock数据'
      });
    }

    if (analysis.fastTests / analysis.totalTests < 0.7) {
      analysis.recommendations.push({
        type: 'low-fast-tests',
        priority: 'medium',
        message: '快速测试比例较低，建议优化测试逻辑',
        action: '简化测试逻辑，减少不必要的操作'
      });
    }

    return analysis;
  }

  /**
   * 优化测试配置
   */
  optimizeTestConfig() {
    console.log('🔧 优化测试配置...');

    const vitestConfigPath = path.join(this.projectRoot, 'vitest.config.ts');

    if (!fs.existsSync(vitestConfigPath)) {
      console.warn('⚠️ vitest.config.ts 不存在');
      return false;
    }

    let configContent = fs.readFileSync(vitestConfigPath, 'utf8');

    // 优化配置项
    const optimizations = [
      {
        name: '启用并行执行',
        pattern: /pool:\s*['"]forks['"]/,
        replacement: 'pool: "forks",\n      poolOptions: {\n        forks: {\n          singleFork: true,\n        },\n      },'
      },
      {
        name: '设置最大并发数',
        pattern: /maxConcurrency:\s*\d+/,
        replacement: 'maxConcurrency: 4'
      },
      {
        name: '优化超时设置',
        pattern: /testTimeout:\s*\d+/,
        replacement: 'testTimeout: 10000'
      },
      {
        name: '启用缓存',
        pattern: /cache:\s*{[^}]*}/,
        replacement: 'cache: {\n        dir: ".vitest",\n      }'
      }
    ];

    let optimized = false;
    optimizations.forEach(opt => {
      if (!opt.pattern.test(configContent)) {
        configContent = configContent.replace(
          /test:\s*{/,
          `test: {\n        ${opt.replacement},`
        );
        console.log(`✅ ${opt.name}`);
        optimized = true;
      }
    });

    if (optimized) {
      fs.writeFileSync(vitestConfigPath, configContent);
      console.log('✅ 测试配置已优化');
      return true;
    } else {
      console.log('ℹ️ 测试配置已经是最优的');
      return false;
    }
  }

  /**
   * 优化测试文件
   */
  optimizeTestFiles() {
    console.log('📝 优化测试文件...');

    const testFiles = this.findTestFiles();
    let optimizedCount = 0;

    testFiles.forEach(testFile => {
      try {
        const content = fs.readFileSync(testFile, 'utf8');
        const optimizedContent = this.optimizeTestContent(content);

        if (content !== optimizedContent) {
          fs.writeFileSync(testFile, optimizedContent);
          console.log(`✅ 优化测试文件: ${path.basename(testFile)}`);
          optimizedCount++;
        }
      } catch (error) {
        console.error(`❌ 优化测试文件失败: ${testFile}`, error.message);
      }
    });

    console.log(`📊 优化完成: ${optimizedCount} 个文件`);
    return optimizedCount;
  }

  /**
   * 优化测试内容
   */
  optimizeTestContent(content) {
    let optimized = content;

    // 优化导入语句
    optimized = this.optimizeImports(optimized);

    // 优化测试结构
    optimized = this.optimizeTestStructure(optimized);

    // 优化断言
    optimized = this.optimizeAssertions(optimized);

    return optimized;
  }

  /**
   * 优化导入语句
   */
  optimizeImports(content) {
    // 合并重复的导入
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g;
    const imports = new Map();

    content.replace(importRegex, (match, importsList, module) => {
      if (!imports.has(module)) {
        imports.set(module, new Set());
      }
      importsList.split(',').forEach(imp => {
        imports.get(module).add(imp.trim());
      });
      return '';
    });

    // 重新生成导入语句
    let optimizedImports = '';
    imports.forEach((importsSet, module) => {
      optimizedImports += `import { ${Array.from(importsSet).join(', ')} } from '${module}';\n`;
    });

    return optimizedImports + content.replace(importRegex, '');
  }

  /**
   * 优化测试结构
   */
  optimizeTestStructure(content) {
    // 优化beforeEach和afterEach的使用
    let optimized = content;

    // 合并多个beforeEach
    const beforeEachRegex = /beforeEach\(\(\)\s*=>\s*{([^}]+)}\)/g;
    const beforeEachBlocks = [];

    optimized.replace(beforeEachRegex, (match, block) => {
      beforeEachBlocks.push(block.trim());
      return '';
    });

    if (beforeEachBlocks.length > 1) {
      const mergedBeforeEach = `beforeEach(() => {
    ${beforeEachBlocks.join('\n    ')}
  })`;
      optimized = optimized.replace(beforeEachRegex, mergedBeforeEach);
    }

    return optimized;
  }

  /**
   * 优化断言
   */
  optimizeAssertions(content) {
    let optimized = content;

    // 优化toBeInTheDocument断言
    optimized = optimized.replace(
      /expect\(([^)]+)\)\.toBeInTheDocument\(\)\s*\n\s*expect\(([^)]+)\)\.toBeInTheDocument\(\)/g,
      'expect($1).toBeInTheDocument()\n    expect($2).toBeInTheDocument()'
    );

    // 优化toHaveClass断言
    optimized = optimized.replace(
      /expect\(([^)]+)\)\.toHaveClass\(([^)]+)\)\s*\n\s*expect\(([^)]+)\)\.toHaveClass\(([^)]+)\)/g,
      'expect($1).toHaveClass($2)\n    expect($3).toHaveClass($4)'
    );

    return optimized;
  }

  /**
   * 查找测试文件
   */
  findTestFiles() {
    const testFiles = [];

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) {
          testFiles.push(filePath);
        }
      });
    };

    walkDir(this.srcDir);
    return testFiles;
  }

  /**
   * 生成测试缓存配置
   */
  generateCacheConfig() {
    const cacheConfig = {
      cache: {
        dir: '.vitest',
        include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
        exclude: ['node_modules', 'dist', 'coverage']
      },
      pool: 'forks',
      poolOptions: {
        forks: {
          singleFork: true
        }
      },
      maxConcurrency: 4,
      testTimeout: 10000,
      hookTimeout: 10000
    };

    const configPath = path.join(this.projectRoot, 'test-results', 'cache-config.json');

    // 确保目录存在
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(configPath, JSON.stringify(cacheConfig, null, 2));
    console.log(`✅ 缓存配置已生成: ${configPath}`);

    return cacheConfig;
  }

  /**
   * 清理测试缓存
   */
  cleanTestCache() {
    const cacheDir = path.join(this.projectRoot, '.vitest');
    const nodeModulesCache = path.join(this.projectRoot, 'node_modules', '.cache');

    const dirsToClean = [cacheDir, nodeModulesCache];

    dirsToClean.forEach(dir => {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.log(`🧹 已清理缓存: ${dir}`);
      }
    });
  }

  /**
   * 生成优化报告
   */
  generateOptimizationReport() {
    const performanceAnalysis = this.analyzeTestPerformance();
    const testFiles = this.findTestFiles();

    const report = {
      timestamp: new Date().toISOString(),
      performance: performanceAnalysis,
      testFiles: {
        total: testFiles.length,
        optimized: 0,
        needsOptimization: 0
      },
      recommendations: performanceAnalysis?.recommendations || [],
      summary: {
        totalTests: performanceAnalysis?.totalTests || 0,
        averageTime: performanceAnalysis?.averageTime || 0,
        slowTests: performanceAnalysis?.slowTests || 0,
        optimizationScore: this.calculateOptimizationScore(performanceAnalysis)
      }
    };

    const reportPath = path.join(this.projectRoot, 'test-results', 'efficiency-optimization-report.json');

    // 确保目录存在
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ 优化报告已生成: ${reportPath}`);

    return report;
  }

  /**
   * 计算优化分数
   */
  calculateOptimizationScore(analysis) {
    if (!analysis) return 0;

    let score = 100;

    // 根据慢速测试数量扣分
    if (analysis.slowTests > 0) {
      score -= analysis.slowTests * 5;
    }

    // 根据平均时间扣分
    if (analysis.averageTime > 200) {
      score -= Math.floor((analysis.averageTime - 200) / 10);
    }

    // 根据快速测试比例加分
    const fastTestRatio = analysis.fastTests / analysis.totalTests;
    if (fastTestRatio < 0.7) {
      score -= Math.floor((0.7 - fastTestRatio) * 50);
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 运行完整优化流程
   */
  async runFullOptimization() {
    console.log('🚀 开始测试效率优化...\n');

    try {
      // 分析性能
      const performanceAnalysis = await this.analyzeTestPerformance();

      // 优化配置
      this.optimizeTestConfig();

      // 优化测试文件
      this.optimizeTestFiles();

      // 生成缓存配置
      this.generateCacheConfig();

      // 生成优化报告
      const report = this.generateOptimizationReport();

      console.log('\n✅ 测试效率优化完成');
      console.log(`📊 优化分数: ${report.summary.optimizationScore}/100`);

      return report;
    } catch (error) {
      console.error('❌ 测试效率优化失败:', error.message);
      throw error;
    }
  }
}

// 命令行接口
if (require.main === module) {
  const optimizer = new TestEfficiencyOptimizer();
  const command = process.argv[2];

  switch (command) {
    case 'analyze':
      optimizer.analyzeTestPerformance()
        .then(analysis => {
          console.log('📊 性能分析结果:', JSON.stringify(analysis, null, 2));
        });
      break;

    case 'optimize-config':
      optimizer.optimizeTestConfig();
      break;

    case 'optimize-files':
      optimizer.optimizeTestFiles();
      break;

    case 'clean-cache':
      optimizer.cleanTestCache();
      break;

    case 'generate-cache-config':
      optimizer.generateCacheConfig();
      break;

    case 'report':
      optimizer.generateOptimizationReport();
      break;

    case 'full':
      optimizer.runFullOptimization();
      break;

    default:
      console.log(`
⚡ 测试效率优化工具使用说明:

用法: node scripts/test-efficiency-optimizer.js <command>

命令:
  analyze              分析测试性能
  optimize-config      优化测试配置
  optimize-files       优化测试文件
  clean-cache          清理测试缓存
  generate-cache-config 生成缓存配置
  report               生成优化报告
  full                 运行完整优化流程

示例:
  node scripts/test-efficiency-optimizer.js full
  node scripts/test-efficiency-optimizer.js analyze
      `);
  }
}

module.exports = TestEfficiencyOptimizer;
