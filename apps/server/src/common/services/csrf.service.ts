import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CsrfService {
  constructor(private configService: ConfigService) {}

  /**
   * 生成CSRF令牌
   */
  generateToken(userId: string): string {
    const secret = this.configService.get<string>('security.csrfSecret') || 'csrf-secret-key';
    const expires = Date.now() + 24 * 60 * 60 * 1000; // 24小时过期
    const data = `${userId}|${expires}`;
    
    // 使用HMAC创建签名
    const hmac = crypto.createHmac('sha256', secret);
    const signature = hmac.update(data).digest('base64');
    
    // 返回格式: base64(userId|expiryTime|signature)
    return Buffer.from(`${data}|${signature}`).toString('base64');
  }

  /**
   * 验证CSRF令牌
   */
  validateToken(token: string, userId: string): boolean {
    try {
      // 解码token
      const decoded = Buffer.from(token, 'base64').toString();
      const [tokenUserId, expiresStr, signature] = decoded.split('|');
      
      // 验证用户ID
      if (tokenUserId !== userId) {
        return false;
      }
      
      // 验证是否过期
      const expires = parseInt(expiresStr, 10);
      if (Date.now() > expires) {
        return false;
      }
      
      // 重新计算签名并比较
      const secret = this.configService.get<string>('security.csrfSecret') || 'csrf-secret-key';
      const data = `${userId}|${expires}`;
      const hmac = crypto.createHmac('sha256', secret);
      const expectedSignature = hmac.update(data).digest('base64');
      
      return signature === expectedSignature;
    } catch (error) {
      return false;
    }
  }
}
