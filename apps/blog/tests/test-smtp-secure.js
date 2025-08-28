// 测试不同的163邮箱SMTP配置
require('dotenv').config();
const nodemailer = require('nodemailer');

// 测试配置1：使用SSL端口465
async function testSSL() {
    console.log('🔐 测试配置1: SSL端口465...\n');

    const transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 465,
        secure: true, // SSL
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000
    });

    try {
        await transporter.verify();
        console.log('✅ SSL配置验证成功！');

        const info = await transporter.sendMail({
            from: `"${process.env.SENDER_NAME}" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: '🎉 SSL测试成功！',
            text: 'SSL端口465测试成功！'
        });

        console.log('✅ SSL测试邮件发送成功！');
        console.log(`📧 邮件ID: ${info.messageId}\n`);
        return true;

    } catch (error) {
        console.log(`❌ SSL测试失败: ${error.message}\n`);
        return false;
    }
}

// 测试配置2：STARTTLS端口587
async function testSTARTTLS() {
    console.log('🔗 测试配置2: STARTTLS端口587...\n');

    const transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
        tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false
        }
    });

    try {
        await transporter.verify();
        console.log('✅ STARTTLS配置验证成功！');

        const info = await transporter.sendMail({
            from: `"${process.env.SENDER_NAME}" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: '🎉 STARTTLS测试成功！',
            text: 'STARTTLS端口587测试成功！'
        });

        console.log('✅ STARTTLS测试邮件发送成功！');
        console.log(`📧 邮件ID: ${info.messageId}\n`);
        return true;

    } catch (error) {
        console.log(`❌ STARTTLS测试失败: ${error.message}\n`);
        return false;
    }
}

// 测试配置3：端口25（如果可用）
async function testPort25() {
    console.log('📮 测试配置3: 端口25...\n');

    const transporter = nodemailer.createTransport({
        host: 'smtp.163.com',
        port: 25,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000
    });

    try {
        await transporter.verify();
        console.log('✅ 端口25配置验证成功！');

        const info = await transporter.sendMail({
            from: `"${process.env.SENDER_NAME}" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: '🎉 端口25测试成功！',
            text: '端口25测试成功！'
        });

        console.log('✅ 端口25测试邮件发送成功！');
        console.log(`📧 邮件ID: ${info.messageId}\n`);
        return true;

    } catch (error) {
        console.log(`❌ 端口25测试失败: ${error.message}\n`);
        return false;
    }
}

async function runAllTests() {
    console.log('📧 163邮箱SMTP多配置测试');
    console.log('================================\n');

    const tests = [
        { name: 'SSL端口465', fn: testSSL },
        { name: 'STARTTLS端口587', fn: testSTARTTLS },
        { name: '端口25', fn: testPort25 }
    ];

    let successCount = 0;
    let workingConfigs = [];

    for (const test of tests) {
        const result = await test.fn();
        if (result) {
            successCount++;
            workingConfigs.push(test.name);
        }
    }

    console.log('📊 测试结果总结:');
    console.log('=================');
    console.log(`✅ 成功: ${successCount}/${tests.length}`);
    console.log(`❌ 失败: ${tests.length - successCount}/${tests.length}`);

    if (workingConfigs.length > 0) {
        console.log('\n🎉 可用配置:');
        workingConfigs.forEach(config => console.log(`   ✅ ${config}`));

        if (workingConfigs.includes('SSL端口465')) {
            console.log('\n💡 推荐使用SSL端口465配置:');
            console.log('SMTP_HOST="smtp.163.com"');
            console.log('SMTP_PORT="465"');
            console.log('# 在代码中设置 secure: true');
        } else if (workingConfigs.includes('STARTTLS端口587')) {
            console.log('\n💡 推荐使用STARTTLS端口587配置:');
            console.log('SMTP_HOST="smtp.163.com"');
            console.log('SMTP_PORT="587"');
            console.log('# 在代码中设置 secure: false, requireTLS: true');
        }
    } else {
        console.log('\n❌ 所有配置都失败了，可能的原因:');
        console.log('1. 163邮箱授权码不正确');
        console.log('2. 163邮箱SMTP服务未开启');
        console.log('3. 网络防火墙阻止SMTP端口');
        console.log('4. 所在网络环境限制SMTP连接');
    }
}

runAllTests().catch(console.error); 