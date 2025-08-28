'use client';

import { MetricCollector, PerformanceMetric } from '../core/MonitoringManager';

// Browser performance collector
export class BrowserPerformanceCollector extends MetricCollector {
  private observer?: PerformanceObserver;

  start(): void {
    if (this.isRunning || typeof window === 'undefined') return;
    
    this.isRunning = true;
    this.setupPerformanceObserver();
    this.collectPageLoadMetrics();
    
    // Collect metrics every 30 seconds
    this.interval = setInterval(() => {
      this.collect();
    }, 30000);
  }

  stop(): void {
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  async collect(): Promise<void> {
    try {
      await Promise.all([
        this.collectMemoryMetrics(),
        this.collectNavigationMetrics(),
        this.collectResourceMetrics(),
        this.collectLCPMetrics(),
        this.collectFIDMetrics(),
        this.collectCLSMetrics()
      ]);
    } catch (error) {
      console.warn('Performance collection failed:', error);
    }
  }

  private setupPerformanceObserver(): void {
    if (!window.PerformanceObserver) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processPerformanceEntry(entry);
      }
    });

    // Observe different types of performance entries
    try {
      this.observer.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });
    } catch (error) {
      console.warn('PerformanceObserver setup failed:', error);
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    const metric: PerformanceMetric = {
      name: `performance_${entry.entryType}_${entry.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
      value: entry.duration || entry.startTime,
      unit: 'ms',
      timestamp: new Date(),
      category: 'performance',
      tags: {
        entryType: entry.entryType,
        name: entry.name
      }
    };

    this.recordMetric(metric);
  }

  private collectPageLoadMetrics(): void {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    const metrics = [
      { name: 'page_load_time', value: navigation.loadEventEnd - navigation.navigationStart },
      { name: 'dom_content_loaded', value: navigation.domContentLoadedEventEnd - navigation.navigationStart },
      { name: 'first_paint', value: navigation.responseStart - navigation.navigationStart },
      { name: 'dns_lookup_time', value: navigation.domainLookupEnd - navigation.domainLookupStart },
      { name: 'tcp_connect_time', value: navigation.connectEnd - navigation.connectStart },
      { name: 'server_response_time', value: navigation.responseEnd - navigation.requestStart }
    ];

    metrics.forEach(({ name, value }) => {
      if (value > 0) {
        this.recordMetric({
          name,
          value,
          unit: 'ms',
          timestamp: new Date(),
          category: 'performance',
          severity: value > 3000 ? 'high' : value > 1000 ? 'medium' : 'low'
        });
      }
    });
  }

  private async collectMemoryMetrics(): Promise<void> {
    if (!(performance as any).memory) return;

    const memory = (performance as any).memory;
    
    const metrics = [
      { name: 'js_heap_used', value: memory.usedJSHeapSize / 1024 / 1024 },
      { name: 'js_heap_total', value: memory.totalJSHeapSize / 1024 / 1024 },
      { name: 'js_heap_limit', value: memory.jsHeapSizeLimit / 1024 / 1024 }
    ];

    metrics.forEach(({ name, value }) => {
      this.recordMetric({
        name,
        value,
        unit: 'MB',
        timestamp: new Date(),
        category: 'memory',
        severity: value > 100 ? 'high' : value > 50 ? 'medium' : 'low'
      });
    });
  }

  private async collectNavigationMetrics(): Promise<void> {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    entries.forEach(entry => {
      const metrics = [
        { name: 'redirect_time', value: entry.redirectEnd - entry.redirectStart },
        { name: 'cache_lookup_time', value: entry.domainLookupStart - entry.fetchStart },
        { name: 'dns_time', value: entry.domainLookupEnd - entry.domainLookupStart },
        { name: 'tcp_time', value: entry.connectEnd - entry.connectStart },
        { name: 'request_time', value: entry.responseStart - entry.requestStart },
        { name: 'response_time', value: entry.responseEnd - entry.responseStart },
        { name: 'dom_processing_time', value: entry.domComplete - entry.domLoading }
      ];

      metrics.forEach(({ name, value }) => {
        if (value > 0) {
          this.recordMetric({
            name,
            value,
            unit: 'ms',
            timestamp: new Date(),
            category: 'network',
            tags: { source: 'navigation' }
          });
        }
      });
    });
  }

  private async collectResourceMetrics(): Promise<void> {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Aggregate resource metrics by type
    const resourceTypes = new Map<string, { count: number; totalSize: number; totalTime: number }>();
    
    resources.forEach(resource => {
      const type = this.getResourceType(resource.name);
      const existing = resourceTypes.get(type) || { count: 0, totalSize: 0, totalTime: 0 };
      
      existing.count++;
      existing.totalSize += resource.transferSize || 0;
      existing.totalTime += resource.duration;
      
      resourceTypes.set(type, existing);
    });

    resourceTypes.forEach((stats, type) => {
      this.recordMetric({
        name: `resource_count_${type}`,
        value: stats.count,
        unit: 'count',
        timestamp: new Date(),
        category: 'performance',
        tags: { resourceType: type }
      });

      if (stats.totalSize > 0) {
        this.recordMetric({
          name: `resource_size_${type}`,
          value: stats.totalSize / 1024,
          unit: 'KB',
          timestamp: new Date(),
          category: 'network',
          tags: { resourceType: type }
        });
      }

      this.recordMetric({
        name: `resource_load_time_${type}`,
        value: stats.totalTime / stats.count,
        unit: 'ms',
        timestamp: new Date(),
        category: 'performance',
        tags: { resourceType: type }
      });
    });
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  private async collectLCPMetrics(): Promise<void> {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordMetric({
          name: 'largest_contentful_paint',
          value: lastEntry.startTime,
          unit: 'ms',
          timestamp: new Date(),
          category: 'performance',
          severity: lastEntry.startTime > 4000 ? 'high' : lastEntry.startTime > 2500 ? 'medium' : 'low',
          tags: { metric: 'core_web_vital' }
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      // LCP not supported
    }
  }

  private async collectFIDMetrics(): Promise<void> {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'first_input_delay',
            value: entry.processingStart - entry.startTime,
            unit: 'ms',
            timestamp: new Date(),
            category: 'performance',
            severity: (entry.processingStart - entry.startTime) > 300 ? 'high' : 
                     (entry.processingStart - entry.startTime) > 100 ? 'medium' : 'low',
            tags: { metric: 'core_web_vital' }
          });
        }
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      // FID not supported
    }
  }

  private async collectCLSMetrics(): Promise<void> {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        this.recordMetric({
          name: 'cumulative_layout_shift',
          value: clsValue,
          unit: 'score',
          timestamp: new Date(),
          category: 'performance',
          severity: clsValue > 0.25 ? 'high' : clsValue > 0.1 ? 'medium' : 'low',
          tags: { metric: 'core_web_vital' }
        });
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      // CLS not supported
    }
  }
}

// API performance collector
export class APIPerformanceCollector extends MetricCollector {
  private originalFetch: typeof fetch;
  private originalXHROpen: typeof XMLHttpRequest.prototype.open;

  start(): void {
    if (this.isRunning || typeof window === 'undefined') return;
    
    this.isRunning = true;
    this.interceptFetch();
    this.interceptXHR();
    
    this.interval = setInterval(() => {
      this.collect();
    }, 60000); // Every minute
  }

  stop(): void {
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    // Restore original functions
    if (this.originalFetch) {
      window.fetch = this.originalFetch;
    }
    
    if (this.originalXHROpen) {
      XMLHttpRequest.prototype.open = this.originalXHROpen;
    }
  }

  async collect(): Promise<void> {
    // This collector primarily works through interception
    // Additional periodic collection can be added here
  }

  private interceptFetch(): void {
    this.originalFetch = window.fetch;
    
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      const startTime = performance.now();
      
      try {
        const response = await this.originalFetch(input, init);
        const endTime = performance.now();
        
        this.recordAPIMetric({
          url,
          method,
          status: response.status,
          duration: endTime - startTime,
          success: response.ok
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.recordAPIMetric({
          url,
          method,
          status: 0,
          duration: endTime - startTime,
          success: false,
          error: error instanceof Error ? error.message : 'Network error'
        });
        
        throw error;
      }
    };
  }

  private interceptXHR(): void {
    this.originalXHROpen = XMLHttpRequest.prototype.open;
    
    XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]) {
      const startTime = performance.now();
      
      this.addEventListener('loadend', () => {
        const endTime = performance.now();
        
        (window as any).__apiCollector?.recordAPIMetric({
          url: url.toString(),
          method,
          status: this.status,
          duration: endTime - startTime,
          success: this.status >= 200 && this.status < 300
        });
      });
      
      return this.originalXHROpen.call(this, method, url, ...args);
    };
    
    // Store reference for XHR callback
    (window as any).__apiCollector = this;
  }

  private recordAPIMetric(data: {
    url: string;
    method: string;
    status: number;
    duration: number;
    success: boolean;
    error?: string;
  }): void {
    const { url, method, status, duration, success, error } = data;
    
    // Response time metric
    this.recordMetric({
      name: 'api_response_time',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      category: 'network',
      severity: duration > 5000 ? 'high' : duration > 2000 ? 'medium' : 'low',
      tags: {
        method,
        endpoint: this.sanitizeURL(url),
        status: status.toString()
      }
    });

    // Error rate metric
    this.recordMetric({
      name: 'api_error_count',
      value: success ? 0 : 1,
      unit: 'count',
      timestamp: new Date(),
      category: 'error',
      severity: success ? 'low' : 'high',
      tags: {
        method,
        endpoint: this.sanitizeURL(url),
        status: status.toString(),
        error: error || 'none'
      }
    });

    // Throughput metric
    this.recordMetric({
      name: 'api_request_count',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      category: 'business',
      tags: {
        method,
        endpoint: this.sanitizeURL(url),
        status: status.toString()
      }
    });
  }

  private sanitizeURL(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);
      // Remove query parameters and fragments for grouping
      return urlObj.pathname;
    } catch {
      return url;
    }
  }
}

// Error tracking collector
export class ErrorCollector extends MetricCollector {
  start(): void {
    if (this.isRunning || typeof window === 'undefined') return;
    
    this.isRunning = true;
    this.setupErrorHandlers();
    
    this.interval = setInterval(() => {
      this.collect();
    }, 60000); // Every minute
  }

  stop(): void {
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    // Remove event listeners
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  async collect(): Promise<void> {
    // This collector primarily works through event handlers
    // Additional periodic collection can be added here
  }

  private setupErrorHandlers(): void {
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  private handleError(event: ErrorEvent): void {
    this.recordMetric({
      name: 'javascript_error',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      category: 'error',
      severity: 'high',
      tags: {
        message: event.message,
        filename: event.filename,
        line: event.lineno?.toString() || 'unknown',
        column: event.colno?.toString() || 'unknown'
      },
      metadata: {
        stack: event.error?.stack,
        userAgent: navigator.userAgent
      }
    });
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.recordMetric({
      name: 'unhandled_promise_rejection',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      category: 'error',
      severity: 'high',
      tags: {
        reason: event.reason?.toString() || 'unknown'
      },
      metadata: {
        stack: event.reason?.stack,
        userAgent: navigator.userAgent
      }
    });
  }
}

// User interaction collector
export class UserInteractionCollector extends MetricCollector {
  private interactions: Map<string, number> = new Map();

  start(): void {
    if (this.isRunning || typeof window === 'undefined') return;
    
    this.isRunning = true;
    this.setupInteractionHandlers();
    
    this.interval = setInterval(() => {
      this.collect();
    }, 30000); // Every 30 seconds
  }

  stop(): void {
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
    }
    
    // Remove event listeners
    ['click', 'scroll', 'keydown', 'resize'].forEach(event => {
      window.removeEventListener(event, this.handleInteraction);
    });
  }

  async collect(): Promise<void> {
    // Report accumulated interactions
    for (const [action, count] of this.interactions) {
      this.recordMetric({
        name: `user_interaction_${action}`,
        value: count,
        unit: 'count',
        timestamp: new Date(),
        category: 'business',
        tags: { interaction: action }
      });
    }
    
    // Reset counters
    this.interactions.clear();
  }

  private setupInteractionHandlers(): void {
    ['click', 'scroll', 'keydown', 'resize'].forEach(event => {
      window.addEventListener(event, this.handleInteraction.bind(this), { passive: true });
    });
  }

  private handleInteraction(event: Event): void {
    const action = event.type;
    const current = this.interactions.get(action) || 0;
    this.interactions.set(action, current + 1);
  }
}
