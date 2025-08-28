'use client';

import { MetricCollector } from '../core/MonitoringManager';

// Browser performance metrics collector
export class BrowserMetricsCollector extends MetricCollector {
    private observer?: PerformanceObserver;
    private navigationObserver?: PerformanceObserver;

    getName(): string {
        return 'browser_metrics';
    }

    async collect(): Promise<void> {
        await Promise.all([
            this.collectNavigationMetrics(),
            this.collectResourceMetrics(),
            this.collectMemoryMetrics(),
            this.collectConnectionMetrics()
        ]);
    }

    async start(): Promise<void> {
        await super.start();
        this.setupPerformanceObservers();
    }

    async stop(): Promise<void> {
        await super.stop();
        this.cleanupObservers();
    }

    private async collectNavigationMetrics(): Promise<void> {
        if (!window.performance || !window.performance.getEntriesByType) return;

        const navigationEntries = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

        for (const entry of navigationEntries) {
            // DNS lookup time
            this.recordMetric({
                name: 'browser.navigation.dns_lookup_time',
                value: entry.domainLookupEnd - entry.domainLookupStart,
                type: 'gauge',
                unit: 'ms',
                tags: { type: 'navigation' }
            });

            // TCP connection time
            this.recordMetric({
                name: 'browser.navigation.tcp_connect_time',
                value: entry.connectEnd - entry.connectStart,
                type: 'gauge',
                unit: 'ms',
                tags: { type: 'navigation' }
            });

            // Request time
            this.recordMetric({
                name: 'browser.navigation.request_time',
                value: entry.responseStart - entry.requestStart,
                type: 'gauge',
                unit: 'ms',
                tags: { type: 'navigation' }
            });

            // Response time
            this.recordMetric({
                name: 'browser.navigation.response_time',
                value: entry.responseEnd - entry.responseStart,
                type: 'gauge',
                unit: 'ms',
                tags: { type: 'navigation' }
            });

            // DOM content loaded
            this.recordMetric({
                name: 'browser.navigation.dom_content_loaded',
                value: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                type: 'gauge',
                unit: 'ms',
                tags: { type: 'navigation' }
            });

            // Page load complete
            this.recordMetric({
                name: 'browser.navigation.load_complete',
                value: entry.loadEventEnd - entry.loadEventStart,
                type: 'gauge',
                unit: 'ms',
                tags: { type: 'navigation' }
            });

            // First Contentful Paint (if available)
            const paintEntries = window.performance.getEntriesByType('paint');
            for (const paintEntry of paintEntries) {
                this.recordMetric({
                    name: `browser.paint.${paintEntry.name.replace(/-/g, '_')}`,
                    value: paintEntry.startTime,
                    type: 'gauge',
                    unit: 'ms',
                    tags: { type: 'paint' }
                });
            }
        }
    }

    private async collectResourceMetrics(): Promise<void> {
        if (!window.performance || !window.performance.getEntriesByType) return;

        const resourceEntries = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];

        // Group resources by type
        const resourcesByType: Record<string, PerformanceResourceTiming[]> = {};

        for (const entry of resourceEntries) {
            const type = this.getResourceType(entry);
            if (!resourcesByType[type]) {
                resourcesByType[type] = [];
            }
            resourcesByType[type].push(entry);
        }

        // Record metrics by resource type
        for (const [type, entries] of Object.entries(resourcesByType)) {
            const totalSize = entries.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
            const avgDuration = entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length;

            this.recordMetric({
                name: 'browser.resources.count',
                value: entries.length,
                type: 'gauge',
                tags: { resource_type: type }
            });

            this.recordMetric({
                name: 'browser.resources.total_size',
                value: totalSize,
                type: 'gauge',
                unit: 'bytes',
                tags: { resource_type: type }
            });

            this.recordMetric({
                name: 'browser.resources.avg_duration',
                value: avgDuration,
                type: 'gauge',
                unit: 'ms',
                tags: { resource_type: type }
            });
        }
    }

    private async collectMemoryMetrics(): Promise<void> {
        if (!('memory' in window.performance)) return;

        const memory = (window.performance as any).memory;

        this.recordMetric({
            name: 'browser.memory.used_js_heap_size',
            value: memory.usedJSHeapSize,
            type: 'gauge',
            unit: 'bytes',
            tags: { type: 'memory' }
        });

        this.recordMetric({
            name: 'browser.memory.total_js_heap_size',
            value: memory.totalJSHeapSize,
            type: 'gauge',
            unit: 'bytes',
            tags: { type: 'memory' }
        });

        this.recordMetric({
            name: 'browser.memory.js_heap_size_limit',
            value: memory.jsHeapSizeLimit,
            type: 'gauge',
            unit: 'bytes',
            tags: { type: 'memory' }
        });

        // Memory usage percentage
        const memoryUsagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        this.recordMetric({
            name: 'browser.memory.usage_percent',
            value: memoryUsagePercent,
            type: 'gauge',
            unit: 'percent',
            tags: { type: 'memory' }
        });
    }

    private async collectConnectionMetrics(): Promise<void> {
        if (!('connection' in navigator)) return;

        const connection = (navigator as any).connection;

        this.recordMetric({
            name: 'browser.connection.downlink',
            value: connection.downlink,
            type: 'gauge',
            unit: 'mbps',
            tags: { type: 'connection' }
        });

        this.recordMetric({
            name: 'browser.connection.rtt',
            value: connection.rtt,
            type: 'gauge',
            unit: 'ms',
            tags: { type: 'connection' }
        });

        this.recordMetric({
            name: 'browser.connection.effective_type',
            value: connection.effectiveType,
            type: 'gauge',
            tags: { type: 'connection', effective_type: connection.effectiveType }
        });
    }

    private setupPerformanceObservers(): void {
        if (!window.PerformanceObserver) return;

        try {
            // Observe largest contentful paint
            this.observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordMetric({
                        name: `browser.lcp.${entry.name}`,
                        value: entry.startTime,
                        type: 'gauge',
                        unit: 'ms',
                        tags: { type: 'lcp' }
                    });
                }
            });

            this.observer.observe({ type: 'largest-contentful-paint', buffered: true });

            // Observe layout shifts
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                for (const entry of list.getEntries()) {
                    if (!(entry as any).hadRecentInput) {
                        clsValue += (entry as any).value;
                    }
                }

                if (clsValue > 0) {
                    this.recordMetric({
                        name: 'browser.cls.cumulative_layout_shift',
                        value: clsValue,
                        type: 'gauge',
                        tags: { type: 'cls' }
                    });
                }
            });

            clsObserver.observe({ type: 'layout-shift', buffered: true });

            // Observe first input delay
            const fidObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.recordMetric({
                        name: 'browser.fid.first_input_delay',
                        value: (entry as any).processingStart - entry.startTime,
                        type: 'gauge',
                        unit: 'ms',
                        tags: { type: 'fid' }
                    });
                }
            });

            fidObserver.observe({ type: 'first-input', buffered: true });

        } catch (error) {
            console.warn('Failed to setup performance observers:', error);
        }
    }

    private cleanupObservers(): void {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = undefined;
        }

        if (this.navigationObserver) {
            this.navigationObserver.disconnect();
            this.navigationObserver = undefined;
        }
    }

    private getResourceType(entry: PerformanceResourceTiming): string {
        if (entry.name.includes('.js')) return 'script';
        if (entry.name.includes('.css')) return 'stylesheet';
        if (entry.name.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return 'image';
        if (entry.name.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
        if (entry.name.includes('xhr') || entry.name.includes('fetch')) return 'xhr';
        return 'other';
    }

    protected getCollectionInterval(): number {
        return 60000; // 1 minute for browser metrics
    }
}

// User interaction metrics collector
export class UserInteractionCollector extends MetricCollector {
    private clickCount = 0;
    private keyPressCount = 0;
    private scrollCount = 0;
    private sessionStart = Date.now();

    getName(): string {
        return 'user_interaction';
    }

    async start(): Promise<void> {
        await super.start();
        this.setupEventListeners();
    }

    async stop(): Promise<void> {
        await super.stop();
        this.removeEventListeners();
    }

    async collect(): Promise<void> {
        const now = Date.now();
        const sessionDuration = (now - this.sessionStart) / 1000; // in seconds

        this.recordMetric({
            name: 'user.clicks_per_minute',
            value: this.clickCount / (sessionDuration / 60),
            type: 'gauge',
            tags: { type: 'interaction' }
        });

        this.recordMetric({
            name: 'user.keypress_per_minute',
            value: this.keyPressCount / (sessionDuration / 60),
            type: 'gauge',
            tags: { type: 'interaction' }
        });

        this.recordMetric({
            name: 'user.scrolls_per_minute',
            value: this.scrollCount / (sessionDuration / 60),
            type: 'gauge',
            tags: { type: 'interaction' }
        });

        this.recordMetric({
            name: 'user.session_duration',
            value: sessionDuration,
            type: 'gauge',
            unit: 'seconds',
            tags: { type: 'session' }
        });

        // Page visibility
        this.recordMetric({
            name: 'user.page_visible',
            value: document.visibilityState === 'visible' ? 1 : 0,
            type: 'gauge',
            tags: { type: 'visibility' }
        });
    }

    private setupEventListeners(): void {
        document.addEventListener('click', this.onClick);
        document.addEventListener('keypress', this.onKeyPress);
        document.addEventListener('scroll', this.onScroll, { passive: true });
        document.addEventListener('visibilitychange', this.onVisibilityChange);
    }

    private removeEventListeners(): void {
        document.removeEventListener('click', this.onClick);
        document.removeEventListener('keypress', this.onKeyPress);
        document.removeEventListener('scroll', this.onScroll);
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
    }

    private onClick = (): void => {
        this.clickCount++;
        this.recordMetric({
            name: 'user.click',
            value: 1,
            type: 'counter',
            tags: { type: 'interaction' }
        });
    };

    private onKeyPress = (): void => {
        this.keyPressCount++;
        this.recordMetric({
            name: 'user.keypress',
            value: 1,
            type: 'counter',
            tags: { type: 'interaction' }
        });
    };

    private onScroll = (): void => {
        this.scrollCount++;
        this.recordMetric({
            name: 'user.scroll',
            value: 1,
            type: 'counter',
            tags: { type: 'interaction' }
        });
    };

    private onVisibilityChange = (): void => {
        this.recordMetric({
            name: 'user.visibility_change',
            value: document.visibilityState === 'visible' ? 1 : 0,
            type: 'gauge',
            tags: { type: 'visibility', state: document.visibilityState }
        });
    };

    protected getCollectionInterval(): number {
        return 30000; // 30 seconds for user interaction metrics
    }
}
