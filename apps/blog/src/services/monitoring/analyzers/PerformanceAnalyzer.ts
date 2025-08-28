'use client';

import { Metric, MonitoringManager } from '../core/MonitoringManager';

// Performance analysis interfaces
export interface PerformanceInsight {
    type: 'warning' | 'critical' | 'info' | 'recommendation';
    category: 'web_vitals' | 'api' | 'memory' | 'user_experience' | 'resource_loading';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendations: string[];
    metrics: Metric[];
    timestamp: Date;
}

export interface PerformanceReport {
    overall_score: number; // 0-100
    insights: PerformanceInsight[];
    summary: {
        total_metrics: number;
        alerts_triggered: number;
        performance_trends: Record<string, 'improving' | 'stable' | 'degrading'>;
    };
    web_vitals: {
        lcp: number | null; // Largest Contentful Paint
        fid: number | null; // First Input Delay
        cls: number | null; // Cumulative Layout Shift
        fcp: number | null; // First Contentful Paint
        ttfb: number | null; // Time to First Byte
    };
    api_performance: {
        avg_response_time: number;
        error_rate: number;
        throughput: number;
        slowest_endpoints: Array<{ endpoint: string; avg_time: number }>;
    };
    resource_performance: {
        total_resources: number;
        largest_resources: Array<{ name: string; size: number; type: string }>;
        cache_hit_rate: number;
    };
}

// Performance analyzer for generating insights and recommendations
export class PerformanceAnalyzer {
    private monitoring: MonitoringManager;
    private thresholds: {
        web_vitals: {
            lcp: { good: number; needs_improvement: number };
            fid: { good: number; needs_improvement: number };
            cls: { good: number; needs_improvement: number };
            fcp: { good: number; needs_improvement: number };
            ttfb: { good: number; needs_improvement: number };
        };
        api: {
            response_time: { good: number; needs_improvement: number };
            error_rate: { good: number; needs_improvement: number };
        };
        memory: {
            usage_percent: { good: number; needs_improvement: number };
        };
    };

    constructor(monitoring: MonitoringManager) {
        this.monitoring = monitoring;

        // Define performance thresholds based on industry standards
        this.thresholds = {
            web_vitals: {
                lcp: { good: 2500, needs_improvement: 4000 }, // ms
                fid: { good: 100, needs_improvement: 300 }, // ms
                cls: { good: 0.1, needs_improvement: 0.25 }, // score
                fcp: { good: 1800, needs_improvement: 3000 }, // ms
                ttfb: { good: 800, needs_improvement: 1800 } // ms
            },
            api: {
                response_time: { good: 200, needs_improvement: 500 }, // ms
                error_rate: { good: 1, needs_improvement: 5 } // percent
            },
            memory: {
                usage_percent: { good: 70, needs_improvement: 85 } // percent
            }
        };
    }

    async generateReport(hours: number = 1): Promise<PerformanceReport> {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

        // Collect all relevant metrics
        const webVitalsData = await this.collectWebVitalsData(startTime, endTime);
        const apiData = await this.collectAPIData(startTime, endTime);
        const memoryData = await this.collectMemoryData(startTime, endTime);
        const resourceData = await this.collectResourceData(startTime, endTime);

        // Generate insights
        const insights = await this.generateInsights(webVitalsData, apiData, memoryData, resourceData);

        // Calculate overall score
        const overallScore = this.calculateOverallScore(webVitalsData, apiData, memoryData);

        // Generate summary
        const summary = await this.generateSummary(insights);

        return {
            overall_score: overallScore,
            insights,
            summary,
            web_vitals: webVitalsData,
            api_performance: apiData,
            resource_performance: resourceData
        };
    }

    private async collectWebVitalsData(startTime: Date, endTime: Date): Promise<PerformanceReport['web_vitals']> {
        const [lcpMetrics, fidMetrics, clsMetrics, fcpMetrics, ttfbMetrics] = await Promise.all([
            this.monitoring.queryMetrics('browser.lcp.largest-contentful-paint', startTime, endTime),
            this.monitoring.queryMetrics('browser.fid.first_input_delay', startTime, endTime),
            this.monitoring.queryMetrics('browser.cls.cumulative_layout_shift', startTime, endTime),
            this.monitoring.queryMetrics('browser.paint.first-contentful-paint', startTime, endTime),
            this.monitoring.queryMetrics('browser.navigation.request_time', startTime, endTime)
        ]);

        return {
            lcp: this.getLatestValue(lcpMetrics),
            fid: this.getLatestValue(fidMetrics),
            cls: this.getLatestValue(clsMetrics),
            fcp: this.getLatestValue(fcpMetrics),
            ttfb: this.getLatestValue(ttfbMetrics)
        };
    }

    private async collectAPIData(startTime: Date, endTime: Date): Promise<PerformanceReport['api_performance']> {
        const [responseTimeMetrics, errorMetrics, requestMetrics] = await Promise.all([
            this.monitoring.queryMetrics('api.request_duration', startTime, endTime),
            this.monitoring.queryMetrics('api.request_error', startTime, endTime),
            this.monitoring.queryMetrics('api.request_completed', startTime, endTime)
        ]);

        const avgResponseTime = this.calculateAverage(responseTimeMetrics);
        const totalRequests = requestMetrics.length;
        const totalErrors = errorMetrics.length;
        const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
        const throughput = totalRequests / ((endTime.getTime() - startTime.getTime()) / 1000); // requests per second

        // Group by endpoint to find slowest
        const endpointTimes = new Map<string, number[]>();
        responseTimeMetrics.forEach(metric => {
            const endpoint = metric.tags?.url || 'unknown';
            if (!endpointTimes.has(endpoint)) {
                endpointTimes.set(endpoint, []);
            }
            endpointTimes.get(endpoint)!.push(metric.value as number);
        });

        const slowestEndpoints = Array.from(endpointTimes.entries())
            .map(([endpoint, times]) => ({
                endpoint,
                avg_time: times.reduce((a, b) => a + b, 0) / times.length
            }))
            .sort((a, b) => b.avg_time - a.avg_time)
            .slice(0, 5);

        return {
            avg_response_time: avgResponseTime,
            error_rate: errorRate,
            throughput,
            slowest_endpoints: slowestEndpoints
        };
    }

    private async collectMemoryData(startTime: Date, endTime: Date): Promise<{ usage_percent: number }> {
        const memoryMetrics = await this.monitoring.queryMetrics('browser.memory.usage_percent', startTime, endTime);
        return {
            usage_percent: this.getLatestValue(memoryMetrics) || 0
        };
    }

    private async collectResourceData(startTime: Date, endTime: Date): Promise<PerformanceReport['resource_performance']> {
        const [resourceCountMetrics, resourceSizeMetrics] = await Promise.all([
            this.monitoring.queryMetrics('browser.resources.count', startTime, endTime),
            this.monitoring.queryMetrics('browser.resources.total_size', startTime, endTime)
        ]);

        const totalResources = this.getLatestValue(resourceCountMetrics) || 0;

        // Group resources by type and size
        const resourcesByType = new Map<string, number>();
        resourceSizeMetrics.forEach(metric => {
            const type = metric.tags?.resource_type || 'unknown';
            const size = metric.value as number;
            resourcesByType.set(type, (resourcesByType.get(type) || 0) + size);
        });

        const largestResources = Array.from(resourcesByType.entries())
            .map(([type, size]) => ({ name: type, size, type }))
            .sort((a, b) => b.size - a.size)
            .slice(0, 5);

        return {
            total_resources: totalResources,
            largest_resources: largestResources,
            cache_hit_rate: 0.85 // Placeholder - would be calculated from actual cache metrics
        };
    }

    private async generateInsights(
        webVitals: PerformanceReport['web_vitals'],
        apiData: PerformanceReport['api_performance'],
        memoryData: { usage_percent: number },
        resourceData: PerformanceReport['resource_performance']
    ): Promise<PerformanceInsight[]> {
        const insights: PerformanceInsight[] = [];

        // Web Vitals insights
        if (webVitals.lcp && webVitals.lcp > this.thresholds.web_vitals.lcp.needs_improvement) {
            insights.push({
                type: 'critical',
                category: 'web_vitals',
                title: 'Poor Largest Contentful Paint (LCP)',
                description: `LCP is ${webVitals.lcp}ms, which is above the recommended threshold of ${this.thresholds.web_vitals.lcp.needs_improvement}ms`,
                impact: 'high',
                recommendations: [
                    'Optimize images and reduce their size',
                    'Remove unnecessary third-party scripts',
                    'Use a Content Delivery Network (CDN)',
                    'Implement lazy loading for images'
                ],
                metrics: [],
                timestamp: new Date()
            });
        }

        if (webVitals.fid && webVitals.fid > this.thresholds.web_vitals.fid.needs_improvement) {
            insights.push({
                type: 'warning',
                category: 'web_vitals',
                title: 'High First Input Delay (FID)',
                description: `FID is ${webVitals.fid}ms, indicating slow interactivity`,
                impact: 'medium',
                recommendations: [
                    'Break up long-running JavaScript tasks',
                    'Use web workers for heavy computations',
                    'Implement code splitting',
                    'Optimize third-party scripts'
                ],
                metrics: [],
                timestamp: new Date()
            });
        }

        if (webVitals.cls && webVitals.cls > this.thresholds.web_vitals.cls.needs_improvement) {
            insights.push({
                type: 'warning',
                category: 'web_vitals',
                title: 'High Cumulative Layout Shift (CLS)',
                description: `CLS score is ${webVitals.cls}, indicating visual instability`,
                impact: 'medium',
                recommendations: [
                    'Set explicit dimensions for images and videos',
                    'Avoid inserting content above existing content',
                    'Use CSS aspect-ratio property',
                    'Preload fonts to avoid font swap'
                ],
                metrics: [],
                timestamp: new Date()
            });
        }

        // API Performance insights
        if (apiData.avg_response_time > this.thresholds.api.response_time.needs_improvement) {
            insights.push({
                type: 'warning',
                category: 'api',
                title: 'Slow API Response Times',
                description: `Average API response time is ${apiData.avg_response_time}ms`,
                impact: 'high',
                recommendations: [
                    'Implement request caching',
                    'Optimize database queries',
                    'Use connection pooling',
                    'Consider implementing a CDN'
                ],
                metrics: [],
                timestamp: new Date()
            });
        }

        if (apiData.error_rate > this.thresholds.api.error_rate.needs_improvement) {
            insights.push({
                type: 'critical',
                category: 'api',
                title: 'High API Error Rate',
                description: `API error rate is ${apiData.error_rate.toFixed(2)}%`,
                impact: 'high',
                recommendations: [
                    'Implement proper error handling',
                    'Add request retry logic',
                    'Monitor server health',
                    'Set up proper alerting'
                ],
                metrics: [],
                timestamp: new Date()
            });
        }

        // Memory insights
        if (memoryData.usage_percent > this.thresholds.memory.usage_percent.needs_improvement) {
            insights.push({
                type: 'warning',
                category: 'memory',
                title: 'High Memory Usage',
                description: `Memory usage is at ${memoryData.usage_percent.toFixed(1)}%`,
                impact: 'medium',
                recommendations: [
                    'Implement proper cleanup of event listeners',
                    'Use WeakMap and WeakSet for object references',
                    'Optimize data structures',
                    'Consider implementing virtual scrolling for large lists'
                ],
                metrics: [],
                timestamp: new Date()
            });
        }

        // Resource loading insights
        if (resourceData.total_resources > 100) {
            insights.push({
                type: 'info',
                category: 'resource_loading',
                title: 'Many Resources Loaded',
                description: `${resourceData.total_resources} resources loaded, consider optimization`,
                impact: 'low',
                recommendations: [
                    'Bundle similar resources together',
                    'Implement resource preloading',
                    'Use HTTP/2 server push',
                    'Consider removing unused assets'
                ],
                metrics: [],
                timestamp: new Date()
            });
        }

        return insights;
    }

    private calculateOverallScore(
        webVitals: PerformanceReport['web_vitals'],
        apiData: PerformanceReport['api_performance'],
        memoryData: { usage_percent: number }
    ): number {
        let score = 100;
        let factors = 0;

        // Web Vitals scoring (40% weight)
        if (webVitals.lcp !== null) {
            factors++;
            if (webVitals.lcp > this.thresholds.web_vitals.lcp.needs_improvement) {
                score -= 20;
            } else if (webVitals.lcp > this.thresholds.web_vitals.lcp.good) {
                score -= 10;
            }
        }

        if (webVitals.fid !== null) {
            factors++;
            if (webVitals.fid > this.thresholds.web_vitals.fid.needs_improvement) {
                score -= 15;
            } else if (webVitals.fid > this.thresholds.web_vitals.fid.good) {
                score -= 7;
            }
        }

        if (webVitals.cls !== null) {
            factors++;
            if (webVitals.cls > this.thresholds.web_vitals.cls.needs_improvement) {
                score -= 15;
            } else if (webVitals.cls > this.thresholds.web_vitals.cls.good) {
                score -= 7;
            }
        }

        // API Performance scoring (40% weight)
        factors++;
        if (apiData.avg_response_time > this.thresholds.api.response_time.needs_improvement) {
            score -= 20;
        } else if (apiData.avg_response_time > this.thresholds.api.response_time.good) {
            score -= 10;
        }

        factors++;
        if (apiData.error_rate > this.thresholds.api.error_rate.needs_improvement) {
            score -= 25;
        } else if (apiData.error_rate > this.thresholds.api.error_rate.good) {
            score -= 12;
        }

        // Memory usage scoring (20% weight)
        factors++;
        if (memoryData.usage_percent > this.thresholds.memory.usage_percent.needs_improvement) {
            score -= 15;
        } else if (memoryData.usage_percent > this.thresholds.memory.usage_percent.good) {
            score -= 8;
        }

        return Math.max(0, Math.min(100, score));
    }

    private async generateSummary(insights: PerformanceInsight[]): Promise<PerformanceReport['summary']> {
        const criticalCount = insights.filter(i => i.type === 'critical').length;
        const warningCount = insights.filter(i => i.type === 'warning').length;

        return {
            total_metrics: 0, // Would be calculated from actual metrics
            alerts_triggered: criticalCount + warningCount,
            performance_trends: {
                response_time: 'stable', // Would be calculated from historical data
                error_rate: 'improving',
                memory_usage: 'stable'
            }
        };
    }

    private getLatestValue(metrics: Metric[]): number | null {
        if (metrics.length === 0) return null;
        const latest = metrics.reduce((latest, current) =>
            current.timestamp > latest.timestamp ? current : latest
        );
        return typeof latest.value === 'number' ? latest.value : null;
    }

    private calculateAverage(metrics: Metric[]): number {
        if (metrics.length === 0) return 0;
        const sum = metrics.reduce((sum, metric) =>
            sum + (typeof metric.value === 'number' ? metric.value : 0), 0
        );
        return sum / metrics.length;
    }
}
