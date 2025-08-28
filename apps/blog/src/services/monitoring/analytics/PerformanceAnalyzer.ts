'use client';

import { PerformanceMetric } from '../core/MonitoringManager';

// Performance analysis utilities
export class PerformanceAnalyzer {
    // Analyze Core Web Vitals
    static analyzeWebVitals(metrics: PerformanceMetric[]): {
        lcp: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
        fid: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
        cls: { value: number; rating: 'good' | 'needs-improvement' | 'poor' };
        overall: 'good' | 'needs-improvement' | 'poor';
    } {
        const lcpMetrics = metrics.filter(m => m.name === 'largest_contentful_paint');
        const fidMetrics = metrics.filter(m => m.name === 'first_input_delay');
        const clsMetrics = metrics.filter(m => m.name === 'cumulative_layout_shift');

        const lcp = this.getLatestValue(lcpMetrics);
        const fid = this.getLatestValue(fidMetrics);
        const cls = this.getLatestValue(clsMetrics);

        const lcpRating = this.rateLCP(lcp);
        const fidRating = this.rateFID(fid);
        const clsRating = this.rateCLS(cls);

        // Overall rating based on worst individual metric
        const ratings = [lcpRating, fidRating, clsRating];
        const overall = ratings.includes('poor') ? 'poor' :
            ratings.includes('needs-improvement') ? 'needs-improvement' : 'good';

        return {
            lcp: { value: lcp, rating: lcpRating },
            fid: { value: fid, rating: fidRating },
            cls: { value: cls, rating: clsRating },
            overall
        };
    }

    // Analyze API performance
    static analyzeAPIPerformance(metrics: PerformanceMetric[]): {
        averageResponseTime: number;
        errorRate: number;
        throughput: number;
        slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
        errorProneEndpoints: Array<{ endpoint: string; errorRate: number }>;
        recommendations: string[];
    } {
        const apiResponseMetrics = metrics.filter(m => m.name === 'api_response_time');
        const apiErrorMetrics = metrics.filter(m => m.name === 'api_error_count');
        const apiRequestMetrics = metrics.filter(m => m.name === 'api_request_count');

        // Calculate averages
        const averageResponseTime = this.calculateAverage(apiResponseMetrics);
        const totalRequests = this.sumValues(apiRequestMetrics);
        const totalErrors = this.sumValues(apiErrorMetrics);
        const errorRate = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;

        // Calculate throughput (requests per minute)
        const timeRange = this.getTimeRange(apiRequestMetrics);
        const durationMinutes = timeRange ? (timeRange.end.getTime() - timeRange.start.getTime()) / 60000 : 1;
        const throughput = totalRequests / durationMinutes;

        // Analyze by endpoint
        const endpointStats = this.groupByEndpoint(apiResponseMetrics, apiErrorMetrics, apiRequestMetrics);

        const slowestEndpoints = Object.entries(endpointStats)
            .map(([endpoint, stats]) => ({ endpoint, avgTime: stats.avgResponseTime }))
            .sort((a, b) => b.avgTime - a.avgTime)
            .slice(0, 5);

        const errorProneEndpoints = Object.entries(endpointStats)
            .map(([endpoint, stats]) => ({ endpoint, errorRate: stats.errorRate }))
            .filter(item => item.errorRate > 0)
            .sort((a, b) => b.errorRate - a.errorRate)
            .slice(0, 5);

        // Generate recommendations
        const recommendations = this.generateAPIRecommendations(
            averageResponseTime,
            errorRate,
            throughput,
            slowestEndpoints
        );

        return {
            averageResponseTime,
            errorRate,
            throughput,
            slowestEndpoints,
            errorProneEndpoints,
            recommendations
        };
    }

    // Analyze memory usage patterns
    static analyzeMemoryUsage(metrics: PerformanceMetric[]): {
        current: { used: number; total: number; utilization: number };
        trend: 'increasing' | 'decreasing' | 'stable';
        peakUsage: number;
        recommendations: string[];
    } {
        const memoryMetrics = metrics.filter(m => m.name === 'js_heap_used');
        const totalMemoryMetrics = metrics.filter(m => m.name === 'js_heap_total');

        if (memoryMetrics.length === 0) {
            return {
                current: { used: 0, total: 0, utilization: 0 },
                trend: 'stable',
                peakUsage: 0,
                recommendations: ['Memory monitoring not available']
            };
        }

        const latestUsed = this.getLatestValue(memoryMetrics);
        const latestTotal = this.getLatestValue(totalMemoryMetrics);
        const utilization = latestTotal > 0 ? (latestUsed / latestTotal) * 100 : 0;

        const trend = this.calculateTrend(memoryMetrics);
        const peakUsage = Math.max(...memoryMetrics.map(m => m.value));

        const recommendations = this.generateMemoryRecommendations(utilization, trend, peakUsage);

        return {
            current: {
                used: latestUsed,
                total: latestTotal,
                utilization
            },
            trend,
            peakUsage,
            recommendations
        };
    }

    // Analyze user experience metrics
    static analyzeUserExperience(metrics: PerformanceMetric[]): {
        pageLoadTime: number;
        interactivity: number;
        visualStability: number;
        userSatisfactionScore: number;
        bottlenecks: string[];
        recommendations: string[];
    } {
        const pageLoadMetrics = metrics.filter(m => m.name === 'page_load_time');
        const fidMetrics = metrics.filter(m => m.name === 'first_input_delay');
        const clsMetrics = metrics.filter(m => m.name === 'cumulative_layout_shift');

        const pageLoadTime = this.getLatestValue(pageLoadMetrics);
        const fid = this.getLatestValue(fidMetrics);
        const cls = this.getLatestValue(clsMetrics);

        // Calculate scores (0-100)
        const pageLoadScore = Math.max(0, 100 - (pageLoadTime / 50)); // 5000ms = 0 score
        const interactivityScore = Math.max(0, 100 - (fid / 3)); // 300ms = 0 score
        const visualStabilityScore = Math.max(0, 100 - (cls * 400)); // 0.25 = 0 score

        const userSatisfactionScore = (pageLoadScore + interactivityScore + visualStabilityScore) / 3;

        const bottlenecks = this.identifyBottlenecks(metrics);
        const recommendations = this.generateUXRecommendations(
            pageLoadTime,
            fid,
            cls,
            userSatisfactionScore
        );

        return {
            pageLoadTime,
            interactivity: fid,
            visualStability: cls,
            userSatisfactionScore,
            bottlenecks,
            recommendations
        };
    }

    // Generate comprehensive performance report
    static generatePerformanceReport(metrics: PerformanceMetric[]): {
        summary: {
            overallScore: number;
            status: 'excellent' | 'good' | 'fair' | 'poor';
            criticalIssues: number;
        };
        webVitals: ReturnType<typeof PerformanceAnalyzer.analyzeWebVitals>;
        api: ReturnType<typeof PerformanceAnalyzer.analyzeAPIPerformance>;
        memory: ReturnType<typeof PerformanceAnalyzer.analyzeMemoryUsage>;
        userExperience: ReturnType<typeof PerformanceAnalyzer.analyzeUserExperience>;
        actionItems: Array<{ priority: 'high' | 'medium' | 'low'; action: string }>;
    } {
        const webVitals = this.analyzeWebVitals(metrics);
        const api = this.analyzeAPIPerformance(metrics);
        const memory = this.analyzeMemoryUsage(metrics);
        const userExperience = this.analyzeUserExperience(metrics);

        // Calculate overall score
        const webVitalScore = webVitals.overall === 'good' ? 100 :
            webVitals.overall === 'needs-improvement' ? 70 : 40;
        const apiScore = api.errorRate < 1 ? 100 : api.errorRate < 5 ? 80 : 50;
        const memoryScore = memory.current.utilization < 70 ? 100 :
            memory.current.utilization < 85 ? 80 : 50;

        const overallScore = (webVitalScore + apiScore + memoryScore + userExperience.userSatisfactionScore) / 4;

        const status = overallScore >= 90 ? 'excellent' :
            overallScore >= 75 ? 'good' :
                overallScore >= 60 ? 'fair' : 'poor';

        // Count critical issues
        let criticalIssues = 0;
        if (webVitals.overall === 'poor') criticalIssues++;
        if (api.errorRate > 5) criticalIssues++;
        if (memory.current.utilization > 85) criticalIssues++;
        if (userExperience.userSatisfactionScore < 60) criticalIssues++;

        // Generate action items
        const actionItems = this.generateActionItems(webVitals, api, memory, userExperience);

        return {
            summary: {
                overallScore,
                status,
                criticalIssues
            },
            webVitals,
            api,
            memory,
            userExperience,
            actionItems
        };
    }

    // Helper methods
    private static getLatestValue(metrics: PerformanceMetric[]): number {
        if (metrics.length === 0) return 0;
        return metrics.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0].value;
    }

    private static calculateAverage(metrics: PerformanceMetric[]): number {
        if (metrics.length === 0) return 0;
        return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length;
    }

    private static sumValues(metrics: PerformanceMetric[]): number {
        return metrics.reduce((sum, m) => sum + m.value, 0);
    }

    private static getTimeRange(metrics: PerformanceMetric[]): { start: Date; end: Date } | null {
        if (metrics.length === 0) return null;

        const timestamps = metrics.map(m => m.timestamp.getTime());
        return {
            start: new Date(Math.min(...timestamps)),
            end: new Date(Math.max(...timestamps))
        };
    }

    private static calculateTrend(metrics: PerformanceMetric[]): 'increasing' | 'decreasing' | 'stable' {
        if (metrics.length < 2) return 'stable';

        const sorted = metrics.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
        const secondHalf = sorted.slice(Math.floor(sorted.length / 2));

        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);

        const change = ((secondAvg - firstAvg) / firstAvg) * 100;

        if (Math.abs(change) < 5) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }

    private static rateLCP(lcp: number): 'good' | 'needs-improvement' | 'poor' {
        if (lcp <= 2500) return 'good';
        if (lcp <= 4000) return 'needs-improvement';
        return 'poor';
    }

    private static rateFID(fid: number): 'good' | 'needs-improvement' | 'poor' {
        if (fid <= 100) return 'good';
        if (fid <= 300) return 'needs-improvement';
        return 'poor';
    }

    private static rateCLS(cls: number): 'good' | 'needs-improvement' | 'poor' {
        if (cls <= 0.1) return 'good';
        if (cls <= 0.25) return 'needs-improvement';
        return 'poor';
    }

    private static groupByEndpoint(
        responseMetrics: PerformanceMetric[],
        errorMetrics: PerformanceMetric[],
        requestMetrics: PerformanceMetric[]
    ): Record<string, { avgResponseTime: number; errorRate: number; requestCount: number }> {
        const endpointStats: Record<string, {
            totalTime: number;
            requestCount: number;
            errorCount: number;
        }> = {};

        // Aggregate response times
        responseMetrics.forEach(metric => {
            const endpoint = metric.tags?.endpoint || 'unknown';
            if (!endpointStats[endpoint]) {
                endpointStats[endpoint] = { totalTime: 0, requestCount: 0, errorCount: 0 };
            }
            endpointStats[endpoint].totalTime += metric.value;
        });

        // Count requests
        requestMetrics.forEach(metric => {
            const endpoint = metric.tags?.endpoint || 'unknown';
            if (!endpointStats[endpoint]) {
                endpointStats[endpoint] = { totalTime: 0, requestCount: 0, errorCount: 0 };
            }
            endpointStats[endpoint].requestCount += metric.value;
        });

        // Count errors
        errorMetrics.forEach(metric => {
            const endpoint = metric.tags?.endpoint || 'unknown';
            if (!endpointStats[endpoint]) {
                endpointStats[endpoint] = { totalTime: 0, requestCount: 0, errorCount: 0 };
            }
            endpointStats[endpoint].errorCount += metric.value;
        });

        // Calculate averages
        const result: Record<string, { avgResponseTime: number; errorRate: number; requestCount: number }> = {};

        Object.entries(endpointStats).forEach(([endpoint, stats]) => {
            result[endpoint] = {
                avgResponseTime: stats.requestCount > 0 ? stats.totalTime / stats.requestCount : 0,
                errorRate: stats.requestCount > 0 ? (stats.errorCount / stats.requestCount) * 100 : 0,
                requestCount: stats.requestCount
            };
        });

        return result;
    }

    private static identifyBottlenecks(metrics: PerformanceMetric[]): string[] {
        const bottlenecks: string[] = [];

        const dnsTime = this.getLatestValue(metrics.filter(m => m.name === 'dns_time'));
        const tcpTime = this.getLatestValue(metrics.filter(m => m.name === 'tcp_time'));
        const serverResponseTime = this.getLatestValue(metrics.filter(m => m.name === 'server_response_time'));
        const domProcessingTime = this.getLatestValue(metrics.filter(m => m.name === 'dom_processing_time'));

        if (dnsTime > 200) bottlenecks.push('DNS lookup is slow');
        if (tcpTime > 500) bottlenecks.push('TCP connection is slow');
        if (serverResponseTime > 1000) bottlenecks.push('Server response is slow');
        if (domProcessingTime > 2000) bottlenecks.push('DOM processing is slow');

        return bottlenecks;
    }

    private static generateAPIRecommendations(
        avgResponseTime: number,
        errorRate: number,
        throughput: number,
        slowestEndpoints: Array<{ endpoint: string; avgTime: number }>
    ): string[] {
        const recommendations: string[] = [];

        if (avgResponseTime > 2000) {
            recommendations.push('Implement response caching to reduce API response times');
            recommendations.push('Consider API response compression');
        }

        if (errorRate > 5) {
            recommendations.push('Investigate and fix high API error rates');
            recommendations.push('Implement circuit breaker pattern for fault tolerance');
        }

        if (throughput < 10) {
            recommendations.push('Consider implementing request batching to improve throughput');
        }

        if (slowestEndpoints.length > 0) {
            recommendations.push(`Optimize slow endpoints: ${slowestEndpoints.slice(0, 3).map(e => e.endpoint).join(', ')}`);
        }

        return recommendations;
    }

    private static generateMemoryRecommendations(
        utilization: number,
        trend: string,
        peakUsage: number
    ): string[] {
        const recommendations: string[] = [];

        if (utilization > 85) {
            recommendations.push('High memory utilization detected - consider optimizing memory usage');
            recommendations.push('Review for memory leaks in long-running processes');
        }

        if (trend === 'increasing') {
            recommendations.push('Memory usage is increasing - monitor for potential memory leaks');
            recommendations.push('Consider implementing object pooling for frequently created objects');
        }

        if (peakUsage > 100) {
            recommendations.push('High peak memory usage - consider lazy loading and resource cleanup');
        }

        return recommendations;
    }

    private static generateUXRecommendations(
        pageLoadTime: number,
        fid: number,
        cls: number,
        satisfactionScore: number
    ): string[] {
        const recommendations: string[] = [];

        if (pageLoadTime > 3000) {
            recommendations.push('Implement code splitting to reduce initial bundle size');
            recommendations.push('Optimize images and use modern formats (WebP, AVIF)');
            recommendations.push('Use a CDN for static assets');
        }

        if (fid > 100) {
            recommendations.push('Optimize main thread work to improve interactivity');
            recommendations.push('Use web workers for heavy computations');
        }

        if (cls > 0.1) {
            recommendations.push('Reserve space for dynamically loaded content');
            recommendations.push('Optimize font loading to prevent layout shifts');
        }

        if (satisfactionScore < 70) {
            recommendations.push('Consider implementing progressive loading strategies');
            recommendations.push('Review and optimize critical rendering path');
        }

        return recommendations;
    }

    private static generateActionItems(
        webVitals: any,
        api: any,
        memory: any,
        userExperience: any
    ): Array<{ priority: 'high' | 'medium' | 'low'; action: string }> {
        const actionItems: Array<{ priority: 'high' | 'medium' | 'low'; action: string }> = [];

        // High priority items
        if (webVitals.overall === 'poor') {
            actionItems.push({ priority: 'high', action: 'Fix Core Web Vitals performance issues' });
        }

        if (api.errorRate > 10) {
            actionItems.push({ priority: 'high', action: 'Address critical API error rate' });
        }

        if (memory.current.utilization > 90) {
            actionItems.push({ priority: 'high', action: 'Resolve high memory usage immediately' });
        }

        // Medium priority items
        if (userExperience.userSatisfactionScore < 75) {
            actionItems.push({ priority: 'medium', action: 'Improve user experience metrics' });
        }

        if (api.averageResponseTime > 2000) {
            actionItems.push({ priority: 'medium', action: 'Optimize API response times' });
        }

        // Low priority items
        if (memory.trend === 'increasing') {
            actionItems.push({ priority: 'low', action: 'Monitor memory usage trend' });
        }

        return actionItems;
    }
}
