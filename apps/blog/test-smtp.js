// 直接测试SMTP连接和邮件发送
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTP() {
    console.log('🔌 开始测试SMTP连接...\n');

      // 创建邮件传输器
  const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false, // 587端口使用false
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        // 添加调试选项
        debug: true,
        logger: true
    });

    try {
        // 步骤1：验证SMTP连接
        console.log('1️⃣ 正在验证SMTP连接...');
        await transporter.verify();
        console.log('✅ SMTP连接验证成功！\n');

        // 步骤2：发送测试邮件
        console.log('2️⃣ 正在发送测试邮件...');
        const info = await transporter.sendMail({
            from: `"${process.env.SENDER_NAME}" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER, // 发送给自己
            subject: '🎉 SMTP测试成功！',
            text: '如果您收到这封邮件，说明SMTP配置完全正确！',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">🎉 SMTP测试成功！</h2>
          <p>恭喜！您的163邮箱SMTP配置已经完全正确。</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>配置信息：</h3>
            <ul>
              <li><strong>SMTP服务器：</strong> ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}</li>
              <li><strong>发送邮箱：</strong> ${process.env.SMTP_USER}</li>
              <li><strong>发送时间：</strong> ${new Date().toLocaleString('zh-CN')}</li>
            </ul>
          </div>
          <p>现在您可以正常使用：</p>
          <ul>
            <li>✅ 忘记密码功能</li>
            <li>✅ 邮箱验证码登录</li>
            <li>✅ 邮件通知功能</li>
          </ul>
        </div>
      `
        });

        console.log('✅ 测试邮件发送成功！');
        console.log(`📧 邮件ID: ${info.messageId}`);
        console.log(`📮 收件人: ${process.env.SMTP_USER}`);
        console.log('\n🎉 SMTP配置完全正确！请检查您的邮箱。');

    } catch (error) {
        console.error('\n❌ SMTP测试失败:');
        console.error(`错误类型: ${error.code || '未知'}`);
        console.error(`错误信息: ${error.message}`);

        // 提供具体的解决建议
        if (error.code === 'EAUTH') {
            console.error('\n🔐 认证失败解决方案:');
            console.error('1. 确认163邮箱已开启SMTP服务');
            console.error('2. 确认使用的是"客户端授权码"而不是登录密码');
            console.error('3. 重新生成授权码并更新.env文件');
        } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
            console.error('\n🌐 网络连接问题解决方案:');
            console.error('1. 检查网络连接是否正常');
            console.error('2. 确认防火墙没有阻止587端口');
            console.error('3. 尝试使用其他网络环境');
        } else if (error.code === 'ENOTFOUND') {
            console.error('\n🏠 DNS解析问题解决方案:');
            console.error('1. 检查SMTP_HOST是否正确');
            console.error('2. 尝试刷新DNS缓存');
        } else {
            console.error('\n❓ 其他问题，请检查:');
            console.error('1. .env文件中的配置是否正确');
            console.error('2. 163邮箱服务状态是否正常');
        }
    }
}

console.log('📧 163邮箱SMTP直接测试');
console.log('============================');
testSMTP().catch(console.error); 