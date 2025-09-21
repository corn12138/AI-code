import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('next/dynamic', () => {
  return {
    default: vi.fn(() => 'mock-component'),
  }
})

describe('utils/nextHelpers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('wraps component using next/dynamic with ssr disabled', async () => {
    const dynamic = (await import('next/dynamic')).default as unknown as ReturnType<typeof vi.fn>
    const { clientOnly } = await import('../nextHelpers')

    const Component = () => null
    const wrapped = clientOnly(Component)

    expect(dynamic).toHaveBeenCalledTimes(1)
    const [factory, options] = dynamic.mock.calls[0]
    expect(options).toEqual({ ssr: false })
    await expect(factory()).resolves.toBe(Component)
    expect(wrapped).toBe('mock-component')
  })
})
