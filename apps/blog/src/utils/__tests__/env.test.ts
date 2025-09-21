import { afterEach, describe, expect, it } from 'vitest'
import { requireEnv } from '../env'

const ORIGINAL_ENV = { ...process.env }

afterEach(() => {
  process.env = { ...ORIGINAL_ENV }
})

describe('utils/env', () => {
  it('returns the variable when present', () => {
    process.env.TEST_KEY = 'value'
    expect(requireEnv('TEST_KEY')).toBe('value')
  })

  it('throws default error when missing', () => {
    delete process.env.MISSING_KEY
    expect(() => requireEnv('MISSING_KEY')).toThrow('Environment variable MISSING_KEY is not configured')
  })

  it('throws custom error message when provided', () => {
    delete process.env.CUSTOM_KEY
    expect(() => requireEnv('CUSTOM_KEY', 'custom message')).toThrow('custom message')
  })
})
