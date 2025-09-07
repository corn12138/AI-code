#!/usr/bin/env node

/**
 * 后端测试辅助工具
 * 用于管理NestJS后端测试流程和工具
 */

const fs = require('fs');
const path = require('path');

class BackendTestHelper {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcDir = path.join(this.projectRoot, 'src');
    this.testDir = path.join(this.projectRoot, 'test');
    this.scriptsDir = path.join(this.projectRoot, 'scripts');
  }

  /**
   * 生成NestJS测试模板
   */
  generateNestJSTestTemplate(moduleName, options = {}) {
    const { type = 'service', includeController = false, includeE2E = false } = options;

    let template = `import { Test, TestingModule } from '@nestjs/testing';
import { ${moduleName}Service } from './${moduleName}.service';
${includeController ? `import { ${moduleName}Controller } from './${moduleName}.controller';` : ''}
import { getRepositoryToken } from '@nestjs/typeorm';
import { ${moduleName} } from './entities/${moduleName}.entity';

describe('${moduleName}Service', () => {
  let service: ${moduleName}Service;
  ${includeController ? `let controller: ${moduleName}Controller;` : ''}
  let mockRepository: any;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${moduleName}Service,
        {
          provide: getRepositoryToken(${moduleName}),
          useValue: mockRepository,
        },
      ],
      ${includeController ? `controllers: [${moduleName}Controller],` : ''}
    }).compile();

    service = module.get<${moduleName}Service>(${moduleName}Service);
    ${includeController ? `controller = module.get<${moduleName}Controller>(${moduleName}Controller);` : ''}
    mockRepository = module.get(getRepositoryToken(${moduleName}));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of ${moduleName}s', async () => {
      const result = [{ id: 1, name: 'Test ${moduleName}' }];
      mockRepository.find.mockResolvedValue(result);

      expect(await service.findAll()).toBe(result);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single ${moduleName}', async () => {
      const result = { id: 1, name: 'Test ${moduleName}' };
      mockRepository.findOne.mockResolvedValue(result);

      expect(await service.findOne(1)).toBe(result);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an error if ${moduleName} not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow('${moduleName} not found');
    });
  });

  describe('create', () => {
    it('should create a new ${moduleName}', async () => {
      const createDto = { name: 'New ${moduleName}' };
      const result = { id: 1, ...createDto };
      mockRepository.save.mockResolvedValue(result);

      expect(await service.create(createDto)).toBe(result);
      expect(mockRepository.save).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update an existing ${moduleName}', async () => {
      const updateDto = { name: 'Updated ${moduleName}' };
      const existing${moduleName} = { id: 1, name: 'Old ${moduleName}' };
      const result = { ...existing${moduleName}, ...updateDto };
      
      mockRepository.findOne.mockResolvedValue(existing${moduleName});
      mockRepository.save.mockResolvedValue(result);

      expect(await service.update(1, updateDto)).toBe(result);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith({ ...existing${moduleName}, ...updateDto });
    });

    it('should throw an error if ${moduleName} not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Updated' })).rejects.toThrow('${moduleName} not found');
    });
  });

  describe('remove', () => {
    it('should remove an existing ${moduleName}', async () => {
      const existing${moduleName} = { id: 1, name: 'Test ${moduleName}' };
      mockRepository.findOne.mockResolvedValue(existing${moduleName});
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw an error if ${moduleName} not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow('${moduleName} not found');
    });
  });
});
`;

    if (includeController) {
      template += `

describe('${moduleName}Controller', () => {
  let controller: ${moduleName}Controller;
  let service: ${moduleName}Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [${moduleName}Controller],
      providers: [
        {
          provide: ${moduleName}Service,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<${moduleName}Controller>(${moduleName}Controller);
    service = module.get<${moduleName}Service>(${moduleName}Service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a ${moduleName}', async () => {
      const createDto = { name: 'Test ${moduleName}' };
      const result = { id: 1, ...createDto };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of ${moduleName}s', async () => {
      const result = [{ id: 1, name: 'Test ${moduleName}' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single ${moduleName}', async () => {
      const result = { id: 1, name: 'Test ${moduleName}' };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne('1')).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a ${moduleName}', async () => {
      const updateDto = { name: 'Updated ${moduleName}' };
      const result = { id: 1, ...updateDto };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update('1', updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a ${moduleName}', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(undefined);

      await expect(controller.remove('1')).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
`;
    }

    if (includeE2E) {
      template += `

// E2E Tests
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('${moduleName} (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/${moduleName.toLowerCase()} (GET)', () => {
    return request(app.getHttpServer())
      .get('/${moduleName.toLowerCase()}')
      .expect(200);
  });

  it('/${moduleName.toLowerCase()}/1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/${moduleName.toLowerCase()}/1')
      .expect(200);
  });

  it('/${moduleName.toLowerCase()} (POST)', () => {
    return request(app.getHttpServer())
      .post('/${moduleName.toLowerCase()}')
      .send({ name: 'Test ${moduleName}' })
      .expect(201);
  });

  it('/${moduleName.toLowerCase()}/1 (PUT)', () => {
    return request(app.getHttpServer())
      .put('/${moduleName.toLowerCase()}/1')
      .send({ name: 'Updated ${moduleName}' })
      .expect(200);
  });

  it('/${moduleName.toLowerCase()}/1 (DELETE)', () => {
    return request(app.getHttpServer())
      .delete('/${moduleName.toLowerCase()}/1')
      .expect(200);
  });
});
`;
    }

    return template;
  }

  /**
   * 生成实体测试模板
   */
  generateEntityTestTemplate(entityName) {
    return `import { ${entityName} } from './${entityName}.entity';

describe('${entityName} Entity', () => {
  it('should create a ${entityName} instance', () => {
    const ${entityName.toLowerCase()} = new ${entityName}();
    expect(${entityName.toLowerCase()}).toBeInstanceOf(${entityName});
  });

  it('should have required properties', () => {
    const ${entityName.toLowerCase()} = new ${entityName}();
    ${entityName.toLowerCase()}.id = '1';
    ${entityName.toLowerCase()}.name = 'Test ${entityName}';
    ${entityName.toLowerCase()}.createdAt = new Date();
    ${entityName.toLowerCase()}.updatedAt = new Date();

    expect(${entityName.toLowerCase()}.id).toBe('1');
    expect(${entityName.toLowerCase()}.name).toBe('Test ${entityName}');
    expect(${entityName.toLowerCase()}.createdAt).toBeInstanceOf(Date);
    expect(${entityName.toLowerCase()}.updatedAt).toBeInstanceOf(Date);
  });

  it('should validate required fields', () => {
    const ${entityName.toLowerCase()} = new ${entityName}();
    
    // 这里可以添加验证逻辑
    expect(${entityName.toLowerCase()}).toBeDefined();
  });
});
`;
  }

  /**
   * 生成DTO测试模板
   */
  generateDTOTestTemplate(dtoName) {
    return `import { ${dtoName} } from './dto/${dtoName}.dto';
import { validate } from 'class-validator';

describe('${dtoName} DTO', () => {
  it('should validate a valid ${dtoName}', async () => {
    const dto = new ${dtoName}();
    dto.name = 'Valid ${dtoName}';
    
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation for invalid ${dtoName}', async () => {
    const dto = new ${dtoName}();
    // 不设置必填字段
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should handle empty string validation', async () => {
    const dto = new ${dtoName}();
    dto.name = '';
    
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
`;
  }

  /**
   * 创建测试文件
   */
  createTestFile(moduleName, options = {}) {
    const testFileName = `${moduleName}.spec.ts`;
    const testFilePath = path.join(this.srcDir, moduleName, testFileName);

    if (fs.existsSync(testFilePath)) {
      console.warn(`⚠️ 测试文件已存在: ${testFilePath}`);
      return;
    }

    const template = this.generateNestJSTestTemplate(moduleName, options);

    // 确保目录存在
    const dir = path.dirname(testFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(testFilePath, template);
    console.log(`✅ 测试文件已创建: ${testFilePath}`);
  }

  /**
   * 生成测试数据
   */
  generateTestData(type, options = {}) {
    const dataGenerators = {
      user: () => ({
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),

      article: () => ({
        id: '1',
        title: 'Test Article',
        content: 'This is a test article content',
        authorId: '1',
        published: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),

      tag: () => ({
        id: '1',
        name: 'test-tag',
        description: 'A test tag',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }),

      category: () => ({
        id: '1',
        name: 'test-category',
        description: 'A test category',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    };

    return dataGenerators[type] ? dataGenerators[type]() : {};
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
      summary: {
        statements: coverage.total.statements.pct,
        branches: coverage.total.branches.pct,
        functions: coverage.total.functions.pct,
        lines: coverage.total.lines.pct
      },
      recommendations: []
    };

    // 生成建议
    if (analysis.summary.statements < 70) {
      analysis.recommendations.push({
        type: 'coverage',
        priority: 'high',
        message: '语句覆盖率低于70%，建议增加测试用例',
        action: '为未覆盖的代码路径添加测试'
      });
    }

    if (analysis.summary.branches < 70) {
      analysis.recommendations.push({
        type: 'coverage',
        priority: 'medium',
        message: '分支覆盖率较低，建议增加条件测试',
        action: '为条件分支添加测试用例'
      });
    }

    return analysis;
  }

  /**
   * 生成测试建议
   */
  generateTestSuggestions() {
    const suggestions = [];

    // 查找缺少测试的模块
    const modules = this.findModules();
    const modulesWithoutTests = modules.filter(module => !this.hasTestFile(module));

    if (modulesWithoutTests.length > 0) {
      suggestions.push({
        type: 'missing-tests',
        priority: 'high',
        message: `发现 ${modulesWithoutTests.length} 个模块缺少测试`,
        action: '为以下模块创建测试文件',
        modules: modulesWithoutTests
      });
    }

    // 检查测试文件质量
    const testFiles = this.findTestFiles();
    const lowQualityTests = testFiles.filter(file => this.analyzeTestQuality(file) < 0.7);

    if (lowQualityTests.length > 0) {
      suggestions.push({
        type: 'test-quality',
        priority: 'medium',
        message: `发现 ${lowQualityTests.length} 个测试文件质量较低`,
        action: '改进测试覆盖率和断言质量',
        files: lowQualityTests
      });
    }

    return suggestions;
  }

  /**
   * 查找模块
   */
  findModules() {
    const modules = [];

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);

      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          // 检查是否包含service或controller文件
          const hasService = fs.existsSync(path.join(filePath, `${file}.service.ts`));
          const hasController = fs.existsSync(path.join(filePath, `${file}.controller.ts`));

          if (hasService || hasController) {
            modules.push(file);
          }

          walkDir(filePath);
        }
      });
    };

    walkDir(this.srcDir);
    return modules;
  }

  /**
   * 检查是否有测试文件
   */
  hasTestFile(moduleName) {
    const testFile = path.join(this.srcDir, moduleName, `${moduleName}.spec.ts`);
    return fs.existsSync(testFile);
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
        } else if (file.endsWith('.spec.ts') || file.endsWith('.test.ts')) {
          testFiles.push(filePath);
        }
      });
    };

    walkDir(this.srcDir);
    walkDir(this.testDir);
    return testFiles;
  }

  /**
   * 分析测试质量
   */
  analyzeTestQuality(testFile) {
    try {
      const content = fs.readFileSync(testFile, 'utf8');

      let score = 0;

      // 检查是否有describe块
      if (content.includes('describe(')) score += 0.2;

      // 检查是否有it块
      if (content.includes('it(')) score += 0.2;

      // 检查是否有expect断言
      if (content.includes('expect(')) score += 0.2;

      // 检查是否有beforeEach
      if (content.includes('beforeEach(')) score += 0.1;

      // 检查是否有afterEach
      if (content.includes('afterEach(')) score += 0.1;

      // 检查是否有Mock
      if (content.includes('jest.fn(') || content.includes('mock')) score += 0.2;

      return score;
    } catch (error) {
      return 0;
    }
  }

  /**
   * 生成测试报告
   */
  generateTestReport() {
    const coverage = this.analyzeTestCoverage();
    const suggestions = this.generateTestSuggestions();
    const modules = this.findModules();
    const testFiles = this.findTestFiles();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalModules: modules.length,
        modulesWithTests: modules.filter(m => this.hasTestFile(m)).length,
        totalTestFiles: testFiles.length,
        coverage: coverage?.summary || null
      },
      suggestions,
      modules: modules.map(module => ({
        name: module,
        hasTests: this.hasTestFile(module),
        testQuality: this.hasTestFile(module) ?
          this.analyzeTestQuality(path.join(this.srcDir, module, `${module}.spec.ts`)) : 0
      }))
    };

    const reportPath = path.join(this.projectRoot, 'test-results', 'backend-test-report.json');

    // 确保目录存在
    const dir = path.dirname(reportPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 测试报告已生成: ${reportPath}`);

    return report;
  }
}

// 命令行接口
if (require.main === module) {
  const helper = new BackendTestHelper();
  const command = process.argv[2];
  const args = process.argv.slice(3);

  switch (command) {
    case 'create-test':
      if (args.length < 1) {
        console.error('❌ 请提供模块名称');
        process.exit(1);
      }
      const options = {
        includeController: args.includes('--controller'),
        includeE2E: args.includes('--e2e')
      };
      helper.createTestFile(args[0], options);
      break;

    case 'analyze':
      helper.generateTestReport();
      break;

    case 'suggestions':
      const suggestions = helper.generateTestSuggestions();
      console.log('\n📋 测试建议:');
      suggestions.forEach((suggestion, index) => {
        console.log(`\n${index + 1}. ${suggestion.message}`);
        console.log(`   优先级: ${suggestion.priority}`);
        console.log(`   建议: ${suggestion.action}`);
        if (suggestion.modules) {
          console.log(`   模块: ${suggestion.modules.join(', ')}`);
        }
      });
      break;

    case 'coverage':
      const coverage = helper.analyzeTestCoverage();
      if (coverage) {
        console.log('\n📊 覆盖率分析:');
        console.log(`   语句覆盖率: ${coverage.summary.statements}%`);
        console.log(`   分支覆盖率: ${coverage.summary.branches}%`);
        console.log(`   函数覆盖率: ${coverage.summary.functions}%`);
        console.log(`   行覆盖率: ${coverage.summary.lines}%`);

        if (coverage.recommendations.length > 0) {
          console.log('\n💡 建议:');
          coverage.recommendations.forEach(rec => {
            console.log(`   - ${rec.message}`);
          });
        }
      }
      break;

    default:
      console.log(`
🔧 后端测试辅助工具使用说明:

用法: node scripts/backend-test-helper.js <command> [args]

命令:
  create-test <moduleName> [--controller] [--e2e]  创建测试文件
  analyze                                        分析测试覆盖率
  suggestions                                    生成测试建议
  coverage                                       查看覆盖率分析

示例:
  node scripts/backend-test-helper.js create-test users --controller
  node scripts/backend-test-helper.js create-test articles --controller --e2e
  node scripts/backend-test-helper.js analyze
  node scripts/backend-test-helper.js suggestions
      `);
  }
}

module.exports = BackendTestHelper;
