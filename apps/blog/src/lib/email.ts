import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

// 邮件配置
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || 'smtp.163.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: parseInt(process.env.SMTP_PORT || '465') === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@163.com',
    pass: process.env.SMTP_PASS || 'your-smtp-password'
  }
};

// 邮件发送者信息
const SENDER_INFO = {
  name: process.env.SENDER_NAME || 'AI博客系统',
  email: process.env.SMTP_USER || 'your-email@163.com'
};

// 创建邮件传输器
const createTransporter = () => {
  return nodemailer.createTransport({
    host: EMAIL_CONFIG.host,
    port: EMAIL_CONFIG.port,
    secure: EMAIL_CONFIG.secure,
    auth: EMAIL_CONFIG.auth,
    connectionTimeout: 60000, // 连接超时60秒
    greetingTimeout: 30000,   // 握手超时30秒
    socketTimeout: 60000      // 数据传输超时60秒
  });
};

// 邮件模板接口
interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

// 邮件服务类
export class EmailService {
  private transporter: Mail;

  constructor() {
    this.transporter = createTransporter();
  }

  /**
   * 发送邮件
   */
  private async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: `"${SENDER_INFO.name}" <${SENDER_INFO.email}>`,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      });

      console.log('邮件发送成功:', info.messageId);
      return true;
    } catch (error) {
      console.error('邮件发送失败:', error);
      return false;
    }
  }

  /**
   * 发送验证码邮件
   */
  async sendVerificationCode(email: string, code: string, type: 'login' | 'reset'): Promise<boolean> {
    const template = this.getVerificationCodeTemplate(code, type);
    return this.sendEmail(email, template);
  }

  /**
   * 发送密码重置邮件
   */
  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
    const template = this.getPasswordResetTemplate(resetUrl);
    return this.sendEmail(email, template);
  }

  /**
   * 验证码邮件模板
   */
  private getVerificationCodeTemplate(code: string, type: 'login' | 'reset'): EmailTemplate {
    const isLogin = type === 'login';
    const purpose = isLogin ? '邮箱登录' : '密码重置';
    const instruction = isLogin ? '请在登录页面输入此验证码' : '请在重置密码页面输入此验证码';

    return {
      subject: `【AI博客系统】${purpose}验证码`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${purpose}验证码</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code-box { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 ${purpose}验证码</h1>
            </div>
            <div class="content">
              <p>您好！</p>
              <p>您正在进行${purpose}操作，${instruction}：</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ 安全提醒：</strong>
                <ul>
                  <li>验证码有效期为 10 分钟</li>
                  <li>验证码仅可使用一次</li>
                  <li>请勿将验证码泄露给他人</li>
                  <li>如非本人操作，请忽略此邮件</li>
                </ul>
              </div>
              
              <p>如果您没有进行此操作，请立即联系我们。</p>
            </div>
            <div class="footer">
              <p>此邮件由 AI博客系统 自动发送，请勿回复</p>
              <p>如有疑问，请访问我们的帮助中心</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        【AI博客系统】${purpose}验证码
        
        您的验证码是：${code}
        
        ${instruction}，验证码有效期为10分钟。
        
        如非本人操作，请忽略此邮件。
      `
    };
  }

  /**
   * 密码重置邮件模板
   */
  private getPasswordResetTemplate(resetUrl: string): EmailTemplate {
    return {
      subject: '【AI博客系统】密码重置链接',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>密码重置</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 密码重置</h1>
            </div>
            <div class="content">
              <p>您好！</p>
              <p>我们收到了您的密码重置请求。点击下面的按钮来重置您的密码：</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">重置密码</a>
              </div>
              
              <p>或者复制以下链接到浏览器中打开：</p>
              <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ 安全提醒：</strong>
                <ul>
                  <li>重置链接有效期为 1 小时</li>
                  <li>链接仅可使用一次</li>
                  <li>如非本人操作，请忽略此邮件</li>
                  <li>为了您的账户安全，请勿将此链接分享给他人</li>
                </ul>
              </div>
            </div>
            <div class="footer">
              <p>此邮件由 AI博客系统 自动发送，请勿回复</p>
              <p>如有疑问，请访问我们的帮助中心</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        【AI博客系统】密码重置
        
        您收到了一个密码重置请求。
        
        请访问以下链接重置您的密码：
        ${resetUrl}
        
        链接有效期为1小时，如非本人操作请忽略此邮件。
      `
    };
  }

  /**
   * 测试邮件连接
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('邮件服务连接正常');
      return true;
    } catch (error) {
      console.error('邮件服务连接失败:', error);
      return false;
    }
  }
}

// 验证码生成工具
export class VerificationCodeUtils {
  /**
   * 生成6位数字验证码
   */
  static generateCode(): string {
    return Math.random().toString().slice(-6).padStart(6, '0');
  }

  /**
   * 生成随机字符串（用于重置令牌）
   */
  static generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 计算过期时间
   */
  static getExpirationTime(minutes: number = 10): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}

// 导出默认实例
export const emailService = new EmailService(); 