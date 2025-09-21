import { ConfigService } from '@nestjs/config'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import crypto from 'crypto'
import { CsrfService } from './csrf.service'

describe('CsrfService', () => {
  const getMock = vi.fn()
  const configService = { get: getMock } as unknown as ConfigService
  let service: CsrfService
  const secret = 'csrf-secret-key'

  beforeEach(() => {
    getMock.mockReset()
    getMock.mockReturnValue(secret)
    service = new CsrfService(configService)
  })

  it('generates token containing encoded payload', () => {
    const token = service.generateToken('user-123')
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    expect(decoded).toMatch(/user-123\|\d+\|/)
  })

  it('validates tokens produced by generateToken', () => {
    const token = service.generateToken('user-123')
    expect(service.validateToken(token, 'user-123')).toBe(true)
  })

  it('rejects tokens generated for other users', () => {
    const token = service.generateToken('user-123')
    expect(service.validateToken(token, 'different-user')).toBe(false)
  })

  it('rejects expired tokens', () => {
    const userId = 'user-123'
    const expires = Date.now() - 1000
    const data = `${userId}|${expires}`
    const signature = crypto.createHmac('sha256', secret).update(data).digest('base64')
    const token = Buffer.from(`${data}|${signature}`).toString('base64')

    expect(service.validateToken(token, userId)).toBe(false)
  })

  it('rejects tokens with invalid signature', () => {
    const userId = 'user-123'
    const expires = Date.now() + 1000
    const data = `${userId}|${expires}`
    const token = Buffer.from(`${data}|invalid-signature`).toString('base64')

    expect(service.validateToken(token, userId)).toBe(false)
  })
})
