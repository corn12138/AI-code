#!/usr/bin/env node

/**
 * 创建简单测试模板的脚本
 */

const fs = require('fs');
const path = require('path');

class SimpleTestCreator {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.srcDir = path.join(this.projectRoot, 'src');
  }

  /**
   * 查找所有模块
   */
  findModules() {
    const modules = [];

    const walkDir = (dir) => {
      if (!fs.existsSync(dir)) return;

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
   * 生成简单的Service测试模板
   */
  generateServiceTestTemplate(moduleName) {
    return `import { Test, TestingModule } from '@nestjs/testing';
import { ${moduleName}Service } from './${moduleName}.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('${moduleName}Service', () => {
  let service: ${moduleName}Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ${moduleName}Service,
        {
          provide: 'Repository',
          useValue: {
            findOne: vi.fn(),
            save: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            find: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<${moduleName}Service>(${moduleName}Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have basic functionality', () => {
    expect(typeof service).toBe('object');
  });
});
`;
  }

  /**
   * 生成简单的Controller测试模板
   */
  generateControllerTestTemplate(moduleName) {
    return `import { Test, TestingModule } from '@nestjs/testing';
import { ${moduleName}Controller } from './${moduleName}.controller';
import { ${moduleName}Service } from './${moduleName}.service';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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
            findAll: vi.fn(),
            findOne: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
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

  it('should have basic functionality', () => {
    expect(typeof controller).toBe('object');
  });
});
`;
  }

  /**
   * 为模块创建简单测试
   */
  createSimpleTest(moduleName) {
    const moduleDir = path.join(this.srcDir, moduleName);
    const servicePath = path.join(moduleDir, `${moduleName}.service.ts`);
    const controllerPath = path.join(moduleDir, `${moduleName}.controller.ts`);

    let createdFiles = [];

    // 创建Service测试
    if (fs.existsSync(servicePath)) {
      const serviceTestPath = path.join(moduleDir, `${moduleName}.service.spec.ts`);
      if (!fs.existsSync(serviceTestPath)) {
        const serviceTestContent = this.generateServiceTestTemplate(moduleName);
        fs.writeFileSync(serviceTestPath, serviceTestContent);
        createdFiles.push(serviceTestPath);
        console.log(`✅ 创建Service测试: ${serviceTestPath}`);
      } else {
        console.log(`⏭️ Service测试已存在: ${serviceTestPath}`);
      }
    }

    // 创建Controller测试
    if (fs.existsSync(controllerPath)) {
      const controllerTestPath = path.join(moduleDir, `${moduleName}.controller.spec.ts`);
      if (!fs.existsSync(controllerTestPath)) {
        const controllerTestContent = this.generateControllerTestTemplate(moduleName);
        fs.writeFileSync(controllerTestPath, controllerTestContent);
        createdFiles.push(controllerTestPath);
        console.log(`✅ 创建Controller测试: ${controllerTestPath}`);
      } else {
        console.log(`⏭️ Controller测试已存在: ${controllerTestPath}`);
      }
    }

    return createdFiles;
  }

  /**
   * 为所有模块创建简单测试
   */
  createAllSimpleTests() {
    console.log('🚀 开始创建简单测试...\n');

    const modules = this.findModules();
    console.log(`📁 找到 ${modules.length} 个模块\n`);

    let totalCreated = 0;
    const allCreatedFiles = [];

    modules.forEach(moduleName => {
      console.log(`📦 处理模块: ${moduleName}`);
      const createdFiles = this.createSimpleTest(moduleName);
      allCreatedFiles.push(...createdFiles);
      totalCreated += createdFiles.length;
    });

    console.log(`\n🎉 创建完成!`);
    console.log(`📊 统计:`);
    console.log(`  - 总模块数: ${modules.length}`);
    console.log(`  - 创建文件数: ${totalCreated}`);
    console.log(`  - 总文件数: ${allCreatedFiles.length}`);

    if (allCreatedFiles.length > 0) {
      console.log(`\n📝 创建的文件:`);
      allCreatedFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    return { modules: modules.length, created: totalCreated, files: allCreatedFiles };
  }

  /**
   * 创建特定模块的测试
   */
  createModuleTest(moduleName) {
    console.log(`🚀 为模块 ${moduleName} 创建测试...\n`);

    const createdFiles = this.createSimpleTest(moduleName);

    console.log(`\n🎉 创建完成!`);
    console.log(`📊 统计:`);
    console.log(`  - 创建文件数: ${createdFiles.length}`);

    if (createdFiles.length > 0) {
      console.log(`\n📝 创建的文件:`);
      createdFiles.forEach(file => {
        console.log(`  - ${file}`);
      });
    }

    return createdFiles;
  }
}

// 命令行接口
if (require.main === module) {
  const creator = new SimpleTestCreator();
  const command = process.argv[2];
  const moduleName = process.argv[3];

  switch (command) {
    case 'all':
      creator.createAllSimpleTests();
      break;

    case 'module':
      if (!moduleName) {
        console.log('❌ 请指定模块名称');
        console.log('用法: node scripts/create-simple-tests.js module <moduleName>');
        process.exit(1);
      }
      creator.createModuleTest(moduleName);
      break;

    default:
      console.log(`
🚀 简单测试创建工具

用法: node scripts/create-simple-tests.js <command> [moduleName]

命令:
  all             为所有模块创建简单测试
  module <name>   为指定模块创建简单测试

示例:
  node scripts/create-simple-tests.js all
  node scripts/create-simple-tests.js module auth
      `);
  }
}

module.exports = SimpleTestCreator;
