import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
    console.log('🧹 清理全局测试环境...');

    // 清理测试数据
    await cleanupTestData();

    // 清理存储状态文件
    const fs = require('fs');
    const path = require('path');

    const storageStatesDir = './testing/e2e/storage-states';
    if (fs.existsSync(storageStatesDir)) {
        const files = fs.readdirSync(storageStatesDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                fs.unlinkSync(path.join(storageStatesDir, file));
            }
        }
    }

    console.log('✅ 全局清理完成');
}

async function cleanupTestData() {
    try {
        // 清理测试数据库数据
        const response = await fetch('http://localhost:3001/api/test/cleanup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-admin-token', // 测试环境管理员令牌
            },
        });

        if (response.ok) {
            console.log('✅ 测试数据清理完成');
        } else {
            console.warn('⚠️  测试数据清理失败:', response.statusText);
        }
    } catch (error) {
        console.warn('⚠️  测试数据清理出错:', error.message);
    }
}

export default globalTeardown;
