#!/usr/bin/env node

/**
 * 修复测试文件中的导入错误
 */

const fs = require('fs');
const path = require('path');

class TestImportFixer {
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
                } else if (file.endsWith('.spec.ts')) {
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

        // 1. 修复导入错误 - 将小写导入改为正确的类名
        const importRegex = /import\s*{\s*([^}]+)\s*}\s*from\s*['"`]([^'"`]+)['"`];/g;
        const matches = content.match(importRegex);

        if (matches) {
            matches.forEach(match => {
                // 检查是否包含错误的导入
                if (match.includes('articleController') || match.includes('articleService')) {
                    content = content.replace(
                        /import\s*{\s*articleController\s*}\s*from\s*['"`]\.\/article\.controller['"`];/g,
                        'import { ArticleController } from \'./article.controller\';'
                    );
                    content = content.replace(
                        /import\s*{\s*articleService\s*}\s*from\s*['"`]\.\/article\.service['"`];/g,
                        'import { ArticleService } from \'./article.service\';'
                    );
                    updated = true;
                }

                if (match.includes('articlesController') || match.includes('articlesService')) {
                    content = content.replace(
                        /import\s*{\s*articlesController\s*}\s*from\s*['"`]\.\/articles\.controller['"`];/g,
                        'import { ArticlesController } from \'./articles.controller\';'
                    );
                    content = content.replace(
                        /import\s*{\s*articlesService\s*}\s*from\s*['"`]\.\/articles\.service['"`];/g,
                        'import { ArticlesService } from \'./articles.service\';'
                    );
                    updated = true;
                }

                if (match.includes('healthController') || match.includes('healthService')) {
                    content = content.replace(
                        /import\s*{\s*healthController\s*}\s*from\s*['"`]\.\/health\.controller['"`];/g,
                        'import { HealthController } from \'./health.controller\';'
                    );
                    content = content.replace(
                        /import\s*{\s*healthService\s*}\s*from\s*['"`]\.\/health\.service['"`];/g,
                        'import { HealthService } from \'./health.service\';'
                    );
                    updated = true;
                }

                if (match.includes('lowcodeController') || match.includes('lowcodeService')) {
                    content = content.replace(
                        /import\s*{\s*lowcodeController\s*}\s*from\s*['"`]\.\/lowcode\.controller['"`];/g,
                        'import { LowcodeController } from \'./lowcode.controller\';'
                    );
                    content = content.replace(
                        /import\s*{\s*lowcodeService\s*}\s*from\s*['"`]\.\/lowcode\.service['"`];/g,
                        'import { LowcodeService } from \'./lowcode.service\';'
                    );
                    updated = true;
                }

                if (match.includes('metricsController') || match.includes('metricsService')) {
                    content = content.replace(
                        /import\s*{\s*metricsController\s*}\s*from\s*['"`]\.\/metrics\.controller['"`];/g,
                        'import { MetricsController } from \'./metrics.controller\';'
                    );
                    content = content.replace(
                        /import\s*{\s*metricsService\s*}\s*from\s*['"`]\.\/metrics\.service['"`];/g,
                        'import { MetricsService } from \'./metrics.service\';'
                    );
                    updated = true;
                }

                if (match.includes('tagsController') || match.includes('tagsService')) {
                    content = content.replace(
                        /import\s*{\s*tagsController\s*}\s*from\s*['"`]\.\/tags\.controller['"`];/g,
                        'import { TagsController } from \'./tags.controller\';'
                    );
                    content = content.replace(
                        /import\s*{\s*tagsService\s*}\s*from\s*['"`]\.\/tags\.service['"`];/g,
                        'import { TagsService } from \'./tags.service\';'
                    );
                    updated = true;
                }

                if (match.includes('userController') || match.includes('userService')) {
                    content = content.replace(
                        /import\s*{\s*userController\s*}\s*from\s*['"`]\.\/user\.controller['"`];/g,
                        'import { UserController } from \'./user.controller\';'
                    );
                    content = content.replace(
                        /import\s*{\s*userService\s*}\s*from\s*['"`]\.\/user\.service['"`];/g,
                        'import { UserService } from \'./user.service\';'
                    );
                    updated = true;
                }

                if (match.includes('usersController') || match.includes('usersService')) {
                    content = content.replace(
                        /import\s*{\s*usersController\s*}\s*from\s*['"`]\.\/users\.controller['"`];/g,
                        'import { UsersController } from \'./users.controller\';'
                    );
                    content = content.replace(
                        /import\s*{\s*usersService\s*}\s*from\s*['"`]\.\/users\.service['"`];/g,
                        'import { UsersService } from \'./users.service\';'
                    );
                    updated = true;
                }
            });
        }

        // 2. 修复变量名错误
        content = content.replace(/let\s+service:\s*articleService;/g, 'let service: ArticleService;');
        content = content.replace(/let\s+controller:\s*articleController;/g, 'let controller: ArticleController;');

        content = content.replace(/let\s+service:\s*articlesService;/g, 'let service: ArticlesService;');
        content = content.replace(/let\s+controller:\s*articlesController;/g, 'let controller: ArticlesController;');

        content = content.replace(/let\s+service:\s*healthService;/g, 'let service: HealthService;');
        content = content.replace(/let\s+controller:\s*healthController;/g, 'let controller: HealthController;');

        content = content.replace(/let\s+service:\s*lowcodeService;/g, 'let service: LowcodeService;');
        content = content.replace(/let\s+controller:\s*lowcodeController;/g, 'let controller: LowcodeController;');

        content = content.replace(/let\s+service:\s*metricsService;/g, 'let service: MetricsService;');
        content = content.replace(/let\s+controller:\s*metricsController;/g, 'let controller: MetricsController;');

        content = content.replace(/let\s+service:\s*tagsService;/g, 'let service: TagsService;');
        content = content.replace(/let\s+controller:\s*tagsController;/g, 'let controller: TagsController;');

        content = content.replace(/let\s+service:\s*userService;/g, 'let service: UserService;');
        content = content.replace(/let\s+controller:\s*userController;/g, 'let controller: UserController;');

        content = content.replace(/let\s+service:\s*usersService;/g, 'let service: UsersService;');
        content = content.replace(/let\s+controller:\s*usersController;/g, 'let controller: UsersController;');

        // 3. 修复provider数组中的类名
        content = content.replace(/providers:\s*\[\s*articleService,/g, 'providers: [ArticleService,');
        content = content.replace(/providers:\s*\[\s*articlesService,/g, 'providers: [ArticlesService,');
        content = content.replace(/providers:\s*\[\s*healthService,/g, 'providers: [HealthService,');
        content = content.replace(/providers:\s*\[\s*lowcodeService,/g, 'providers: [LowcodeService,');
        content = content.replace(/providers:\s*\[\s*metricsService,/g, 'providers: [MetricsService,');
        content = content.replace(/providers:\s*\[\s*tagsService,/g, 'providers: [TagsService,');
        content = content.replace(/providers:\s*\[\s*userService,/g, 'providers: [UserService,');
        content = content.replace(/providers:\s*\[\s*usersService,/g, 'providers: [UsersService,');

        content = content.replace(/controllers:\s*\[\s*articleController,/g, 'controllers: [ArticleController,');
        content = content.replace(/controllers:\s*\[\s*articlesController,/g, 'controllers: [ArticlesController,');
        content = content.replace(/controllers:\s*\[\s*healthController,/g, 'controllers: [HealthController,');
        content = content.replace(/controllers:\s*\[\s*lowcodeController,/g, 'controllers: [LowcodeController,');
        content = content.replace(/controllers:\s*\[\s*metricsController,/g, 'controllers: [MetricsController,');
        content = content.replace(/controllers:\s*\[\s*tagsController,/g, 'controllers: [TagsController,');
        content = content.replace(/controllers:\s*\[\s*userController,/g, 'controllers: [UserController,');
        content = content.replace(/controllers:\s*\[\s*usersController,/g, 'controllers: [UsersController,');

        // 4. 修复module.get调用
        content = content.replace(/module\.get<articleService>\(articleService\)/g, 'module.get<ArticleService>(ArticleService)');
        content = content.replace(/module\.get<articleController>\(articleController\)/g, 'module.get<ArticleController>(ArticleController)');

        content = content.replace(/module\.get<articlesService>\(articlesService\)/g, 'module.get<ArticlesService>(ArticlesService)');
        content = content.replace(/module\.get<articlesController>\(articlesController\)/g, 'module.get<ArticlesController>(ArticlesController)');

        content = content.replace(/module\.get<healthService>\(healthService\)/g, 'module.get<HealthService>(HealthService)');
        content = content.replace(/module\.get<healthController>\(healthController\)/g, 'module.get<HealthController>(HealthController)');

        content = content.replace(/module\.get<lowcodeService>\(lowcodeService\)/g, 'module.get<LowcodeService>(LowcodeService)');
        content = content.replace(/module\.get<lowcodeController>\(lowcodeController\)/g, 'module.get<LowcodeController>(LowcodeController)');

        content = content.replace(/module\.get<metricsService>\(metricsService\)/g, 'module.get<MetricsService>(MetricsService)');
        content = content.replace(/module\.get<metricsController>\(metricsController\)/g, 'module.get<MetricsController>(MetricsController)');

        content = content.replace(/module\.get<tagsService>\(tagsService\)/g, 'module.get<TagsService>(TagsService)');
        content = content.replace(/module\.get<tagsController>\(tagsController\)/g, 'module.get<TagsController>(TagsController)');

        content = content.replace(/module\.get<userService>\(userService\)/g, 'module.get<UserService>(UserService)');
        content = content.replace(/module\.get<userController>\(userController\)/g, 'module.get<UserController>(UserController)');

        content = content.replace(/module\.get<usersService>\(usersService\)/g, 'module.get<UsersService>(UsersService)');
        content = content.replace(/module\.get<usersController>\(usersController\)/g, 'module.get<UsersController>(UsersController)');

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
        console.log('🔧 开始修复测试文件导入错误...\n');

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
}

// 命令行接口
if (require.main === module) {
    const fixer = new TestImportFixer();
    const command = process.argv[2];

    switch (command) {
        case 'fix':
            fixer.fixAllFiles();
            break;

        default:
            console.log(`
🔧 测试文件导入修复工具

用法: node scripts/fix-test-imports.js <command>

命令:
  fix    修复所有测试文件中的导入错误

示例:
  node scripts/fix-test-imports.js fix
      `);
    }
}

module.exports = TestImportFixer;
