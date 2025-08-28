'use client';

import { PerformanceAnalyzer, PerformanceReport } from '../analyzers/PerformanceAnalyzer';
import { APIMetricsCollector, ErrorMetricsCollector } from '../collectors/APIMetrics';
import { BrowserMetricsCollector, UserInteractionCollector } from '../collectors/BrowserMetrics';
import { MonitoringManager } from '../core/MonitoringManager';

// Enterprise monitoring configuration
export interface EnterpriseMonitoringConfig {
    enabled: boolean;
    sampling: {
        browserMetrics: number;
        apiMetrics: number;
        errorMetrics: number;
        userInteraction: number;
    };
    alerting: {
        enabled: boolean;
        channels: Array<{
            type: 'email' | 'slack' | 'webhook' | 'console';
            config: Record<string, any>;
        }>;
    };
    reporting: {
        enabled: boolean;
        interval: number; // in milliseconds
        retention: number; // in days
    };
    dashboard: {
        enabled: boolean;
        refreshInterval: number; // in milliseconds
    };
}

// Real-time dashboard data
export interface DashboardData {
    timestamp: Date;
    overview: {
        health_score: number;
        active_users: number;
        requests_per_minute: number;
        error_rate: number;
        avg_response_time: number;
    };
    performance: PerformanceReport;
    alerts: Array<{
        id: string;
        severity: 'critical' | 'high' | 'medium' | 'low';
        message: string;
        timestamp: Date;
    }>;
    trends: {
        response_times: Array<{ timestamp: Date; value: number }>;
        error_rates: Array<{ timestamp: Date; value: number }>;
        user_activity: Array<{ timestamp: Date; value: number }>;
    };
}

// Enterprise-grade monitoring system
export class EnterpriseMonitoring {
    private monitoring: MonitoringManager;
    private analyzer: PerformanceAnalyzer;
    private config: EnterpriseMonitoringConfig;
    private collectors: Map<string, any> = new Map();
    private dashboardData: DashboardData | null = null;
    private reportTimer?: NodeJS.Timeout;
    private dashboardTimer?: NodeJS.Timeout;
    private alertHandlers: Array<(alert: any) => void> = [];

    constructor(config: Partial<EnterpriseMonitoringConfig> = {}) {
        this.config = {
            enabled: true,
            sampling: {
                browserMetrics: 1.0,
                apiMetrics: 1.0,
                errorMetrics: 1.0,
                userInteraction: 0.1
            },
            alerting: {
                enabled: true,
                channels: [{ type: 'console', config: {} }]
            },
            reporting: {
                enabled: true,
                interval: 300000, // 5 minutes
                retention: 30 // 30 days
            },
            dashboard: {
                enabled: true,
                refreshInterval: 10000 // 10 seconds
            },
            ...config
        };

        this.monitoring = new MonitoringManager({
            enabled: this.config.enabled,
            sampleRate: 1.0,
            alertThresholds: {
                'api.request_duration': { warning: 500, critical: 2000 },
                'browser.memory.usage_percent': { warning: 70, critical: 85 },
                'errors.count': { warning: 5, critical: 10 },
                'api.error_rate': { warning: 2, critical: 5 }
            }
        });

        this.analyzer = new PerformanceAnalyzer(this.monitoring);

        this.setupCollectors();
        this.setupAlertHandlers();

        if (this.config.enabled) {
            this.start();
        }
    }

    private setupCollectors(): void {
        // Browser metrics collector
        const browserCollector = new BrowserMetricsCollector();
        this.collectors.set('browser', browserCollector);
        this.monitoring.registerCollector('browser', browserCollector);

        // User interaction collector
        const userCollector = new UserInteractionCollector();
        this.collectors.set('user', userCollector);
        this.monitoring.registerCollector('user', userCollector);

        // API metrics collector
        const apiCollector = new APIMetricsCollector();
        this.collectors.set('api', apiCollector);
        this.monitoring.registerCollector('api', apiCollector);

        // Error metrics collector
        const errorCollector = new ErrorMetricsCollector();
        this.collectors.set('error', errorCollector);
        this.monitoring.registerCollector('error', errorCollector);
    }

    private setupAlertHandlers(): void {
        this.monitoring.onAlert((alert) => {
            this.handleAlert(alert);
        });
    }

    async start(): Promise<void> {
        if (!this.config.enabled) return;

        // Start all collectors
        await this.monitoring.startCollectors();

        // Start reporting timer
        if (this.config.reporting.enabled) {
            this.reportTimer = setInterval(() => {
                this.generateReport().catch(console.error);
            }, this.config.reporting.interval);
        }

        // Start dashboard timer
        if (this.config.dashboard.enabled) {
            this.dashboardTimer = setInterval(() => {
                this.updateDashboard().catch(console.error);
            }, this.config.dashboard.refreshInterval);

            // Initial dashboard update
            await this.updateDashboard();
        }

        console.log('Enterprise monitoring started');
    }

    async stop(): Promise<void> {
        await this.monitoring.stopCollectors();

        if (this.reportTimer) {
            clearInterval(this.reportTimer);
        }

        if (this.dashboardTimer) {
            clearInterval(this.dashboardTimer);
        }

        this.monitoring.shutdown();
        console.log('Enterprise monitoring stopped');
    }

    async generateReport(): Promise<PerformanceReport> {
        return await this.analyzer.generateReport(1); // Last hour
    }

    async getDashboardData(): Promise<DashboardData | null> {
        return this.dashboardData;
    }

    onAlert(handler: (alert: any) => void): void {
        this.alertHandlers.push(handler);
    }

    // Get system health status
    async getHealthStatus(): Promise<{
        status: 'healthy' | 'warning' | 'critical';
        score: number;
        issues: string[];
    }> {
        const report = await this.generateReport();
        const activeAlerts = this.monitoring.getActiveAlerts();

        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        const issues: string[] = [];

        if (report.overall_score < 50) {
            status = 'critical';
            issues.push('Poor overall performance score');
        } else if (report.overall_score < 75) {
            status = 'warning';
            issues.push('Performance could be improved');
        }

        const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical');
        if (criticalAlerts.length > 0) {
            status = 'critical';
            issues.push(`${criticalAlerts.length} critical alerts active`);
        }

        const highAlerts = activeAlerts.filter(a => a.severity === 'high');
        if (highAlerts.length > 0 && status === 'healthy') {
            status = 'warning';
            issues.push(`${highAlerts.length} high priority alerts active`);
        }

        return {
            status,
            score: report.overall_score,
            issues
        };
    }

    // Get metrics summary for a specific time range
    async getMetricsSummary(hours: number = 1): Promise<{
        total_requests: number;
        avg_response_time: number;
        error_rate: number;
        unique_errors: number;
        memory_usage: number;
        active_users: number;
    }> {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

        const [
            requestMetrics,
            responseTimeMetrics,
            errorMetrics,
            memoryMetrics,
            userMetrics
        ] = await Promise.all([
            this.monitoring.queryMetrics('api.request_completed', startTime, endTime),
            this.monitoring.queryMetrics('api.request_duration', startTime, endTime),
            this.monitoring.queryMetrics('api.request_error', startTime, endTime),
            this.monitoring.queryMetrics('browser.memory.usage_percent', startTime, endTime),
            this.monitoring.queryMetrics('user.session_duration', startTime, endTime)
        ]);

        const totalRequests = requestMetrics.length;
        const avgResponseTime = responseTimeMetrics.length > 0
            ? responseTimeMetrics.reduce((sum, m) => sum + (m.value as number), 0) / responseTimeMetrics.length
            : 0;
        const errorRate = totalRequests > 0 ? (errorMetrics.length / totalRequests) * 100 : 0;
        const uniqueErrors = new Set(errorMetrics.map(m => m.tags?.error_type)).size;
        const memoryUsage = memoryMetrics.length > 0
            ? memoryMetrics[memoryMetrics.length - 1].value as number
            : 0;
        const activeUsers = userMetrics.length;

        return {
            total_requests: totalRequests,
            avg_response_time: avgResponseTime,
            error_rate: errorRate,
            unique_errors: uniqueErrors,
            memory_usage: memoryUsage,
            active_users: activeUsers
        };
    }

    private async updateDashboard(): Promise<void> {
        try {
            const [report, summary, alerts] = await Promise.all([
                this.analyzer.generateReport(0.25), // Last 15 minutes
                this.getMetricsSummary(0.25),
                Promise.resolve(this.monitoring.getActiveAlerts())
            ]);

            // Calculate requests per minute
            const requestsPerMinute = summary.total_requests / 15; // 15 minutes

            this.dashboardData = {
                timestamp: new Date(),
                overview: {
                    health_score: report.overall_score,
                    active_users: summary.active_users,
                    requests_per_minute: requestsPerMinute,
                    error_rate: summary.error_rate,
                    avg_response_time: summary.avg_response_time
                },
                performance: report,
                alerts: alerts.map(alert => ({
                    id: alert.id,
                    severity: alert.severity,
                    message: alert.message,
                    timestamp: alert.timestamp
                })),
                trends: {
                    response_times: await this.getTrendData('api.request_duration', 1),
                    error_rates: await this.getTrendData('api.request_error', 1),
                    user_activity: await this.getTrendData('user.click', 1)
                }
            };
        } catch (error) {
            console.error('Failed to update dashboard:', error);
        }
    }

    private async getTrendData(metricName: string, hours: number): Promise<Array<{ timestamp: Date; value: number }>> {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

        const metrics = await this.monitoring.queryMetrics(metricName, startTime, endTime);

        // Group metrics by 5-minute intervals
        const intervals = new Map<number, number[]>();
        const intervalSize = 5 * 60 * 1000; // 5 minutes

        metrics.forEach(metric => {
            const intervalKey = Math.floor(metric.timestamp.getTime() / intervalSize) * intervalSize;
            if (!intervals.has(intervalKey)) {
                intervals.set(intervalKey, []);
            }
            intervals.get(intervalKey)!.push(metric.value as number);
        });

        return Array.from(intervals.entries())
            .map(([timestamp, values]) => ({
                timestamp: new Date(timestamp),
                value: values.reduce((sum, val) => sum + val, 0) / values.length
            }))
            .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    private handleAlert(alert: any): void {
        // Send alert through configured channels
        for (const channel of this.config.alerting.channels) {
            try {
                this.sendAlert(alert, channel);
            } catch (error) {
                console.error(`Failed to send alert via ${channel.type}:`, error);
            }
        }

        // Notify alert handlers
        this.alertHandlers.forEach(handler => {
            try {
                handler(alert);
            } catch (error) {
                console.error('Alert handler error:', error);
            }
        });
    }

    private sendAlert(alert: any, channel: { type: string; config: Record<string, any> }): void {
        switch (channel.type) {
            case 'console':
                console.warn(`🚨 ALERT [${alert.severity.toUpperCase()}]:`, alert.message);
                break;
            case 'webhook':
                // Would send HTTP POST to webhook URL
                fetch(channel.config.url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(alert)
                }).catch(console.error);
                break;
            case 'email':
                // Would integrate with email service
                console.log('Would send email alert:', alert);
                break;
            case 'slack':
                // Would integrate with Slack API
                console.log('Would send Slack alert:', alert);
                break;
        }
    }

    // Export data for external analysis
    async exportData(format: 'json' | 'csv' = 'json', hours: number = 24): Promise<string> {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);

        const report = await this.analyzer.generateReport(hours);
        const summary = await this.getMetricsSummary(hours);

        const data = {
            export_time: new Date().toISOString(),
            time_range: { start: startTime.toISOString(), end: endTime.toISOString() },
            summary,
            performance_report: report,
            alerts: this.monitoring.getAllAlerts()
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else {
            // Convert to CSV format (simplified)
            const csv = [
                'timestamp,metric,value,tags',
                // Would convert metrics to CSV rows
                ''
            ].join('\n');
            return csv;
        }
    }
}
