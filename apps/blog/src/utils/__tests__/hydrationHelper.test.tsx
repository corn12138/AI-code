import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NoSSR, isClientSide, useDelayedRender, useIsClient } from '../hydrationHelper.tsx'

describe('utils/hydrationHelper', () => {
  it('useIsClient toggles to true after mount', async () => {
    const { result } = renderHook(() => useIsClient())

    await waitFor(() => {
      expect(result.current).toBe(true)
    })
  })

  it('exposes isClientSide flag', () => {
    expect(isClientSide).toBe(true)
  })

  it('useDelayedRender respects provided delay', () => {
    vi.useFakeTimers()
    const { result } = renderHook(({ delay }) => useDelayedRender(delay), {
      initialProps: { delay: 200 },
    })

    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(result.current).toBe(false)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe(true)

    vi.useRealTimers()
  })

  it('NoSSR renders children only after client hydration', async () => {
    render(
      <NoSSR>
        <div data-testid="payload">payload</div>
      </NoSSR>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('payload')).toHaveTextContent('payload')
    })
  })
})
