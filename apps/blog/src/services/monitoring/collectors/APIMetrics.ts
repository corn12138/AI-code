'use client';

import { MetricCollector } from '../core/MonitoringManager';

// API metrics collector for monitoring HTTP requests
export class APIMetricsCollector extends MetricCollector {
    private activeRequests = new Map<string, { startTime: number; url: string; method: string }>();
    private originalFetch?: typeof fetch;
    private originalXHR?: typeof XMLHttpRequest;

    getName(): string {
        return 'api_metrics';
    }

    async start(): Promise<void> {
        await super.start();
        this.interceptNetworkRequests();
    }

    async stop(): Promise<void> {
        await super.stop();
        this.restoreNetworkRequests();
    }

    async collect(): Promise<void> {
        // Record active requests count
        this.recordMetric({
            name: 'api.active_requests',
            value: this.activeRequests.size,
            type: 'gauge',
            tags: { type: 'api' }
        });
    }

    private interceptNetworkRequests(): void {
        this.interceptFetch();
        this.interceptXHR();
    }

    private interceptFetch(): void {
        if (!window.fetch) return;

        this.originalFetch = window.fetch;

        window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const url = typeof input === 'string' ? input : input.toString();
            const method = init?.method || 'GET';
            const requestId = this.generateRequestId();

            // Record request start
            this.activeRequests.set(requestId, {
                startTime: Date.now(),
                url,
                method
            });

            this.recordMetric({
                name: 'api.request_started',
                value: 1,
                type: 'counter',
                tags: {
                    type: 'api',
                    method: method.toUpperCase(),
                    url: this.sanitizeUrl(url)
                }
            });

            try {
                const response = await this.originalFetch!(input, init);

                // Record successful response
                this.recordRequestComplete(requestId, response.status, null);

                return response;
            } catch (error) {
                // Record failed response
                this.recordRequestComplete(requestId, 0, error as Error);
                throw error;
            }
        };
    }

    private interceptXHR(): void {
        if (!window.XMLHttpRequest) return;

        this.originalXHR = window.XMLHttpRequest;
        const collector = this;

        window.XMLHttpRequest = function () {
            const xhr = new collector.originalXHR!();
            const originalOpen = xhr.open;
            const originalSend = xhr.send;

            let requestId: string;
            let method: string;
            let url: string;

            xhr.open = function (methodParam: string, urlParam: string | URL, ...args: any[]) {
                method = methodParam;
                url = urlParam.toString();
                requestId = collector.generateRequestId();

                return originalOpen.apply(this, [methodParam, urlParam, ...args] as any);
            };

            xhr.send = function (body?: Document | XMLHttpRequestBodyInit | null) {
                // Record request start
                collector.activeRequests.set(requestId, {
                    startTime: Date.now(),
                    url,
                    method
                });

                collector.recordMetric({
                    name: 'api.request_started',
                    value: 1,
                    type: 'counter',
                    tags: {
                        type: 'api',
                        method: method.toUpperCase(),
                        url: collector.sanitizeUrl(url)
                    }
                });

                // Handle completion
                const originalOnReadyStateChange = this.onreadystatechange;

                this.onreadystatechange = function () {
                    if (this.readyState === 4) {
                        const error = this.status === 0 ? new Error('Network Error') : null;
                        collector.recordRequestComplete(requestId, this.status, error);
                    }

                    if (originalOnReadyStateChange) {
                        originalOnReadyStateChange.apply(this, arguments as any);
                    }
                };

                return originalSend.apply(this, arguments as any);
            };

            return xhr;
        };

        // Copy static properties
        Object.setPrototypeOf(window.XMLHttpRequest, this.originalXHR);
        Object.getOwnPropertyNames(this.originalXHR).forEach(prop => {
            if (typeof (this.originalXHR as any)[prop] !== 'function') {
                (window.XMLHttpRequest as any)[prop] = (this.originalXHR as any)[prop];
            }
        });
    }

    private recordRequestComplete(requestId: string, status: number, error: Error | null): void {
        const request = this.activeRequests.get(requestId);
        if (!request) return;

        const duration = Date.now() - request.startTime;
        this.activeRequests.delete(requestId);

        // Record request duration
        this.recordMetric({
            name: 'api.request_duration',
            value: duration,
            type: 'histogram',
            unit: 'ms',
            tags: {
                type: 'api',
                method: request.method.toUpperCase(),
                url: this.sanitizeUrl(request.url),
                status: status.toString(),
                status_class: this.getStatusClass(status)
            }
        });

        // Record request completion
        this.recordMetric({
            name: 'api.request_completed',
            value: 1,
            type: 'counter',
            tags: {
                type: 'api',
                method: request.method.toUpperCase(),
                url: this.sanitizeUrl(request.url),
                status: status.toString(),
                status_class: this.getStatusClass(status),
                success: error ? 'false' : 'true'
            }
        });

        // Record errors
        if (error) {
            this.recordMetric({
                name: 'api.request_error',
                value: 1,
                type: 'counter',
                tags: {
                    type: 'api',
                    method: request.method.toUpperCase(),
                    url: this.sanitizeUrl(request.url),
                    error_type: error.name,
                    error_message: error.message
                }
            });
        }

        // Record response time buckets
        this.recordResponseTimeBuckets(duration, request.method, request.url);
    }

    private recordResponseTimeBuckets(duration: number, method: string, url: string): void {
        const buckets = [
            { threshold: 100, name: 'fast' },
            { threshold: 500, name: 'medium' },
            { threshold: 1000, name: 'slow' },
            { threshold: 5000, name: 'very_slow' }
        ];

        for (const bucket of buckets) {
            if (duration <= bucket.threshold) {
                this.recordMetric({
                    name: `api.response_time_bucket.${bucket.name}`,
                    value: 1,
                    type: 'counter',
                    tags: {
                        type: 'api',
                        method: method.toUpperCase(),
                        url: this.sanitizeUrl(url)
                    }
                });
                break;
            }
        }
    }

    private restoreNetworkRequests(): void {
        if (this.originalFetch) {
            window.fetch = this.originalFetch;
            this.originalFetch = undefined;
        }

        if (this.originalXHR) {
            window.XMLHttpRequest = this.originalXHR;
            this.originalXHR = undefined;
        }
    }

    private generateRequestId(): string {
        return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    private sanitizeUrl(url: string): string {
        try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.pathname;
        } catch {
            return url.split('?')[0]; // Remove query parameters
        }
    }

    private getStatusClass(status: number): string {
        if (status >= 200 && status < 300) return '2xx';
        if (status >= 300 && status < 400) return '3xx';
        if (status >= 400 && status < 500) return '4xx';
        if (status >= 500) return '5xx';
        return 'unknown';
    }

    protected getCollectionInterval(): number {
        return 10000; // 10 seconds for API metrics
    }
}

// Error metrics collector
export class ErrorMetricsCollector extends MetricCollector {
    private errorCounts = new Map<string, number>();

    getName(): string {
        return 'error_metrics';
    }

    async start(): Promise<void> {
        await super.start();
        this.setupErrorHandlers();
    }

    async stop(): Promise<void> {
        await super.stop();
        this.removeErrorHandlers();
    }

    async collect(): Promise<void> {
        // Record error counts
        for (const [errorType, count] of this.errorCounts) {
            this.recordMetric({
                name: 'errors.count',
                value: count,
                type: 'gauge',
                tags: { type: 'error', error_type: errorType }
            });
        }

        // Reset counts after reporting
        this.errorCounts.clear();
    }

    private setupErrorHandlers(): void {
        // JavaScript errors
        window.addEventListener('error', this.onError);

        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', this.onUnhandledRejection);

        // React error boundary (if available)
        this.setupReactErrorBoundary();
    }

    private removeErrorHandlers(): void {
        window.removeEventListener('error', this.onError);
        window.removeEventListener('unhandledrejection', this.onUnhandledRejection);
    }

    private onError = (event: ErrorEvent): void => {
        const errorType = event.error?.name || 'JavaScriptError';
        const errorMessage = event.message || 'Unknown error';
        const filename = event.filename || 'unknown';
        const lineno = event.lineno || 0;
        const colno = event.colno || 0;

        this.incrementErrorCount(errorType);

        this.recordMetric({
            name: 'errors.javascript_error',
            value: 1,
            type: 'counter',
            tags: {
                type: 'error',
                error_type: errorType,
                error_message: errorMessage,
                filename: this.sanitizeFilename(filename),
                line: lineno.toString(),
                column: colno.toString()
            }
        });
    };

    private onUnhandledRejection = (event: PromiseRejectionEvent): void => {
        const errorType = 'UnhandledPromiseRejection';
        const reason = event.reason?.toString() || 'Unknown rejection';

        this.incrementErrorCount(errorType);

        this.recordMetric({
            name: 'errors.unhandled_rejection',
            value: 1,
            type: 'counter',
            tags: {
                type: 'error',
                error_type: errorType,
                reason: reason
            }
        });
    };

    private setupReactErrorBoundary(): void {
        // This would be set up by a React Error Boundary component
        // For now, we'll just listen for any custom error events
        window.addEventListener('react-error', ((event: CustomEvent) => {
            const errorType = 'ReactError';
            const error = event.detail;

            this.incrementErrorCount(errorType);

            this.recordMetric({
                name: 'errors.react_error',
                value: 1,
                type: 'counter',
                tags: {
                    type: 'error',
                    error_type: errorType,
                    component: error.componentStack || 'unknown',
                    error_message: error.message || 'Unknown React error'
                }
            });
        }) as EventListener);
    }

    private incrementErrorCount(errorType: string): void {
        const current = this.errorCounts.get(errorType) || 0;
        this.errorCounts.set(errorType, current + 1);
    }

    private sanitizeFilename(filename: string): string {
        try {
            const url = new URL(filename);
            return url.pathname.split('/').pop() || 'unknown';
        } catch {
            return filename.split('/').pop() || 'unknown';
        }
    }

    protected getCollectionInterval(): number {
        return 30000; // 30 seconds for error metrics
    }
}
