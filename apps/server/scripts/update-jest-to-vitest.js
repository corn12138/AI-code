#!/usr/bin/env node

/**
 * 将Jest语法更新为Vitest语法的脚本
 */

const fs = require('fs');
const path = require('path');

class JestToVitestUpdater {
    constructor() {
        this.projectRoot = path.resolve(__dirname, '..');
        this.srcDir = path.join(this.projectRoot, 'src');
        this.testDir = path.join(this.projectRoot, 'test');
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
                } else if (file.endsWith('.spec.ts') || file.endsWith('.test.ts') || file.endsWith('-spec.ts')) {
                    testFiles.push(filePath);
                }
            });
        };

        walkDir(this.srcDir);
        walkDir(this.testDir);
        return testFiles;
    }

    /**
     * 更新单个文件
     */
    updateFile(filePath) {
        console.log(`🔄 更新文件: ${filePath}`);

        let content = fs.readFileSync(filePath, 'utf8');
        let updated = false;

        // 1. 添加Vitest导入
        if (!content.includes('import { vi,') && !content.includes('import {vi,')) {
            const vitestImport = "import { vi, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';";

            // 查找最后一个import语句
            const importRegex = /import.*from.*['"];?\s*$/gm;
            const imports = content.match(importRegex);

            if (imports) {
                const lastImport = imports[imports.length - 1];
                const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
                content = content.slice(0, lastImportIndex) + '\n' + vitestImport + content.slice(lastImportIndex);
            } else {
                // 如果没有import语句，在文件开头添加
                content = vitestImport + '\n\n' + content;
            }
            updated = true;
        }

        // 2. 替换jest.mock为vi.mock
        if (content.includes('jest.mock(')) {
            content = content.replace(/jest\.mock\(/g, 'vi.mock(');
            updated = true;
        }

        // 3. 替换jest.fn为vi.fn
        if (content.includes('jest.fn(')) {
            content = content.replace(/jest\.fn\(/g, 'vi.fn(');
            updated = true;
        }

        // 4. 替换jest.spyOn为vi.spyOn
        if (content.includes('jest.spyOn(')) {
            content = content.replace(/jest\.spyOn\(/g, 'vi.spyOn(');
            updated = true;
        }

        // 5. 替换jest.clearAllMocks为vi.clearAllMocks
        if (content.includes('jest.clearAllMocks(')) {
            content = content.replace(/jest\.clearAllMocks\(/g, 'vi.clearAllMocks(');
            updated = true;
        }

        // 6. 替换jest.clearAllTimers为vi.clearAllTimers
        if (content.includes('jest.clearAllTimers(')) {
            content = content.replace(/jest\.clearAllTimers\(/g, 'vi.clearAllTimers(');
            updated = true;
        }

        // 7. 替换jest.useFakeTimers为vi.useFakeTimers
        if (content.includes('jest.useFakeTimers(')) {
            content = content.replace(/jest\.useFakeTimers\(/g, 'vi.useFakeTimers(');
            updated = true;
        }

        // 8. 替换jest.useRealTimers为vi.useRealTimers
        if (content.includes('jest.useRealTimers(')) {
            content = content.replace(/jest\.useRealTimers\(/g, 'vi.useRealTimers(');
            updated = true;
        }

        // 9. 替换jest.runOnlyPendingTimers为vi.runOnlyPendingTimers
        if (content.includes('jest.runOnlyPendingTimers(')) {
            content = content.replace(/jest\.runOnlyPendingTimers\(/g, 'vi.runOnlyPendingTimers(');
            updated = true;
        }

        // 10. 替换jest.advanceTimersByTime为vi.advanceTimersByTime
        if (content.includes('jest.advanceTimersByTime(')) {
            content = content.replace(/jest\.advanceTimersByTime\(/g, 'vi.advanceTimersByTime(');
            updated = true;
        }

        // 11. 替换jest.Mock类型为vi.Mock
        if (content.includes('jest.Mock')) {
            content = content.replace(/jest\.Mock/g, 'vi.Mock');
            updated = true;
        }

        // 12. 替换require('bcrypt').compare.mockResolvedValueOnce
        if (content.includes("require('bcrypt').compare.mockResolvedValueOnce")) {
            content = content.replace(/require\('bcrypt'\)\.compare\.mockResolvedValueOnce/g, "vi.mocked(require('bcrypt')).compare.mockResolvedValueOnce");
            updated = true;
        }

        // 13. 替换require('bcrypt').compare.mockResolvedValue
        if (content.includes("require('bcrypt').compare.mockResolvedValue")) {
            content = content.replace(/require\('bcrypt'\)\.compare\.mockResolvedValue/g, "vi.mocked(require('bcrypt')).compare.mockResolvedValue");
            updated = true;
        }

        if (updated) {
            fs.writeFileSync(filePath, content);
            console.log(`✅ 已更新: ${filePath}`);
            return true;
        } else {
            console.log(`⏭️ 无需更新: ${filePath}`);
            return false;
        }
    }

    /**
     * 批量更新所有测试文件
     */
    updateAllFiles() {
        console.log('🚀 开始将Jest语法更新为Vitest语法...\n');

        const testFiles = this.findTestFiles();
        console.log(`📁 找到 ${testFiles.length} 个测试文件\n`);

        let updatedCount = 0;

        testFiles.forEach(filePath => {
            if (this.updateFile(filePath)) {
                updatedCount++;
            }
        });

        console.log(`\n🎉 更新完成!`);
        console.log(`📊 统计:`);
        console.log(`  - 总文件数: ${testFiles.length}`);
        console.log(`  - 已更新: ${updatedCount}`);
        console.log(`  - 无需更新: ${testFiles.length - updatedCount}`);

        return { total: testFiles.length, updated: updatedCount };
    }

    /**
     * 检查文件是否需要更新
     */
    checkFile(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const needsUpdate = content.includes('jest.') ||
            content.includes('jest.mock(') ||
            content.includes('jest.fn(') ||
            content.includes('jest.spyOn(');

        return needsUpdate;
    }

    /**
     * 检查所有文件
     */
    checkAllFiles() {
        console.log('🔍 检查需要更新的文件...\n');

        const testFiles = this.findTestFiles();
        const needsUpdate = testFiles.filter(file => this.checkFile(file));

        console.log(`📊 检查结果:`);
        console.log(`  - 总文件数: ${testFiles.length}`);
        console.log(`  - 需要更新: ${needsUpdate.length}`);
        console.log(`  - 无需更新: ${testFiles.length - needsUpdate.length}`);

        if (needsUpdate.length > 0) {
            console.log(`\n📝 需要更新的文件:`);
            needsUpdate.forEach(file => {
                console.log(`  - ${file}`);
            });
        }

        return needsUpdate;
    }
}

// 命令行接口
if (require.main === module) {
    const updater = new JestToVitestUpdater();
    const command = process.argv[2];

    switch (command) {
        case 'update':
            updater.updateAllFiles();
            break;

        case 'check':
            updater.checkAllFiles();
            break;

        default:
            console.log(`
🔄 Jest到Vitest语法更新工具

用法: node scripts/update-jest-to-vitest.js <command>

命令:
  check   检查哪些文件需要更新
  update  更新所有文件中的Jest语法为Vitest语法

示例:
  node scripts/update-jest-to-vitest.js check
  node scripts/update-jest-to-vitest.js update
      `);
    }
}

module.exports = JestToVitestUpdater;
