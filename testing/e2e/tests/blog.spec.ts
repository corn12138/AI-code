import { expect, test } from '@playwright/test';

test.describe('博客应用 E2E 测试', () => {

    test('主页加载和内容显示', async ({ page }) => {
        await page.goto('/');

        // 检查页面标题
        await expect(page).toHaveTitle(/AI.*Blog/);

        // 检查导航栏
        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('text=首页')).toBeVisible();
        await expect(page.locator('text=文章')).toBeVisible();

        // 检查主要内容区域
        await expect(page.locator('main')).toBeVisible();

        // 检查文章列表
        const articles = page.locator('[data-testid="article-card"]');
        await expect(articles.first()).toBeVisible();
    });

    test('用户注册流程', async ({ page }) => {
        await page.goto('/register');

        // 填写注册表单
        const timestamp = Date.now();
        const testEmail = `test${timestamp}@example.com`;

        await page.fill('[name="username"]', `testuser${timestamp}`);
        await page.fill('[name="email"]', testEmail);
        await page.fill('[name="fullName"]', 'Test User');
        await page.fill('[name="password"]', 'password123');
        await page.fill('[name="confirmPassword"]', 'password123');

        // 提交注册
        await page.click('button[type="submit"]');

        // 检查注册成功
        await expect(page.locator('text=注册成功')).toBeVisible();

        // 应该重定向到登录页面
        await expect(page).toHaveURL(/.*\/login/);
    });

    test('用户登录流程', async ({ page }) => {
        await page.goto('/login');

        // 填写登录表单
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'test123');

        // 提交登录
        await page.click('button[type="submit"]');

        // 检查登录成功
        await expect(page).toHaveURL(/.*\/dashboard/);
        await expect(page.locator('text=欢迎')).toBeVisible();
    });

    test('文章浏览和搜索', async ({ page }) => {
        await page.goto('/');

        // 点击第一篇文章
        const firstArticle = page.locator('[data-testid="article-card"]').first();
        const articleTitle = await firstArticle.locator('h2').textContent();
        await firstArticle.click();

        // 检查文章详情页
        await expect(page.locator('article')).toBeVisible();
        await expect(page.locator(`text=${articleTitle}`)).toBeVisible();

        // 返回首页
        await page.goBack();

        // 测试搜索功能
        await page.fill('[data-testid="search-input"]', 'Next.js');
        await page.click('[data-testid="search-button"]');

        // 检查搜索结果
        await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    test('响应式设计测试', async ({ page }) => {
        // 桌面端
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        await expect(page.locator('nav')).toBeVisible();
        await expect(page.locator('.sidebar')).toBeVisible();

        // 平板端
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.reload();

        // 移动端
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();

        // 检查移动端菜单
        const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
        if (await mobileMenuButton.isVisible()) {
            await mobileMenuButton.click();
            await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
        }
    });

    test('页面性能测试', async ({ page }) => {
        // 开始性能监控
        await page.goto('/', { waitUntil: 'networkidle' });

        // 检查页面加载时间
        const performanceEntries = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            return {
                loadTime: navigation.loadEventEnd - navigation.fetchStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
                firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
                firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
            };
        });

        // 性能断言
        expect(performanceEntries.loadTime).toBeLessThan(3000); // 3秒内加载完成
        expect(performanceEntries.domContentLoaded).toBeLessThan(2000); // 2秒内DOM加载完成
        expect(performanceEntries.firstContentfulPaint).toBeLessThan(1500); // 1.5秒内首次内容绘制
    });

    test('可访问性测试', async ({ page }) => {
        await page.goto('/');

        // 检查页面是否有主要的可访问性元素
        await expect(page.locator('main')).toHaveAttribute('role', 'main');
        await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');

        // 检查图片是否有 alt 属性
        const images = page.locator('img');
        const imageCount = await images.count();

        for (let i = 0; i < imageCount; i++) {
            const img = images.nth(i);
            if (await img.isVisible()) {
                await expect(img).toHaveAttribute('alt');
            }
        }

        // 检查链接是否有意义的文本
        const links = page.locator('a');
        const linkCount = await links.count();

        for (let i = 0; i < linkCount; i++) {
            const link = links.nth(i);
            if (await link.isVisible()) {
                const text = await link.textContent();
                expect(text?.trim().length).toBeGreaterThan(0);
            }
        }
    });

    test('用户交互流程测试', async ({ page }) => {
        // 使用管理员身份登录
        await page.goto('/login');
        await page.fill('[name="email"]', 'admin@example.com');
        await page.fill('[name="password"]', 'admin123');
        await page.click('button[type="submit"]');

        // 等待跳转到仪表板
        await expect(page).toHaveURL(/.*\/dashboard/);

        // 创建新文章
        await page.click('text=写文章');
        await expect(page).toHaveURL(/.*\/editor/);

        // 填写文章内容
        await page.fill('[name="title"]', '测试文章标题');
        await page.fill('[data-testid="editor-content"]', '这是一篇测试文章的内容。');

        // 保存草稿
        await page.click('text=保存草稿');
        await expect(page.locator('text=草稿已保存')).toBeVisible();

        // 发布文章
        await page.click('text=发布');
        await expect(page.locator('text=文章已发布')).toBeVisible();

        // 查看发布的文章
        await page.goto('/');
        await expect(page.locator('text=测试文章标题')).toBeVisible();
    });

    test('错误处理测试', async ({ page }) => {
        // 测试 404 页面
        await page.goto('/non-existent-page');
        await expect(page.locator('text=404')).toBeVisible();
        await expect(page.locator('text=页面未找到')).toBeVisible();

        // 测试网络错误处理
        await page.route('**/api/**', route => route.abort());
        await page.goto('/login');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'wrong-password');
        await page.click('button[type="submit"]');

        // 应该显示错误信息
        await expect(page.locator('text=网络错误')).toBeVisible();
    });
});
