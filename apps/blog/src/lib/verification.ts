import { VerificationCodeStatus, VerificationCodeType } from '@prisma/client';
import { emailService, VerificationCodeUtils } from './email';
import { prisma } from './prisma';

// 验证码服务类
export class VerificationCodeService {
    /**
     * 发送验证码
     */
    static async sendVerificationCode(
        email: string,
        type: VerificationCodeType,
        userId?: string
    ): Promise<{ success: boolean; message: string; code?: string }> {
        try {
            // 清理该邮箱的过期验证码
            await this.cleanupExpiredCodes(email, type);

            // 检查是否有未过期的验证码
            const existingCode = await prisma.verificationCode.findFirst({
                where: {
                    email: email.toLowerCase(),
                    type,
                    status: VerificationCodeStatus.PENDING,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });

            if (existingCode) {
                // 检查距离上次发送是否超过1分钟
                const timeDiff = Date.now() - existingCode.createdAt.getTime();
                const oneMinute = 60 * 1000;

                if (timeDiff < oneMinute) {
                    const remainingSeconds = Math.ceil((oneMinute - timeDiff) / 1000);
                    return {
                        success: false,
                        message: `请等待 ${remainingSeconds} 秒后再次发送验证码`
                    };
                }

                // 撤销旧验证码
                await prisma.verificationCode.update({
                    where: { id: existingCode.id },
                    data: {
                        status: VerificationCodeStatus.REVOKED,
                        revokedAt: new Date()
                    }
                });
            }

            // 生成新验证码
            const code = VerificationCodeUtils.generateCode();
            const expiresAt = VerificationCodeUtils.getExpirationTime(10); // 10分钟过期

            // 保存验证码到数据库
            const verificationCode = await prisma.verificationCode.create({
                data: {
                    code,
                    email: email.toLowerCase(),
                    type,
                    userId,
                    expiresAt,
                    status: VerificationCodeStatus.PENDING
                }
            });

            // 发送邮件
            const emailType = type === VerificationCodeType.EMAIL_LOGIN ? 'login' : 'reset';
            const emailSent = await emailService.sendVerificationCode(email, code, emailType);

            if (!emailSent) {
                // 如果邮件发送失败，删除验证码记录
                await prisma.verificationCode.delete({
                    where: { id: verificationCode.id }
                });

                return {
                    success: false,
                    message: '邮件发送失败，请稍后重试'
                };
            }

            return {
                success: true,
                message: '验证码发送成功',
                code: process.env.NODE_ENV === 'development' ? code : undefined // 开发环境返回验证码
            };

        } catch (error) {
            console.error('发送验证码失败:', error);
            return {
                success: false,
                message: '发送验证码失败，请稍后重试'
            };
        }
    }

    /**
     * 验证验证码
     */
    static async verifyCode(
        email: string,
        code: string,
        type: VerificationCodeType
    ): Promise<{ success: boolean; message: string; userId?: string }> {
        try {
            // 查找验证码
            const verificationCode = await prisma.verificationCode.findFirst({
                where: {
                    email: email.toLowerCase(),
                    code,
                    type,
                    status: VerificationCodeStatus.PENDING
                }
            });

            if (!verificationCode) {
                return {
                    success: false,
                    message: '验证码无效或已过期'
                };
            }

            // 检查是否过期
            if (verificationCode.expiresAt < new Date()) {
                await prisma.verificationCode.update({
                    where: { id: verificationCode.id },
                    data: { status: VerificationCodeStatus.EXPIRED }
                });

                return {
                    success: false,
                    message: '验证码已过期'
                };
            }

            // 检查尝试次数
            if (verificationCode.attempts >= verificationCode.maxAttempts) {
                await prisma.verificationCode.update({
                    where: { id: verificationCode.id },
                    data: { status: VerificationCodeStatus.REVOKED }
                });

                return {
                    success: false,
                    message: '验证码尝试次数过多，已失效'
                };
            }

            // 增加尝试次数
            await prisma.verificationCode.update({
                where: { id: verificationCode.id },
                data: {
                    attempts: verificationCode.attempts + 1
                }
            });

            // 验证成功
            await prisma.verificationCode.update({
                where: { id: verificationCode.id },
                data: {
                    status: VerificationCodeStatus.VERIFIED,
                    verifiedAt: new Date()
                }
            });

            return {
                success: true,
                message: '验证码验证成功',
                userId: verificationCode.userId || undefined
            };

        } catch (error) {
            console.error('验证验证码失败:', error);
            return {
                success: false,
                message: '验证失败，请稍后重试'
            };
        }
    }

    /**
     * 清理过期的验证码
     */
    static async cleanupExpiredCodes(email?: string, type?: VerificationCodeType): Promise<void> {
        try {
            const whereCondition: any = {
                expiresAt: {
                    lt: new Date()
                },
                status: {
                    in: [VerificationCodeStatus.PENDING, VerificationCodeStatus.EXPIRED]
                }
            };

            if (email) {
                whereCondition.email = email.toLowerCase();
            }

            if (type) {
                whereCondition.type = type;
            }

            await prisma.verificationCode.updateMany({
                where: whereCondition,
                data: {
                    status: VerificationCodeStatus.EXPIRED
                }
            });

        } catch (error) {
            console.error('清理过期验证码失败:', error);
        }
    }

    /**
     * 获取验证码统计信息
     */
    static async getCodeStats(email: string): Promise<{
        totalSent: number;
        pendingCount: number;
        lastSentAt?: Date;
    }> {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const stats = await prisma.verificationCode.aggregate({
                where: {
                    email: email.toLowerCase(),
                    createdAt: {
                        gte: today
                    }
                },
                _count: true
            });

            const pendingCodes = await prisma.verificationCode.count({
                where: {
                    email: email.toLowerCase(),
                    status: VerificationCodeStatus.PENDING,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });

            const lastCode = await prisma.verificationCode.findFirst({
                where: {
                    email: email.toLowerCase()
                },
                orderBy: {
                    createdAt: 'desc'
                },
                select: {
                    createdAt: true
                }
            });

            return {
                totalSent: stats._count,
                pendingCount: pendingCodes,
                lastSentAt: lastCode?.createdAt
            };

        } catch (error) {
            console.error('获取验证码统计失败:', error);
            return {
                totalSent: 0,
                pendingCount: 0
            };
        }
    }

    /**
     * 检查邮箱是否可以发送验证码（防止滥用）
     */
    static async canSendCode(email: string): Promise<{ canSend: boolean; reason?: string }> {
        try {
            const stats = await this.getCodeStats(email);

            // 每天最多发送10次验证码
            if (stats.totalSent >= 10) {
                return {
                    canSend: false,
                    reason: '今日验证码发送次数已达上限'
                };
            }

            // 检查是否有未过期的验证码
            if (stats.pendingCount > 0 && stats.lastSentAt) {
                const timeDiff = Date.now() - stats.lastSentAt.getTime();
                const oneMinute = 60 * 1000;

                if (timeDiff < oneMinute) {
                    const remainingSeconds = Math.ceil((oneMinute - timeDiff) / 1000);
                    return {
                        canSend: false,
                        reason: `请等待 ${remainingSeconds} 秒后再次发送`
                    };
                }
            }

            return { canSend: true };

        } catch (error) {
            console.error('检查发送权限失败:', error);
            return {
                canSend: false,
                reason: '系统错误，请稍后重试'
            };
        }
    }
}

// 密码重置服务
export class PasswordResetService {
    /**
     * 发送密码重置链接
     */
    static async sendResetLink(email: string): Promise<{ success: boolean; message: string }> {
        try {
            // 检查用户是否存在
            const user = await prisma.user.findUnique({
                where: { email: email.toLowerCase() }
            });

            if (!user) {
                // 为了安全起见，不透露用户是否存在
                return {
                    success: true,
                    message: '如果该邮箱已注册，您将收到重置密码的邮件'
                };
            }

            // 检查是否可以发送验证码
            const canSend = await VerificationCodeService.canSendCode(email);
            if (!canSend.canSend) {
                return {
                    success: false,
                    message: canSend.reason || '暂时无法发送验证码'
                };
            }

            // 生成重置令牌
            const resetToken = VerificationCodeUtils.generateToken();
            const expiresAt = VerificationCodeUtils.getExpirationTime(60); // 1小时过期

            // 保存重置令牌
            await prisma.verificationCode.create({
                data: {
                    code: resetToken,
                    email: email.toLowerCase(),
                    type: VerificationCodeType.PASSWORD_RESET,
                    userId: user.id,
                    expiresAt,
                    status: VerificationCodeStatus.PENDING
                }
            });

            // 生成重置链接
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

            // 发送邮件
            const emailSent = await emailService.sendPasswordResetEmail(email, resetUrl);

            if (!emailSent) {
                return {
                    success: false,
                    message: '邮件发送失败，请稍后重试'
                };
            }

            return {
                success: true,
                message: '密码重置链接已发送到您的邮箱'
            };

        } catch (error) {
            console.error('发送重置链接失败:', error);
            return {
                success: false,
                message: '发送失败，请稍后重试'
            };
        }
    }

    /**
     * 验证重置令牌
     */
    static async verifyResetToken(email: string, token: string): Promise<{
        success: boolean;
        message: string;
        userId?: string;
    }> {
        try {
            const verificationCode = await prisma.verificationCode.findFirst({
                where: {
                    email: email.toLowerCase(),
                    code: token,
                    type: VerificationCodeType.PASSWORD_RESET,
                    status: VerificationCodeStatus.PENDING,
                    expiresAt: {
                        gt: new Date()
                    }
                }
            });

            if (!verificationCode) {
                return {
                    success: false,
                    message: '重置链接无效或已过期'
                };
            }

            return {
                success: true,
                message: '令牌验证成功',
                userId: verificationCode.userId || undefined
            };

        } catch (error) {
            console.error('验证重置令牌失败:', error);
            return {
                success: false,
                message: '验证失败，请稍后重试'
            };
        }
    }

    /**
     * 重置密码
     */
    static async resetPassword(
        email: string,
        token: string,
        newPassword: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            // 验证令牌
            const tokenVerification = await this.verifyResetToken(email, token);
            if (!tokenVerification.success) {
                return tokenVerification;
            }

            const userId = tokenVerification.userId;
            if (!userId) {
                return {
                    success: false,
                    message: '无效的重置请求'
                };
            }

            // 导入密码工具
            const { PasswordUtils } = await import('./auth');

            // 加密新密码
            const hashedPassword = await PasswordUtils.hashPassword(newPassword);

            // 更新用户密码
            await prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword }
            });

            // 标记令牌为已使用
            await prisma.verificationCode.updateMany({
                where: {
                    email: email.toLowerCase(),
                    type: VerificationCodeType.PASSWORD_RESET,
                    status: VerificationCodeStatus.PENDING
                },
                data: {
                    status: VerificationCodeStatus.VERIFIED,
                    verifiedAt: new Date()
                }
            });

            return {
                success: true,
                message: '密码重置成功'
            };

        } catch (error) {
            console.error('重置密码失败:', error);
            return {
                success: false,
                message: '重置失败，请稍后重试'
            };
        }
    }
} 