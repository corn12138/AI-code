import { ExecutionContext } from '@nestjs/common'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { of, throwError } from 'rxjs'
import { lastValueFrom } from 'rxjs'
import { MetricsInterceptor } from './metrics.interceptor'
import { MetricsService } from '../../metrics/metrics.service'

describe('MetricsInterceptor', () => {
  const recordMock = vi.fn()
  const metricsService = { recordHttpRequest: recordMock } as unknown as MetricsService
  const interceptor = new MetricsInterceptor(metricsService)

  const createContext = (request: any, response: any): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  }) as unknown as ExecutionContext

  beforeEach(() => {
    recordMock.mockClear()
  })

  it('records metrics on successful responses', async () => {
    const request = {
      method: 'GET',
      url: '/api/users/42',
      headers: { host: 'example.com' },
      route: { path: '/api/users/:id' },
    }
    const response = { statusCode: 200 }
    const context = createContext(request, response)

    await lastValueFrom(interceptor.intercept(context, { handle: () => of({ ok: true }) }))

    expect(recordMock).toHaveBeenCalledTimes(1)
    const [method, routePattern, statusCode] = recordMock.mock.calls[0]
    expect(method).toBe('GET')
    expect(routePattern).toBe('/api/users/:id')
    expect(statusCode).toBe(200)
  })

  it('records metrics when handler throws', async () => {
    const request = {
      method: 'POST',
      url: '/api/users/99',
      headers: { host: 'example.com' },
      route: { path: '/api/users/:id' },
    }
    const response = { statusCode: 500 }
    const context = createContext(request, response)

    await expect(
      lastValueFrom(
        interceptor.intercept(context, {
          handle: () => throwError(() => Object.assign(new Error('fail'), { status: 400 })),
        }),
      ),
    ).rejects.toThrow('fail')

    expect(recordMock).toHaveBeenCalledTimes(1)
    const [method, routePattern, statusCode] = recordMock.mock.calls[0]
    expect(method).toBe('POST')
    expect(routePattern).toBe('/api/users/:id')
    expect(statusCode).toBe(400)
  })
})
