import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DebugServer, DebugServerComponents, ServerRenderInfo } from '../debugServerComponents'

const ORIGINAL_ENV = process.env.NODE_ENV

describe('utils/debugServerComponents', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    process.env.NODE_ENV = ORIGINAL_ENV
  })

  it('renders plain children outside development', () => {
    process.env.NODE_ENV = 'test'
    render(
      <DebugServer componentName="Sample">
        <div data-testid="child">CONTENT</div>
      </DebugServer>,
    )

    const child = screen.getByTestId('child')
    expect(child).toBeInTheDocument()
    expect(child.parentElement).not.toHaveTextContent('服务器组件:')
  })

  it('renders debug wrapper in development', () => {
    process.env.NODE_ENV = 'development'
    render(
      <DebugServer componentName="Sample">
        <div data-testid="child">CONTENT</div>
      </DebugServer>,
    )

    expect(screen.getByText('服务器组件: Sample')).toBeInTheDocument()
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('ServerRenderInfo hides outside development', () => {
    process.env.NODE_ENV = 'test'
    const { container } = render(<ServerRenderInfo />)
    expect(container).toBeEmptyDOMElement()
  })

  it('ServerRenderInfo shows timestamp in development', () => {
    process.env.NODE_ENV = 'development'
    render(<ServerRenderInfo />)
    expect(screen.getByText(/服务器渲染时间/)).toBeInTheDocument()
  })

  it('DebugServerComponents logs useful information on mount', async () => {
    process.env.NODE_ENV = 'development'
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    render(
      <div>
        <button type="button">Click</button>
        <DebugServerComponents />
      </div>,
    )

    await waitFor(() => {
      expect(logSpy).toHaveBeenCalledWith('===开始检查服务器组件错误===')
    })

    expect(logSpy).toHaveBeenCalledWith('页面DOM结构:', expect.any(String))
    expect(logSpy).toHaveBeenCalledWith('找到 1 个按钮元素')
    expect(logSpy).toHaveBeenCalledWith('按钮 0:', expect.any(String))
  })
})
