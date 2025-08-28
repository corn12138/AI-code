// 测试邮件配置脚本
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('📧 开始测试邮件配置...');
  
  // 检查环境变量
  const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      console.error(`❌ 缺少环境变量: ${varName}`);
      return;
    }
  }
  
  console.log('✅ 环境变量检查通过');
  console.log(`📮 SMTP服务器: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`👤 发送邮箱: ${process.env.SMTP_USER}`);
  
  // 创建邮件传输器
  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  try {
    // 验证连接
    console.log('🔗 正在验证SMTP连接...');
    await transporter.verify();
    console.log('✅ SMTP连接验证成功！');
    
    // 发送测试邮件
    console.log('📤 正在发送测试邮件...');
    const info = await transporter.sendMail({
      from: `"${process.env.SENDER_NAME || 'AI博客系统'}" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER, // 发送给自己
      subject: '📧 邮件配置测试成功',
      html: `
        <h2>🎉 恭喜！邮件配置成功</h2>
        <p>您的163邮箱SMTP配置已经正确设置，可以正常发送邮件了。</p>
        <p><strong>配置信息：</strong></p>
        <ul>
          <li>SMTP服务器: ${process.env.SMTP_HOST}</li>
          <li>端口: ${process.env.SMTP_PORT}</li>
          <li>发送邮箱: ${process.env.SMTP_USER}</li>
        </ul>
        <p>现在您可以使用忘记密码和验证码登录功能了！</p>
      `
    });
    
    console.log('✅ 测试邮件发送成功！');
    console.log(`📧 邮件ID: ${info.messageId}`);
    console.log('🎉 邮件配置完全正确，请检查您的邮箱！');
    
  } catch (error) {
    console.error('❌ 邮件配置测试失败:');
    
    if (error.code === 'EAUTH') {
      console.error('🔐 认证失败：请检查邮箱地址和授权码是否正确');
      console.error('💡 提示：确保使用的是163邮箱的"客户端授权码"，不是登录密码');
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 连接失败：请检查网络连接和SMTP服务器地址');
    } else {
      console.error(`❌ 错误详情: ${error.message}`);
    }
  }
}

// 运行测试
testEmail().catch(console.error); 