import '@testing-library/jest-dom'
import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { TestDataCleaner, TestEnvironmentConfig } from './utils/test-data-optimizer'
import { testPerformanceMonitor } from './utils/test-performance'

// 设置测试环境配置
TestEnvironmentConfig.setConfig({
  mockApiDelay: 50, // 减少API延迟以提高测试速度
  enablePerformanceMonitoring: true,
  enableDetailedLogging: false,
  testTimeout: 5000, // 减少超时时间
})

// 全局测试设置
beforeAll(() => {
  // 设置全局测试环境
  console.log('🚀 开始测试套件执行')

  // 启用性能监控
  if (TestEnvironmentConfig.getConfig().enablePerformanceMonitoring) {
    console.log('📊 性能监控已启用')
  }
})

// 每个测试前的设置
beforeEach(() => {
  // 清理测试数据
  TestDataCleaner.cleanupAll()

  // 重置性能监控
  testPerformanceMonitor.clearMetrics()

  // 设置JSDOM环境
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn((cb: any) => setTimeout(cb, 0) as any)
  global.cancelAnimationFrame = vi.fn()

  // Mock ResizeObserver
  global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock IntersectionObserver
  global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))

  // Mock Performance API
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
  } as any

  // Mock Canvas API
  const mockCanvas = {
    getContext: vi.fn(() => ({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(() => ({ data: new Array(4) })),
      putImageData: vi.fn(),
      createImageData: vi.fn(() => ({ data: new Array(4) })),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    })),
    toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
    width: 100,
    height: 100,
  }

  // Mock HTMLCanvasElement
  Object.defineProperty(global, 'HTMLCanvasElement', {
    value: class {
      getContext = mockCanvas.getContext
      toDataURL = mockCanvas.toDataURL
      width = mockCanvas.width
      height = mockCanvas.height
    },
  })

  // Mock Image
  global.Image = vi.fn().mockImplementation(() => ({
    src: '',
    onload: null,
    onerror: null,
    width: 100,
    height: 100,
  }))

  // Mock fetch
  global.fetch = vi.fn()

  // Mock localStorage
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  // Mock sessionStorage
  const sessionStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }
  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
  })

  // Mock URL.createObjectURL
  global.URL.createObjectURL = vi.fn(() => 'mock-url')
  global.URL.revokeObjectURL = vi.fn()

  // Mock window.scrollTo
  global.scrollTo = vi.fn()

  // Mock window.resizeTo
  global.resizeTo = vi.fn()

  // Mock Next.js navigation
  vi.mock('next/navigation', () => ({
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  }))

  // Mock Next.js components
  vi.mock('next/image', () => ({
    default: ({ src, alt, ...props }: any) => {
      const React = require('react')
      return React.createElement('img', { src, alt, ...props })
    },
  }))

  vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => {
      const React = require('react')
      return React.createElement('a', { href, ...props }, children)
    },
  }))

  vi.mock('next/metadata', () => ({
    generateMetadata: vi.fn(),
  }))

  // Mock @shared/hooks
  vi.mock('@shared/hooks', () => ({
    useAuth: vi.fn(() => ({
      user: null,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      isAuthenticated: false,
    })),
    useUser: vi.fn(() => ({
      user: null,
      isLoading: false,
      error: null,
      updateUser: vi.fn(),
    })),
  }))

  // Mock console methods to reduce noise in tests
  const originalConsole = { ...console }
  global.console = {
    ...console,
    warn: vi.fn(),
    error: vi.fn(),
    log: vi.fn(),
  }

  // 恢复原始console方法（用于调试）
  if (TestEnvironmentConfig.getConfig().enableDetailedLogging) {
    global.console = originalConsole
  }
})

// 每个测试后的清理
afterEach(() => {
  // 清理测试数据
  TestDataCleaner.cleanupAll()

  // 清理所有模拟
  vi.clearAllMocks()

  // 清理DOM
  if (typeof document !== 'undefined') {
    document.body.innerHTML = ''
  }
})

// 全局测试清理
afterAll(() => {
  // 打印性能报告
  if (TestEnvironmentConfig.getConfig().enablePerformanceMonitoring) {
    testPerformanceMonitor.printPerformanceReport()
  }

  console.log('✅ 测试套件执行完成')
})

// 设置全局错误处理
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason)
})

// 设置全局超时
process.env.VITEST_TIMEOUT = '10000'

// 导出测试工具供测试文件使用
export {
  TestDataCleaner,
  TestEnvironmentConfig, testPerformanceMonitor
}

