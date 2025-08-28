// 测试修复后的邮件服务
require('dotenv').config();

// 模拟我们的邮件服务
const { emailService } = require('./src/lib/email.ts');

async function testFinalSetup() {
    console.log('🎯 测试修复后的邮件服务...\n');

    try {
        // 测试连接
        console.log('1️⃣ 测试邮件服务连接...');
        const isConnected = await emailService.testConnection();

        if (isConnected) {
            console.log('✅ 邮件服务连接成功！\n');

            // 测试发送验证码邮件
            console.log('2️⃣ 测试发送验证码邮件...');
            const result = await emailService.sendVerificationCode(
                process.env.SMTP_USER,
                '123456',
                'login'
            );

            if (result) {
                console.log('✅ 验证码邮件发送成功！');
                console.log('📧 请检查您的邮箱');
            } else {
                console.log('❌ 验证码邮件发送失败');
            }

        } else {
            console.log('❌ 邮件服务连接失败');
        }

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error.message);
    }
}

console.log('🔧 最终配置测试');
console.log('================');
console.log('📍 使用端口:', process.env.SMTP_PORT || '465');
console.log('🔒 SSL模式:', process.env.SMTP_PORT === '465' ? '启用' : '禁用');
console.log('');

testFinalSetup().catch(console.error); 