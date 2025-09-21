import { ConfigService } from '@nestjs/config'
import { UnauthorizedException } from '@nestjs/common'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { CsrfMiddleware } from './csrf.middleware'
import { CsrfService } from '../services/csrf.service'

describe('CsrfMiddleware', () => {
  const configGet = vi.fn()
  const configService = { get: configGet } as unknown as ConfigService
  const csrfService = { validateToken: vi.fn() } as unknown as CsrfService
  let middleware: CsrfMiddleware
  const next = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    configGet.mockImplementation((_key: string, defaultValue: boolean) => defaultValue)
    middleware = new CsrfMiddleware(csrfService, configService)
  })

  const createRequest = (overrides: Partial<any> = {}) => ({
    method: 'POST',
    path: '/secure',
    headers: {},
    cookies: {},
    user: { id: 'user-1' },
    ...overrides,
  })

  it('skips validation when CSRF protection disabled', () => {
    configGet.mockReturnValue(false)
    const req = createRequest()
    middleware.use(req as any, {} as any, next)
    expect(next).toHaveBeenCalled()
    expect(csrfService.validateToken).not.toHaveBeenCalled()
  })

  it('skips safe HTTP methods', () => {
    configGet.mockReturnValue(true)
    const req = createRequest({ method: 'GET' })
    middleware.use(req as any, {} as any, next)
    expect(next).toHaveBeenCalled()
    expect(csrfService.validateToken).not.toHaveBeenCalled()
  })

  it('allows API docs path without validation', () => {
    configGet.mockReturnValue(true)
    const req = createRequest({ path: '/api/docs/index.html' })
    middleware.use(req as any, {} as any, next)
    expect(next).toHaveBeenCalled()
  })

  it('throws when header token missing', () => {
    configGet.mockReturnValue(true)
    const req = createRequest({ headers: {}, cookies: { 'XSRF-TOKEN': 'cookie-token' } })
    expect(() => middleware.use(req as any, {} as any, next)).toThrow(UnauthorizedException)
  })

  it('throws when CSRF cookie missing', () => {
    configGet.mockReturnValue(true)
    const req = createRequest({ headers: { 'x-xsrf-token': 'header-token' } })
    expect(() => middleware.use(req as any, {} as any, next)).toThrow(UnauthorizedException)
  })

  it('throws when tokens mismatch', () => {
    configGet.mockReturnValue(true)
    const req = createRequest({
      headers: { 'x-xsrf-token': 'header-token' },
      cookies: { 'XSRF-TOKEN': 'different' },
    })
    expect(() => middleware.use(req as any, {} as any, next)).toThrow(UnauthorizedException)
  })

  it('throws when user context missing', () => {
    configGet.mockReturnValue(true)
    const req = createRequest({
      headers: { 'x-xsrf-token': 'token' },
      cookies: { 'XSRF-TOKEN': 'token' },
      user: undefined,
    })
    expect(() => middleware.use(req as any, {} as any, next)).toThrow(UnauthorizedException)
  })

  it('throws when token validation fails', () => {
    configGet.mockReturnValue(true)
    ;(csrfService.validateToken as any).mockReturnValue(false)
    const req = createRequest({
      headers: { 'x-xsrf-token': 'token' },
      cookies: { 'XSRF-TOKEN': 'token' },
    })
    expect(() => middleware.use(req as any, {} as any, next)).toThrow(UnauthorizedException)
  })

  it('passes through when validation succeeds', () => {
    configGet.mockReturnValue(true)
    ;(csrfService.validateToken as any).mockReturnValue(true)
    const req = createRequest({
      headers: { 'x-xsrf-token': 'token' },
      cookies: { 'XSRF-TOKEN': 'token' },
    })
    middleware.use(req as any, {} as any, next)
    expect(csrfService.validateToken).toHaveBeenCalledWith('token', 'user-1')
    expect(next).toHaveBeenCalled()
  })
})
