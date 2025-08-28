// 环境变量检查脚本
require('dotenv').config();

console.log('🔍 检查邮件相关环境变量...\n');

const requiredVars = {
    'SMTP_HOST': process.env.SMTP_HOST,
    'SMTP_PORT': process.env.SMTP_PORT,
    'SMTP_USER': process.env.SMTP_USER,
    'SMTP_PASS': process.env.SMTP_PASS,
    'SENDER_NAME': process.env.SENDER_NAME
};

let hasErrors = false;

for (const [varName, value] of Object.entries(requiredVars)) {
    if (!value) {
        console.log(`❌ ${varName}: 未设置`);
        hasErrors = true;
    } else if (varName === 'SMTP_PASS') {
        // 隐藏密码，只显示长度
        console.log(`✅ ${varName}: 已设置 (长度: ${value.length}位)`);
    } else if (varName === 'SMTP_USER') {
        // 检查邮箱格式
        if (value.includes('@163.com')) {
            console.log(`✅ ${varName}: ${value}`);
        } else {
            console.log(`⚠️  ${varName}: ${value} (不是163邮箱)`);
        }
    } else {
        console.log(`✅ ${varName}: ${value}`);
    }
}

// 检查SMTP配置
if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    console.log('\n📋 SMTP配置总结:');
    console.log(`   服务器: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);

    if (process.env.SMTP_HOST === 'smtp.163.com' && process.env.SMTP_PORT === '587') {
        console.log('✅ 163邮箱SMTP配置正确');
    } else {
        console.log('⚠️  SMTP配置可能不适用于163邮箱');
        console.log('   建议: SMTP_HOST="smtp.163.com", SMTP_PORT="587"');
    }
}

if (hasErrors) {
    console.log('\n❌ 发现配置问题，请检查.env文件');
    console.log('\n💡 参考配置:');
    console.log('SMTP_HOST="smtp.163.com"');
    console.log('SMTP_PORT="587"');
    console.log('SMTP_USER="你的邮箱@163.com"');
    console.log('SMTP_PASS="你的163邮箱授权码"');
} else {
    console.log('\n✅ 环境变量配置完整');
}

console.log('\n📝 注意事项:');
console.log('1. SMTP_PASS 必须是163邮箱的"客户端授权码"，不是登录密码');
console.log('2. 需要在163邮箱设置中开启SMTP服务');
console.log('3. 授权码通常是6-16位的字母数字组合'); 