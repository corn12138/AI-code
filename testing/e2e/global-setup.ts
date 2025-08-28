import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
    console.log('🔧 设置全局测试环境...');

    // 等待服务启动
    await waitForService('http://localhost:3000', 'Blog App');
    await waitForService('http://localhost:3001/health', 'Server API');
    await waitForService('http://localhost:3002', 'Lowcode App');

    // 创建管理员用户会话
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        // 登录管理员账户
        await page.goto('http://localhost:3000/login');
        await page.fill('[name="email"]', 'admin@example.com');
        await page.fill('[name="password"]', 'admin123');
        await page.click('button[type="submit"]');

        // 等待登录成功
        await page.waitForURL('**/dashboard', { timeout: 10000 });

        // 保存认证状态
        await page.context().storageState({
            path: './testing/e2e/storage-states/admin.json'
        });

        console.log('✅ 管理员会话创建成功');
    } catch (error) {
        console.error('❌ 管理员会话创建失败:', error);
    } finally {
        await browser.close();
    }

    console.log('🎉 全局设置完成');
}

async function waitForService(url: string, name: string, timeout = 60000) {
    console.log(`⏳ 等待 ${name} 服务启动 (${url})`);

    const start = Date.now();
    while (Date.now() - start < timeout) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log(`✅ ${name} 服务已就绪`);
                return;
            }
        } catch (error) {
            // 忽略连接错误，继续等待
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error(`${name} 服务启动超时 (${timeout}ms)`);
}

export default globalSetup;
