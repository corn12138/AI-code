import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AUTH_ERRORS, AuthError, AuthMiddleware, JWTUtils, PasswordUtils, type AuthUser } from '../auth';



// 模拟 bcryptjs
vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(),
        compare: vi.fn(),
    },
}))

// 模拟 jsonwebtoken
vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vi.fn(),
        verify: vi.fn(),
        decode: vi.fn(),
    },
}))

describe('auth', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('PasswordUtils', () => {
        describe('hashPassword', () => {
            it('应该正确哈希密码', async () => {
                const bcryptjs = await import('bcryptjs')
                const mockHash = vi.mocked(bcryptjs.default.hash)
                mockHash.mockResolvedValue('hashedPassword' as any)

                const result = await PasswordUtils.hashPassword('password123')

                expect(mockHash).toHaveBeenCalledWith('password123', 12)
                expect(result).toBe('hashedPassword')
            })

            it('应该处理哈希错误', async () => {
                const bcryptjs = await import('bcryptjs')
                const mockHash = vi.mocked(bcryptjs.default.hash)
                mockHash.mockRejectedValue(new Error('Hash error'))

                await expect(PasswordUtils.hashPassword('password123')).rejects.toThrow('Hash error')
            })
        })

        describe('verifyPassword', () => {
            it('应该正确验证密码', async () => {
                const bcryptjs = await import('bcryptjs')
                const mockCompare = vi.mocked(bcryptjs.default.compare)
                mockCompare.mockResolvedValue(true as any)

                const result = await PasswordUtils.verifyPassword('password123', 'hashedPassword')

                expect(mockCompare).toHaveBeenCalledWith('password123', 'hashedPassword')
                expect(result).toBe(true)
            })

            it('应该处理验证错误', async () => {
                const bcryptjs = await import('bcryptjs')
                const mockCompare = vi.mocked(bcryptjs.default.compare)
                mockCompare.mockRejectedValue(new Error('Compare error'))

                await expect(PasswordUtils.verifyPassword('password123', 'hashedPassword')).rejects.toThrow('Compare error')
            })
        })
    })

    describe('JWTUtils', () => {
        const mockUser: AuthUser = {
            id: '123',
            email: 'test@example.com',
            username: 'testuser',
            roles: ['user']
        }

        describe('generateAccessToken', () => {
            it('应该生成有效的访问令牌', async () => {
                const jwt = await import('jsonwebtoken')
                const mockSign = vi.mocked(jwt.default.sign)
                mockSign.mockReturnValue('mock.access.token' as any)

                const result = JWTUtils.generateAccessToken(mockUser)

                expect(mockSign).toHaveBeenCalledWith(
                    {
                        userId: '123',
                        email: 'test@example.com',
                        type: 'access'
                    },
                    expect.any(String),
                    { expiresIn: '15m' }
                )
                expect(result).toBe('mock.access.token')
            })
        })

        describe('generateRefreshToken', () => {
            it('应该生成有效的刷新令牌', async () => {
                const jwt = await import('jsonwebtoken')
                const mockSign = vi.mocked(jwt.default.sign)
                mockSign.mockReturnValue('mock.refresh.token' as any)

                const result = JWTUtils.generateRefreshToken(mockUser)

                expect(mockSign).toHaveBeenCalledWith(
                    {
                        userId: '123',
                        email: 'test@example.com',
                        type: 'refresh'
                    },
                    expect.any(String),
                    { expiresIn: '7d' }
                )
                expect(result).toBe('mock.refresh.token')
            })
        })

        describe('verifyToken', () => {
            it('应该验证有效的令牌', async () => {
                const jwt = await import('jsonwebtoken')
                const mockVerify = vi.mocked(jwt.default.verify)
                const mockPayload = { userId: '123', email: 'test@example.com', type: 'access' as const }
                mockVerify.mockReturnValue(mockPayload as any)

                const result = JWTUtils.verifyToken('valid.token')

                expect(mockVerify).toHaveBeenCalledWith('valid.token', expect.any(String))
                expect(result).toEqual(mockPayload)
            })

            it('应该处理无效令牌', async () => {
                const jwt = await import('jsonwebtoken')
                const mockVerify = vi.mocked(jwt.default.verify)
                mockVerify.mockImplementation(() => {
                    throw new Error('Invalid token')
                })

                const result = JWTUtils.verifyToken('invalid.token')

                expect(result).toBeNull()
            })
        })

        describe('generateTokenPair', () => {
            it('应该生成令牌对', async () => {
                const jwt = await import('jsonwebtoken')
                const mockSign = vi.mocked(jwt.default.sign)
                mockSign.mockReturnValueOnce('mock.access.token' as any)
                mockSign.mockReturnValueOnce('mock.refresh.token' as any)

                const result = JWTUtils.generateTokenPair(mockUser)

                expect(result).toEqual({
                    accessToken: 'mock.access.token',
                    refreshToken: 'mock.refresh.token'
                })
            })
        })
    })

    describe('AuthMiddleware', () => {
        describe('extractTokenFromHeader', () => {
            it('应该从Bearer头中提取令牌', () => {
                const result = AuthMiddleware.extractTokenFromHeader('Bearer test-token')
                expect(result).toBe('test-token')
            })

            it('应该处理无效的授权头', () => {
                const result = AuthMiddleware.extractTokenFromHeader('Invalid test-token')
                expect(result).toBeNull()
            })

            it('应该处理null授权头', () => {
                const result = AuthMiddleware.extractTokenFromHeader(null)
                expect(result).toBeNull()
            })
        })

        describe('hasPermission', () => {
            it('应该验证管理员权限', () => {
                expect(AuthMiddleware.hasPermission('admin', 'user')).toBe(true)
                expect(AuthMiddleware.hasPermission('admin', 'editor')).toBe(true)
                expect(AuthMiddleware.hasPermission('admin', 'admin')).toBe(true)
            })

            it('应该验证编辑者权限', () => {
                expect(AuthMiddleware.hasPermission('editor', 'user')).toBe(true)
                expect(AuthMiddleware.hasPermission('editor', 'editor')).toBe(true)
                expect(AuthMiddleware.hasPermission('editor', 'admin')).toBe(false)
            })

            it('应该验证用户权限', () => {
                expect(AuthMiddleware.hasPermission('user', 'user')).toBe(true)
                expect(AuthMiddleware.hasPermission('user', 'editor')).toBe(false)
                expect(AuthMiddleware.hasPermission('user', 'admin')).toBe(false)
            })
        })
    })

    describe('AuthError', () => {
        it('应该创建认证错误', () => {
            const error = new AuthError('Test error', 'TEST_ERROR', 400)
            expect(error.message).toBe('Test error')
            expect(error.code).toBe('TEST_ERROR')
            expect(error.status).toBe(400)
            expect(error.name).toBe('AuthError')
        })
    })

    describe('AUTH_ERRORS', () => {
        it('应该包含预定义的错误', () => {
            expect(AUTH_ERRORS.INVALID_TOKEN).toBeInstanceOf(AuthError)
            expect(AUTH_ERRORS.EXPIRED_TOKEN).toBeInstanceOf(AuthError)
            expect(AUTH_ERRORS.MISSING_TOKEN).toBeInstanceOf(AuthError)
            expect(AUTH_ERRORS.INSUFFICIENT_PERMISSION).toBeInstanceOf(AuthError)
            expect(AUTH_ERRORS.INVALID_CREDENTIALS).toBeInstanceOf(AuthError)
            expect(AUTH_ERRORS.USER_NOT_FOUND).toBeInstanceOf(AuthError)
            expect(AUTH_ERRORS.EMAIL_EXISTS).toBeInstanceOf(AuthError)
            expect(AUTH_ERRORS.USERNAME_EXISTS).toBeInstanceOf(AuthError)
        })
    })
})
