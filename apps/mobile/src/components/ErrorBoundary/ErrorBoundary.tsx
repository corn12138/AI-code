/**
 * 错误边界组件
 * 捕获和处理React组件渲染错误
 */

import { Button, Card, Space } from 'antd-mobile'
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { appConfig } from '../../config/env'
import './ErrorBoundary.css'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo })

        // 调用自定义错误处理函数
        this.props.onError?.(error, errorInfo)

        // 在开发环境下输出详细错误信息
        if (appConfig.isDev) {
            console.group('🚨 Error Boundary Caught Error')
            console.error('Error:', error)
            console.error('Error Info:', errorInfo)
            console.error('Component Stack:', errorInfo.componentStack)
            console.groupEnd()
        }

        // 在生产环境下可以将错误上报到监控服务
        if (appConfig.isProd) {
            this.reportError(error, errorInfo)
        }
    }

    private reportError = (error: Error, errorInfo: ErrorInfo) => {
        // 这里可以集成错误监控服务，如 Sentry
        const errorReport = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        }

        // 示例：发送到错误监控服务
        // errorMonitoringService.captureException(errorReport)

        console.error('Error reported:', errorReport)
    }

    private handleReload = () => {
        window.location.reload()
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    private handleGoHome = () => {
        window.location.href = '/'
    }

    render() {
        if (this.state.hasError) {
            // 自定义fallback UI
            if (this.props.fallback) {
                return this.props.fallback
            }

            // 默认错误UI
            return (
                <div className="error-boundary">
                    <div className="error-boundary-content">
                        <Card className="error-card">
                            <div className="error-icon">
                                <div className="error-emoji">😵</div>
                            </div>

                            <div className="error-text">
                                <h2>哎呀，出错了！</h2>
                                <p className="error-message">
                                    很抱歉，应用遇到了一个意外错误。
                                    {appConfig.isDev && this.state.error && (
                                        <>
                                            <br />
                                            <span className="error-details">
                                                错误信息: {this.state.error.message}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>

                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Button
                                    color="primary"
                                    size="large"
                                    block
                                    onClick={this.handleReset}
                                >
                                    重试
                                </Button>

                                <Button
                                    color="default"
                                    size="large"
                                    block
                                    onClick={this.handleReload}
                                >
                                    刷新页面
                                </Button>

                                <Button
                                    color="default"
                                    size="large"
                                    block
                                    onClick={this.handleGoHome}
                                >
                                    返回首页
                                </Button>
                            </Space>

                            {appConfig.isDev && this.state.error && (
                                <details className="error-details-dev">
                                    <summary>开发者信息</summary>
                                    <pre className="error-stack">
                                        {this.state.error.stack}
                                    </pre>
                                    {this.state.errorInfo && (
                                        <pre className="error-component-stack">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    )}
                                </details>
                            )}
                        </Card>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// HOC版本的错误边界
export const withErrorBoundary = <P extends object>(
    Component: React.ComponentType<P>,
    fallback?: ReactNode,
    onError?: (error: Error, errorInfo: ErrorInfo) => void
) => {
    const WrappedComponent = (props: P) => (
        <ErrorBoundary fallback={fallback} onError={onError}>
            <Component {...props} />
        </ErrorBoundary>
    )

    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

    return WrappedComponent
}

export default ErrorBoundary
