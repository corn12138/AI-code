import { history } from 'umi'
import { nativeBridge } from '@/utils/nativeBridge'

/**
 * 智能返回：
 * - 有浏览历史：history.back()
 * - 原生容器且无历史：调用 nativeBridge.closeWebView()
 * - H5 环境无历史：跳转到 fallback 或首页
 */
export function safeBack(fallback: string = '/') {
  try {
    if (window.history.length > 1) {
      history.back()
      return
    }

    if (nativeBridge.isNativeEnvironment()) {
      nativeBridge.closeWebView().catch(() => {
        history.push(fallback)
      })
      return
    }

    history.push(fallback)
  } catch {
    history.push(fallback)
  }
}

