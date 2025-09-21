import { describe, expect, it, vi } from 'vitest'
import { XssProtectionMiddleware } from './xss-protection.middleware'

const createRequest = (body: any = {}, overrides: Partial<any> = {}) => ({
  body,
  query: {},
  params: {},
  is: vi.fn().mockReturnValue(false),
  ...overrides,
})

describe('XssProtectionMiddleware', () => {
  it('sanitises string fields in body, query and params', () => {
    const middleware = new XssProtectionMiddleware()
    const req = createRequest(
      {
        message: '<script>alert("xss")</script>',
        nested: { comment: '<img src=x onerror=alert(1)>' },
      },
      {
        query: { q: '<svg onload=alert(1) />' },
        params: { id: '<script>alert(1)</script>' },
      },
    )

    middleware.use(req as any, {} as any, vi.fn())

    expect(req.body.message).not.toContain('<script>')
    expect(req.body.nested.comment).not.toContain('onerror')
    expect(req.query.q).not.toContain('<svg')
    expect(req.params.id).not.toContain('<script>')
  })

  it('skips sanitisation for multipart requests', () => {
    const middleware = new XssProtectionMiddleware()
    const req = createRequest({ message: '<script>attack</script>' }, {
      is: vi.fn().mockReturnValue(true),
    })
    const next = vi.fn()

    middleware.use(req as any, {} as any, next)

    expect(req.body.message).toBe('<script>attack</script>')
    expect(next).toHaveBeenCalled()
  })

  it('leaves non-string values untouched', () => {
    const middleware = new XssProtectionMiddleware()
    const req = createRequest({ count: 123, flags: [true, false] })

    middleware.use(req as any, {} as any, vi.fn())

    expect(req.body.count).toBe(123)
    expect(req.body.flags).toEqual([true, false])
  })
})
