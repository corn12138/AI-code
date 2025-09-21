import { CallHandler, ExecutionContext, Logger } from '@nestjs/common'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { of, throwError } from 'rxjs'
import { lastValueFrom } from 'rxjs'
import { TransformInterceptor } from './transform.interceptor'

describe('TransformInterceptor', () => {
  const loggerSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {})
  const warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {})

  const createContext = (request: any, response: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  }) as unknown as ExecutionContext

  beforeEach(() => {
    loggerSpy.mockClear()
    warnSpy.mockClear()
  })

  it('wraps responses and preserves request id header', async () => {
    const interceptor = new TransformInterceptor()
    const request = {
      headers: { 'x-request-id': 'trace-123' },
      method: 'GET',
      path: '/users',
    }
    const response = { statusCode: 200 }
    const context = createContext(request, response)
    const handler: CallHandler = { handle: () => of({ hello: 'world' }) }

    const result = await lastValueFrom(interceptor.intercept(context, handler))

    expect(result).toMatchObject({
      code: 0,
      message: '操作成功',
      data: { hello: 'world' },
      requestId: 'trace-123',
      path: '/users',
    })
    expect(request.requestId).toBe('trace-123')
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('GET /users 200 - '))
  })

  it('generates request id and warns on slow requests', async () => {
    const interceptor = new TransformInterceptor()
    const request = {
      headers: {},
      method: 'POST',
      path: '/slow',
    }
    const response = { statusCode: 201 }
    const context = createContext(request, response)
    const handler: CallHandler = { handle: () => of({ ok: true }) }

    const nowSpy = vi
      .spyOn(Date, 'now')
      .mockImplementationOnce(() => 1000)
      .mockImplementation(() => 1800)

    const result = await lastValueFrom(interceptor.intercept(context, handler))

    expect(result.requestId).toMatch(/^req_\d+/)
    expect(request.requestId).toBe(result.requestId)
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('慢请求警告'))
    expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('POST /slow 201 - '))

    nowSpy.mockRestore()
  })
})
