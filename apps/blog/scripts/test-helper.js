#!/usr/bin/env node

/**
 * 自定义测试辅助工具
 * 用于提高测试效率，减少重复工作
 */

const fs = require('fs');
const path = require('path');

class TestHelper {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcDir = path.join(this.projectRoot, 'src');
    this.testDir = path.join(this.projectRoot, 'src/components/__tests__');
  }

  /**
   * 生成测试文件模板
   */
  generateTestTemplate(componentName, options = {}) {
    const {
      includeAccessibility = true,
      includePerformance = true,
      includeIntegration = true,
      customProps = []
    } = options;

    const template = `import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ${componentName} from '../${componentName}'

describe('${componentName} 组件', () => {
  const defaultProps = {
    ${customProps.join(',\n    ')}
  }

  it('应该正确渲染组件', () => {
    render(<${componentName} {...defaultProps} />)
    expect(screen.getByTestId('${componentName.toLowerCase()}')).toBeInTheDocument()
  })

  it('应该应用正确的主题样式', () => {
    render(<${componentName} {...defaultProps} />)
    const container = screen.getByTestId('${componentName.toLowerCase()}')
    expect(container).toHaveClass('bg-space-900/40', 'backdrop-blur-xl')
  })

${includeAccessibility ? this.generateAccessibilityTests(componentName) : ''}

${includePerformance ? this.generatePerformanceTests(componentName) : ''}

${includeIntegration ? this.generateIntegrationTests(componentName) : ''}
})
`;

    return template;
  }

  /**
   * 生成可访问性测试
   */
  generateAccessibilityTests(componentName) {
    return `  describe('可访问性测试', () => {
    it('应该支持键盘导航', () => {
      render(<${componentName} {...defaultProps} />)
      const container = screen.getByTestId('${componentName.toLowerCase()}')
      expect(container).toHaveAttribute('tabindex', '0')
    })

    it('应该有适当的ARIA标签', () => {
      render(<${componentName} {...defaultProps} />)
      const container = screen.getByTestId('${componentName.toLowerCase()}')
      expect(container).toHaveAttribute('aria-label')
    })
  })`;
  }

  /**
   * 生成性能测试
   */
  generatePerformanceTests(componentName) {
    return `  describe('性能测试', () => {
    it('应该在合理时间内渲染', () => {
      const startTime = performance.now()
      render(<${componentName} {...defaultProps} />)
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('应该使用GPU加速', () => {
      render(<${componentName} {...defaultProps} />)
      const container = screen.getByTestId('${componentName.toLowerCase()}')
      expect(container).toHaveClass('transform-gpu')
    })
  })`;
  }

  /**
   * 生成集成测试
   */
  generateIntegrationTests(componentName) {
    return `  describe('集成测试', () => {
    it('应该与其他组件正确集成', () => {
      render(<${componentName} {...defaultProps} />)
      // 添加集成测试逻辑
    })

    it('应该正确处理用户交互', async () => {
      render(<${componentName} {...defaultProps} />)
      // 添加用户交互测试逻辑
    })
  })`;
  }

  /**
   * 创建测试文件
   */
  createTestFile(componentName, options = {}) {
    const testFileName = `${componentName}.test.tsx`;
    const testFilePath = path.join(this.testDir, testFileName);

    if (fs.existsSync(testFilePath)) {
      console.warn(`⚠️ 测试文件已存在: ${testFilePath}`);
      return false;
    }

    const template = this.generateTestTemplate(componentName, options);

    fs.writeFileSync(testFilePath, template);
    console.log(`✅ 测试文件已创建: ${testFilePath}`);
    return true;
  }

  /**
   * 生成Mock数据
   */
  generateMockData(type, options = {}) {
    const mockGenerators = {
      user: () => ({
        id: 'user-1',
        username: 'testuser',
        email: 'test@example.com',
        avatar: '/default-avatar.svg',
        bio: '这是测试用户的个人简介',
        roles: ['user']
      }),

      post: () => ({
        id: 'post-1',
        title: '测试文章标题',
        content: '这是测试文章的内容',
        authorId: 'user-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['测试', '示例'],
        status: 'published'
      }),

      comment: () => ({
        id: 'comment-1',
        content: '这是测试评论的内容',
        authorId: 'user-1',
        postId: 'post-1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),

      theme: () => ({
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#8B5CF6',
        background: '#0F172A',
        surface: '#1E293B',
        text: '#F8FAFC'
      })
    };

    const generator = mockGenerators[type];
    if (!generator) {
      throw new Error(`未知的Mock数据类型: ${type}`);
    }

    return generator();
  }

  /**
   * 生成测试数据文件
   */
  generateTestDataFile(dataTypes = ['user', 'post', 'comment']) {
    const testDataPath = path.join(this.srcDir, 'test', 'utils', 'test-data.ts');

    let content = `/**
 * 测试数据生成器
 * 自动生成的测试数据文件
 */

export const mockData = {
`;

    dataTypes.forEach(type => {
      const data = this.generateMockData(type);
      content += `  ${type}: ${JSON.stringify(data, null, 2)},\n`;
    });

    content += `};

export const createMock${dataTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join('')} = (overrides = {}) => ({
  ...mockData.${dataTypes[0]},
  ...overrides
});
`;

    // 确保目录存在
    const dir = path.dirname(testDataPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(testDataPath, content);
    console.log(`✅ 测试数据文件已创建: ${testDataPath}`);
    return testDataPath;
  }

  /**
   * 分析测试覆盖率
   */
  analyzeTestCoverage() {
    const coveragePath = path.join(this.projectRoot, 'coverage', 'coverage-summary.json');

    if (!fs.existsSync(coveragePath)) {
      console.warn('⚠️ 覆盖率报告不存在，请先运行测试');
      return null;
    }

    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));

    const analysis = {
      total: coverage.total,
      files: Object.keys(coverage).filter(key => key !== 'total'),
      lowCoverageFiles: [],
      uncoveredFiles: []
    };

    // 分析文件覆盖率
    analysis.files.forEach(file => {
      const fileCoverage = coverage[file];
      if (fileCoverage.lines.pct < 70) {
        analysis.lowCoverageFiles.push({
          file,
          coverage: fileCoverage.lines.pct
        });
      }
      if (fileCoverage.lines.pct === 0) {
        analysis.uncoveredFiles.push(file);
      }
    });

    return analysis;
  }

  /**
   * 生成测试建议
   */
  generateTestSuggestions() {
    const analysis = this.analyzeTestCoverage();
    if (!analysis) return [];

    const suggestions = [];

    // 基于覆盖率分析的建议
    if (analysis.lowCoverageFiles.length > 0) {
      suggestions.push({
        type: 'coverage',
        priority: 'high',
        message: `发现 ${analysis.lowCoverageFiles.length} 个低覆盖率文件`,
        files: analysis.lowCoverageFiles.slice(0, 5)
      });
    }

    if (analysis.uncoveredFiles.length > 0) {
      suggestions.push({
        type: 'uncovered',
        priority: 'critical',
        message: `发现 ${analysis.uncoveredFiles.length} 个未覆盖文件`,
        files: analysis.uncoveredFiles.slice(0, 5)
      });
    }

    // 基于项目结构的建议
    const components = this.findComponents();
    const untestedComponents = components.filter(comp => !this.hasTestFile(comp));

    if (untestedComponents.length > 0) {
      suggestions.push({
        type: 'missing-tests',
        priority: 'medium',
        message: `发现 ${untestedComponents.length} 个组件缺少测试`,
        files: untestedComponents.slice(0, 5)
      });
    }

    return suggestions;
  }

  /**
   * 查找组件文件
   */
  findComponents() {
    const components = [];

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
          const componentName = path.basename(file, '.tsx');
          components.push(componentName);
        }
      });
    };

    walkDir(this.srcDir);
    return components;
  }

  /**
   * 检查是否有测试文件
   */
  hasTestFile(componentName) {
    const testFile = path.join(this.testDir, `${componentName}.test.tsx`);
    return fs.existsSync(testFile);
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    const analysis = this.analyzeTestCoverage();
    const suggestions = this.generateTestSuggestions();

    const report = {
      timestamp: new Date().toISOString(),
      coverage: analysis,
      suggestions,
      summary: {
        totalFiles: analysis ? analysis.files.length : 0,
        lowCoverageFiles: analysis ? analysis.lowCoverageFiles.length : 0,
        uncoveredFiles: analysis ? analysis.uncoveredFiles.length : 0,
        suggestions: suggestions.length
      }
    };

    const reportPath = path.join(this.projectRoot, 'test-results', 'test-helper-report.json');

    // 确保目录存在
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`✅ 测试报告已生成: ${reportPath}`);

    return report;
  }

  /**
   * 批量创建测试文件
   */
  batchCreateTests(components, options = {}) {
    console.log(`🚀 开始批量创建测试文件...`);

    const results = {
      created: [],
      skipped: [],
      failed: []
    };

    components.forEach(component => {
      try {
        const success = this.createTestFile(component, options);
        if (success) {
          results.created.push(component);
        } else {
          results.skipped.push(component);
        }
      } catch (error) {
        console.error(`❌ 创建测试文件失败: ${component}`, error.message);
        results.failed.push(component);
      }
    });

    console.log(`\n📊 批量创建结果:`);
    console.log(`✅ 成功创建: ${results.created.length} 个`);
    console.log(`⏭️ 跳过: ${results.skipped.length} 个`);
    console.log(`❌ 失败: ${results.failed.length} 个`);

    return results;
  }
}

// 命令行接口
if (require.main === module) {
  const helper = new TestHelper();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'create-test':
      if (args.length === 0) {
        console.error('❌ 请指定组件名称');
        process.exit(1);
      }
      helper.createTestFile(args[0]);
      break;

    case 'generate-data':
      helper.generateTestDataFile(args);
      break;

    case 'analyze':
      const analysis = helper.analyzeTestCoverage();
      console.log('📊 测试覆盖率分析:', JSON.stringify(analysis, null, 2));
      break;

    case 'suggestions':
      const suggestions = helper.generateTestSuggestions();
      console.log('💡 测试建议:', JSON.stringify(suggestions, null, 2));
      break;

    case 'report':
      helper.generateTestReport();
      break;

    case 'batch-create':
      const components = helper.findComponents();
      const untestedComponents = components.filter(comp => !helper.hasTestFile(comp));
      helper.batchCreateTests(untestedComponents);
      break;

    default:
      console.log(`
🔧 测试辅助工具使用说明:

用法: node scripts/test-helper.js <command> [args]

命令:
  create-test <component>    创建单个组件的测试文件
  generate-data [types]      生成测试数据文件
  analyze                    分析测试覆盖率
  suggestions                生成测试建议
  report                     生成测试报告
  batch-create               批量创建缺失的测试文件

示例:
  node scripts/test-helper.js create-test ProfileClient
  node scripts/test-helper.js generate-data user post comment
  node scripts/test-helper.js batch-create
      `);
  }
}

module.exports = TestHelper;
