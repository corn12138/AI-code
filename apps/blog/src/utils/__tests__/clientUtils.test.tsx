import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@corn12138/hooks', () => ({
  useClientSide: vi.fn(),
}))

const { useClientSide } = await import('@corn12138/hooks')
const mockedUseClientSide = vi.mocked(useClientSide)

describe('utils/clientUtils', () => {
  beforeEach(() => {
    mockedUseClientSide.mockReset()
    mockedUseClientSide.mockReturnValue(true)
    localStorage.clear()
  })

  it('exposes isClient and safeWindow flags in browser-like environment', async () => {
    const utils = await import('../clientUtils')
    expect(utils.isClient).toBe(true)
    expect(utils.safeWindow).toBeDefined()
    expect(utils.safeWindow).toBe(window)
  })

  it('useClientOnly returns callback value when client is ready', async () => {
    const utils = await import('../clientUtils')
    const callback = vi.fn(() => 'ready')

    const { result } = renderHook(() => utils.useClientOnly(callback))

    await waitFor(() => {
      expect(result.current).toBe('ready')
    })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('useClientOnly stays null when client flag is false', async () => {
    mockedUseClientSide.mockReturnValue(false)
    const utils = await import('../clientUtils')

    const { result } = renderHook(() => utils.useClientOnly(() => 'value'))

    expect(result.current).toBeNull()
  })

  it('useSafeDateTime publishes ISO string only for client', async () => {
    const utils = await import('../clientUtils')

    const { result } = renderHook(() => utils.useSafeDateTime())
    await waitFor(() => {
      expect(result.current).toMatch(/\d{4}-\d{2}-\d{2}T/)
    })
  })

  it('useWindowSize tracks window resize events once mounted', async () => {
    const utils = await import('../clientUtils')

    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 800 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 600 })

    const { result } = renderHook(() => utils.useWindowSize())

    await waitFor(() => {
      expect(result.current).toEqual({ width: 800, height: 600 })
    })

    act(() => {
      Object.assign(window, { innerWidth: 1024, innerHeight: 768 })
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toEqual({ width: 1024, height: 768 })
  })

  it('ClientOnly renders fallback until mounted', async () => {
    const utils = await import('../clientUtils')

    render(
      <utils.ClientOnly fallback={<span data-testid="fallback">loading</span>}>
        <div data-testid="content">done</div>
      </utils.ClientOnly>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('content')).toHaveTextContent('done')
    })
    expect(screen.queryByTestId('fallback')).toBeNull()
  })

  it('storage helpers proxy localStorage safely', async () => {
    const utils = await import('../clientUtils')

    const store = new Map<string, string>()
    const getSpy = vi.spyOn(window.localStorage, 'getItem').mockImplementation((key: string) => {
      return store.has(key) ? store.get(key)! : null
    })
    const setSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation((key: string, value: string) => {
      store.set(key, value)
      return undefined as any
    })
    const removeSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation((key: string) => {
      store.delete(key)
      return undefined as any
    })

    expect(utils.storage.setItem('key', 'value')).toBe(true)
    expect(utils.storage.getItem('key')).toBe('value')

    expect(utils.storage.removeItem('key')).toBe(true)
    expect(utils.storage.getItem('key')).toBeNull()

    getSpy.mockRestore()
    setSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('storage helpers swallow localStorage errors', async () => {
    const utils = await import('../clientUtils')

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const getSpy = vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
      throw new Error('boom')
    })
    expect(utils.storage.getItem('key')).toBeNull()
    expect(errorSpy).toHaveBeenCalledWith('获取本地存储失败:', expect.any(Error))

    getSpy.mockRestore()

    const setSpy = vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('boom')
    })
    expect(utils.storage.setItem('key', 'value')).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith('设置本地存储失败:', expect.any(Error))

    setSpy.mockRestore()

    const removeSpy = vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
      throw new Error('boom')
    })
    expect(utils.storage.removeItem('key')).toBe(false)
    expect(errorSpy).toHaveBeenCalledWith('移除本地存储失败:', expect.any(Error))

    removeSpy.mockRestore()
    errorSpy.mockRestore()
  })
})
