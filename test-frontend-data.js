#!/usr/bin/env node

const http = require('http');

// 测试移动端应用的数据获取
function testFrontendData() {
    console.log('🧪 测试移动端应用数据获取...');

    // 测试主页
    const options = {
        hostname: 'localhost',
        port: 3002,
        path: '/',
        method: 'GET',
        headers: {
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`📊 响应状态: ${res.statusCode}`);
            console.log(`📏 响应大小: ${data.length} 字符`);

            // 检查是否包含文档相关内容
            const hasDocContent = data.includes('移动端技术文章') ||
                data.includes('SSR实现指南') ||
                data.includes('文档中心');

            console.log(`📄 包含文档内容: ${hasDocContent ? '是' : '否'}`);

            if (hasDocContent) {
                console.log('✅ 移动端应用正在显示文档数据！');
            } else {
                console.log('⚠️  移动端应用可能还在使用模拟数据');

                // 显示页面内容的一部分
                const preview = data.substring(0, 500);
                console.log('\n📝 页面内容预览:');
                console.log(preview);
            }
        });
    });

    req.on('error', (err) => {
        console.error('❌ 请求失败:', err.message);
    });

    req.end();
}

// 运行测试
testFrontendData();
