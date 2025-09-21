import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { type AuthUser, AUTH_ERRORS, AuthError, AuthMiddleware, JWTUtils } from '../auth'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

const { prisma } = await import('@/lib/prisma')
const prismaMock = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>
  }
}

import * as apiAuth from '../api-auth'

const {
  validateMethod,
  createApiResponse,
  handleApiError,
  parseRequestBody,
  validateFields,
  validateEmail,
  validatePassword,
  requireAuth,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireEditor,
  getCurrentUser,
  getCurrentUserId,
  handleAuthError,
  withAuth,
  withOptionalAuth,
  checkResourceOwnership,
} = apiAuth

type MockHeaders = Record<string, string>

function createRequest({
  method = 'GET',
  headers = {},
  jsonBody,
  formBody,
}: {
  method?: string
  headers?: MockHeaders
  jsonBody?: any
  formBody?: Record<string, any>
} = {}) {
  const headerMap = new Map<string, string>()
  Object.entries(headers).forEach(([key, value]) => {
    headerMap.set(key.toLowerCase(), value)
  })

  return {
    method,
    headers: {
      get: (key: string) => headerMap.get(key.toLowerCase()) ?? null,
    },
    json: vi.fn(async () => {
      if (jsonBody instanceof Error) {
        throw jsonBody
      }
      return jsonBody
    }),
    formData: vi.fn(async () => {
      const data = formBody ?? {}
      return {
        forEach: (callback: (value: any, key: string) => void) => {
          Object.entries(data).forEach(([key, value]) => callback(value, key))
        },
      }
    }),
  }
}

const mockUser: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'tester',
  roles: ['user'],
}

beforeEach(() => {
  vi.clearAllMocks()
  prismaMock.user.findUnique.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('api-auth utils', () => {
  describe('validateMethod', () => {
    it('allows supported methods', () => {
      const request = createRequest({ method: 'POST' })
      expect(() => validateMethod(request as any, ['POST', 'GET'])).not.toThrow()
    })

    it('throws for unsupported methods', () => {
      const request = createRequest({ method: 'DELETE' })
      expect(() => validateMethod(request as any, ['GET'])).toThrow('Method DELETE not allowed')
    })
  })

  describe('createApiResponse', () => {
    it('serialises payload with default status', async () => {
      const response = createApiResponse({ ok: true })
      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('application/json')
      await expect(response.json()).resolves.toEqual({ ok: true })
    })

    it('supports custom status codes', () => {
      const response = createApiResponse({ error: 'bad' }, 400)
      expect(response.status).toBe(400)
    })
  })

  describe('handleApiError', () => {
    it('handles AuthError instances', async () => {
      const error = new AuthError('Missing token', 'MISSING_TOKEN', 401)
      const response = handleApiError(error)
      expect(response.status).toBe(401)
      await expect(response.json()).resolves.toEqual({
        error: 'Missing token',
        code: 'MISSING_TOKEN',
      })
    })

    it('maps Prisma duplicate errors to conflict', async () => {
      const prismaError = Object.assign(new Error('duplicate'), {
        name: 'PrismaClientKnownRequestError',
        code: 'P2002',
      })
      const response = handleApiError(prismaError)
      expect(response.status).toBe(409)
      await expect(response.json()).resolves.toEqual({
        error: 'Resource already exists',
        code: 'DUPLICATE_RESOURCE',
      })
    })

    it('falls back to internal error for unknown issues', async () => {
      const response = handleApiError('boom')
      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({
        error: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      })
    })
  })

  describe('parseRequestBody', () => {
    it('parses JSON body when content-type is json', async () => {
      const request = createRequest({
        headers: { 'content-type': 'application/json' },
        jsonBody: { foo: 'bar' },
      })

      await expect(parseRequestBody(request as any)).resolves.toEqual({ foo: 'bar' })
      expect(request.json).toHaveBeenCalled()
    })

    it('builds object from form data when content-type is form', async () => {
      const request = createRequest({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        formBody: { foo: 'bar', baz: 'qux' },
      })

      await expect(parseRequestBody(request as any)).resolves.toEqual({ foo: 'bar', baz: 'qux' })
      expect(request.formData).toHaveBeenCalled()
    })

    it('throws a friendly error when parsing fails', async () => {
      const request = createRequest({
        headers: { 'content-type': 'application/json' },
        jsonBody: new Error('Invalid JSON'),
      })

      await expect(parseRequestBody(request as any)).rejects.toThrow('Invalid request body format')
    })
  })

  describe('validateFields', () => {
    it('throws when required fields are missing', () => {
      expect(() => validateFields({ foo: 'bar' }, ['foo', 'baz'])).toThrow('Missing required fields: baz')
    })

    it('passes when all fields exist', () => {
      expect(() => validateFields({ foo: 'bar', baz: 'qux' }, ['foo', 'baz'])).not.toThrow()
    })
  })

  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('bad-email')).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('enforces length and complexity rules', () => {
      expect(validatePassword('Short1')).toEqual({ valid: false, message: 'Password must be at least 8 characters long' })
      expect(validatePassword('VeryLongPassword'.repeat(10))).toEqual({ valid: false, message: 'Password must be no more than 128 characters long' })
      expect(validatePassword('alllowercase1')).toEqual({
        valid: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      })
      expect(validatePassword('ValidPass1')).toEqual({ valid: true })
    })
  })
})

describe('authentication flows', () => {
  const token = 'mock.token'
  const payload = { userId: 'user-1', email: 'test@example.com', type: 'access' as const }

  beforeEach(() => {
    vi.spyOn(AuthMiddleware, 'extractTokenFromHeader').mockReturnValue(token)
    vi.spyOn(JWTUtils, 'verifyToken').mockReturnValue(payload)
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'tester',
      roles: ['user'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  })

  it('requireAuth returns user info when token is valid', async () => {
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    const user = await requireAuth(request as any)
    expect(AuthMiddleware.extractTokenFromHeader).toHaveBeenCalledWith('Bearer mock')
    expect(JWTUtils.verifyToken).toHaveBeenCalledWith(token)
    expect(user).toEqual(mockUser)
  })

  it('requireAuth throws when no token is provided', async () => {
    vi.mocked(AuthMiddleware.extractTokenFromHeader).mockReturnValue(null)
    const request = createRequest({ headers: {} })
    await expect(requireAuth(request as any)).rejects.toBe(AUTH_ERRORS.MISSING_TOKEN)
  })

  it('requireAuth throws when user cannot be found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(requireAuth(request as any)).rejects.toBe(AUTH_ERRORS.USER_NOT_FOUND)
  })

  it('optionalAuth returns null when requireAuth fails', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    const request = createRequest()
    const user = await optionalAuth(request as any)
    expect(user).toBeNull()
  })

  it('requireRole rejects when user lacks permissions', async () => {
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(requireRole(request as any, 'admin')).rejects.toBe(AUTH_ERRORS.INSUFFICIENT_PERMISSION)
  })

  it('requireRole allows users with needed role', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'tester',
      roles: ['admin'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(requireRole(request as any, 'admin')).resolves.toEqual({
      ...mockUser,
      roles: ['admin'],
    })
  })

  it('requireAdmin resolves for admin roles', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'tester',
      roles: ['admin'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(requireAdmin(request as any)).resolves.toEqual({
      ...mockUser,
      roles: ['admin'],
    })
  })

  it('requireEditor resolves for editor roles', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'tester',
      roles: ['editor'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(requireEditor(request as any)).resolves.toEqual({
      ...mockUser,
      roles: ['editor'],
    })
  })

  it('getCurrentUserId returns id from authenticated user', async () => {
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(getCurrentUserId(request as any)).resolves.toBe('user-1')
  })

  it('getCurrentUser returns user object', async () => {
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(getCurrentUser(request as any)).resolves.toEqual(mockUser)
  })

  it('handleAuthError serialises AuthError instances', async () => {
    const response = handleAuthError(AUTH_ERRORS.INVALID_TOKEN)
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    })
  })

  it('handleAuthError falls back to 500 for unknown errors', async () => {
    const response = handleAuthError(new Error('boom'))
    expect(response.status).toBe(500)
  })

  it('withAuth injects authenticated user into handler', async () => {
    const handler = vi.fn(async (_req: any, user: AuthUser) => createApiResponse({ user }))
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    const response = await withAuth(handler)(request as any)
    expect(handler).toHaveBeenCalledWith(request, mockUser)
    await expect(response.json()).resolves.toEqual({ user: mockUser })
  })

  it('withAuth returns error response when auth fails', async () => {
    const handler = vi.fn()
    vi.mocked(AuthMiddleware.extractTokenFromHeader).mockReturnValueOnce(null)
    const response = await withAuth(handler)(createRequest() as any)
    expect(handler).not.toHaveBeenCalled()
    expect(response.status).toBe(401)
  })

  it('withOptionalAuth passes null when auth fails', async () => {
    const handler = vi.fn(async (_req: any, user: AuthUser | null) => createApiResponse({ user }))
    vi.mocked(AuthMiddleware.extractTokenFromHeader).mockReturnValueOnce(null)
    const response = await withOptionalAuth(handler)(createRequest() as any)
    expect(handler).toHaveBeenCalledWith(expect.anything(), null)
    await expect(response.json()).resolves.toEqual({ user: null })
  })

  it('checkResourceOwnership allows owners', async () => {
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(checkResourceOwnership(request as any, 'user-1')).resolves.toEqual(mockUser)
  })

  it('checkResourceOwnership allows privileged roles', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      username: 'tester',
      roles: ['admin'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(checkResourceOwnership(request as any, 'other-user')).resolves.toEqual({
      ...mockUser,
      roles: ['admin'],
    })
  })

  it('checkResourceOwnership throws for insufficient permission', async () => {
    const request = createRequest({ headers: { authorization: 'Bearer mock' } })
    await expect(checkResourceOwnership(request as any, 'other-user')).rejects.toBe(
      AUTH_ERRORS.INSUFFICIENT_PERMISSION,
    )
  })
})
