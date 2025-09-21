import { ArgumentsHost, BadRequestException, HttpStatus, Logger } from '@nestjs/common'
import { QueryFailedError } from 'typeorm'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { GlobalExceptionFilter } from './global-exception.filter'

describe('GlobalExceptionFilter', () => {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  const response = { status }
  const request = { url: '/test' }
  const host = {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost

  beforeEach(() => {
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => {})
    status.mockClear()
    json.mockClear()
  })

  it('formats HttpException responses', () => {
    const filter = new GlobalExceptionFilter()
    const exception = new BadRequestException('Invalid payload')

    filter.catch(exception, host)

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      code: 'Bad Request',
      message: 'Invalid payload',
      path: '/test',
    }))
  })

  it('handles database duplicate errors gracefully', () => {
    const filter = new GlobalExceptionFilter()
    const driverError = new Error('duplicate key value violates unique constraint')
    const exception = new QueryFailedError('INSERT', [], driverError)
    ;(exception as any).message = 'duplicate key value violates unique constraint'

    filter.catch(exception, host)

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'DUPLICATE_ERROR',
      message: '记录已存在，请勿重复创建',
    }))
  })

  it('falls back to internal error for unknown exceptions', () => {
    const filter = new GlobalExceptionFilter()
    const exception = new Error('Unexpected')

    filter.catch(exception, host)

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR)
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'INTERNAL_ERROR',
      message: '服务器内部错误',
    }))
  })
})
