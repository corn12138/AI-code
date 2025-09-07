#!/usr/bin/env node

/**
 * 修复TypeORM测试问题的脚本
 */

const fs = require('fs');
const path = require('path');

class TypeORMTestFixer {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.srcDir = path.join(this.projectRoot, 'src');
    }

    /**
     * 查找所有测试文件
     */
    findTestFiles() {
        const testFiles = [];

        const walkDir = (dir) => {
            if (!fs.existsSync(dir)) return;

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
        return testFiles;
    }

    /**
     * 修复单个测试文件
     */
    fixTestFile(filePath) {
        console.log(`🔧 修复文件: ${filePath}`);

        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // 1. 添加TypeORM测试配置
        if (!content.includes('TypeOrmModule.forRoot')) {
            // 查找describe块
            const describeMatch = content.match(/describe\(['"`]([^'"`]+)['"`],\s*\(\)\s*=>\s*{/);
            if (describeMatch) {
                const describeStart = content.indexOf(describeMatch[0]);
                const describeEnd = content.indexOf('{', describeStart) + 1;

                const typeormConfig = `
  // TypeORM测试配置
  const typeOrmConfig = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'test_db',
    entities: [],
    synchronize: false,
    logging: false,
  };
`;

                content = content.slice(0, describeEnd) + typeormConfig + content.slice(describeEnd);
                updated = true;
            }
        }

        // 2. 修复实体导入问题
        if (content.includes('import.*from.*entity')) {
            // 注释掉实体导入
            content = content.replace(
                /(import.*from.*entity.*;)/g,
                '// $1 // 暂时注释以避免TypeORM问题'
            );
            updated = true;
        }

        // 3. 添加Mock配置
        if (content.includes('Test.createTestingModule') && !content.includes('overrideProvider')) {
            const testModuleMatch = content.match(/Test\.createTestingModule\(\{[\s\S]*?\}\)/);
            if (testModuleMatch) {
                const mockConfig = `
        .overrideProvider(getRepositoryToken(User))
        .useValue({
          findOne: vi.fn(),
          save: vi.fn(),
          create: vi.fn(),
          update: vi.fn(),
          delete: vi.fn(),
          find: vi.fn(),
        })`;

                content = content.replace(
                    /(Test\.createTestingModule\(\{[\s\S]*?\}\))/,
                    `$1${mockConfig}`
                );
                updated = true;
            }
        }

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ 已修复: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️ 无需修复: ${filePath}`);
            return false;
        }
    }

    /**
     * 批量修复所有测试文件
     */
    fixAllFiles() {
        console.log('🔧 开始修复TypeORM测试问题...\n');

        const testFiles = this.findTestFiles();
        console.log(`📁 找到 ${testFiles.length} 个测试文件\n`);

        let fixedCount = 0;

        testFiles.forEach(filePath => {
            if (this.fixTestFile(filePath)) {
                fixedCount++;
            }
        });

        console.log(`\n🎉 修复完成!`);
        console.log(`📊 统计:`);
        console.log(`  - 总文件数: ${testFiles.length}`);
        console.log(`  - 已修复: ${fixedCount}`);
        console.log(`  - 无需修复: ${testFiles.length - fixedCount}`);

        return { total: testFiles.length, fixed: fixedCount };
    }

    /**
     * 创建测试环境配置文件
     */
    createTestConfig() {
        const configPath = path.join(this.projectRoot, 'test', 'typeorm-test.config.ts');

        const configContent = `import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const testTypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'test',
  password: process.env.DB_PASSWORD || 'test',
  database: process.env.DB_DATABASE || 'test_db',
  entities: [],
  synchronize: false,
  logging: false,
  dropSchema: true,
};

export const mockRepository = {
  findOne: vi.fn(),
  save: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  find: vi.fn(),
  count: vi.fn(),
  query: vi.fn(),
};
`;

        // 确保目录存在
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(configPath, configContent);
        console.log(`✅ 测试配置文件已创建: ${configPath}`);

        return configPath;
    }
}

// 命令行接口
if (require.main === module) {
    const fixer = new TypeORMTestFixer();
    const command = process.argv[2];

    switch (command) {
        case 'fix':
            fixer.fixAllFiles();
            break;

        case 'config':
            fixer.createTestConfig();
            break;

        default:
            console.log(`
🔧 TypeORM测试修复工具

用法: node scripts/fix-typeorm-tests.js <command>

命令:
  fix    修复所有测试文件中的TypeORM问题
  config 创建TypeORM测试配置文件

示例:
  node scripts/fix-typeorm-tests.js fix
  node scripts/fix-typeorm-tests.js config
      `);
    }
}

module.exports = TypeORMTestFixer;
