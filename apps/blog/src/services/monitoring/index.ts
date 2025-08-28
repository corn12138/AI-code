'use client';

// Core monitoring exports
export {
    InMemoryMetricStorage,
    MetricCollector,
    MonitoringManager
} from './core/MonitoringManager';
export type {
    Alert,
    Metric,
    MetricStorage,
    MonitoringConfig
} from './core/MonitoringManager';

// Collector exports
export {
    APIMetricsCollector,
    ErrorMetricsCollector
} from './collectors/APIMetrics';
export {
    BrowserMetricsCollector,
    UserInteractionCollector
} from './collectors/BrowserMetrics';

// Analyzer exports
export {
    PerformanceAnalyzer
} from './analyzers/PerformanceAnalyzer';
export type {
    PerformanceInsight,
    PerformanceReport
} from './analyzers/PerformanceAnalyzer';

// Enterprise monitoring exports
export {
    EnterpriseMonitoring
} from './enterprise/EnterpriseMonitoring';
export type {
    DashboardData,
    EnterpriseMonitoringConfig
} from './enterprise/EnterpriseMonitoring';

// Monitoring builder for easy setup
export class MonitoringBuilder {
    static createBasicMonitoring(config?: Partial<MonitoringConfig>) {
        return new MonitoringManager(config);
    }

    static createEnterpriseMonitoring(config?: Partial<EnterpriseMonitoringConfig>) {
        return new EnterpriseMonitoring(config);
    }

    static createAPIOnlyMonitoring() {
        const monitoring = new MonitoringManager({
            enabled: true,
            sampleRate: 1.0,
            alertThresholds: {
                'api.request_duration': { warning: 500, critical: 1000 },
                'api.request_error': { warning: 1, critical: 5 }
            }
        });

        const apiCollector = new APIMetricsCollector();
        monitoring.registerCollector('api', apiCollector);

        return monitoring;
    }

    static createBrowserOnlyMonitoring() {
        const monitoring = new MonitoringManager({
            enabled: true,
            sampleRate: 1.0,
            alertThresholds: {
                'browser.memory.usage_percent': { warning: 70, critical: 85 },
                'browser.lcp.largest-contentful-paint': { warning: 2500, critical: 4000 }
            }
        });

        const browserCollector = new BrowserMetricsCollector();
        const userCollector = new UserInteractionCollector();

        monitoring.registerCollector('browser', browserCollector);
        monitoring.registerCollector('user', userCollector);

        return monitoring;
    }
}

// Monitoring presets for common use cases
export const MONITORING_PRESETS = {
    // Development environment
    DEVELOPMENT: {
        enabled: true,
        sampleRate: 1.0,
        alertThresholds: {
            'api.request_duration': { warning: 1000, critical: 3000 },
            'errors.count': { warning: 10, critical: 20 }
        },
        alerting: {
            enabled: true,
            channels: [{ type: 'console', config: {} }]
        }
    },

    // Production environment
    PRODUCTION: {
        enabled: true,
        sampleRate: 0.1, // 10% sampling in production
        alertThresholds: {
            'api.request_duration': { warning: 500, critical: 1000 },
            'api.error_rate': { warning: 1, critical: 3 },
            'browser.memory.usage_percent': { warning: 70, critical: 85 },
            'errors.count': { warning: 5, critical: 10 }
        },
        alerting: {
            enabled: true,
            channels: [
                { type: 'console', config: {} },
                { type: 'webhook', config: { url: '/api/alerts' } }
            ]
        },
        reporting: {
            enabled: true,
            interval: 300000, // 5 minutes
            retention: 30 // 30 days
        }
    },

    // Performance testing
    PERFORMANCE_TESTING: {
        enabled: true,
        sampleRate: 1.0, // Full sampling for testing
        alertThresholds: {
            'api.request_duration': { warning: 200, critical: 500 },
            'browser.lcp.largest-contentful-paint': { warning: 2000, critical: 3000 },
            'browser.fid.first_input_delay': { warning: 100, critical: 200 }
        },
        alerting: {
            enabled: false // No alerting during testing
        }
    },

    // Minimal monitoring
    MINIMAL: {
        enabled: true,
        sampleRate: 0.01, // 1% sampling
        alertThresholds: {
            'errors.count': { warning: 20, critical: 50 }
        },
        alerting: {
            enabled: true,
            channels: [{ type: 'console', config: {} }]
        }
    }
};

// Utility functions
export const MonitoringUtils = {
    // Create monitoring instance from preset
    fromPreset: (preset: keyof typeof MONITORING_PRESETS) => {
        const config = MONITORING_PRESETS[preset];
        return new EnterpriseMonitoring(config);
    },

    // Get performance score from metrics
    calculatePerformanceScore: (metrics: {
        responseTime: number;
        errorRate: number;
        memoryUsage: number;
    }): number => {
        let score = 100;

        // Response time impact (0-40 points)
        if (metrics.responseTime > 1000) score -= 40;
        else if (metrics.responseTime > 500) score -= 20;
        else if (metrics.responseTime > 200) score -= 10;

        // Error rate impact (0-30 points)
        if (metrics.errorRate > 5) score -= 30;
        else if (metrics.errorRate > 2) score -= 15;
        else if (metrics.errorRate > 1) score -= 5;

        // Memory usage impact (0-30 points)
        if (metrics.memoryUsage > 85) score -= 30;
        else if (metrics.memoryUsage > 70) score -= 15;
        else if (metrics.memoryUsage > 50) score -= 5;

        return Math.max(0, score);
    },

    // Format metrics for display
    formatMetric: (value: number, unit?: string): string => {
        if (unit === 'ms') {
            if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
            return `${value.toFixed(0)}ms`;
        } else if (unit === 'bytes') {
            const sizes = ['B', 'KB', 'MB', 'GB'];
            let i = 0;
            let val = value;
            while (val >= 1024 && i < sizes.length - 1) {
                val /= 1024;
                i++;
            }
            return `${val.toFixed(2)} ${sizes[i]}`;
        } else if (unit === 'percent') {
            return `${value.toFixed(1)}%`;
        }
        return value.toString();
    },

    // Generate monitoring report
    generateSummaryReport: async (monitoring: MonitoringManager): Promise<{
        overall_health: 'healthy' | 'warning' | 'critical';
        active_alerts: number;
        metrics_collected: number;
        uptime: string;
    }> => {
        const alerts = monitoring.getActiveAlerts();
        const criticalAlerts = alerts.filter(a => a.severity === 'critical');
        const warningAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'medium');

        let overall_health: 'healthy' | 'warning' | 'critical' = 'healthy';

        if (criticalAlerts.length > 0) {
            overall_health = 'critical';
        } else if (warningAlerts.length > 0) {
            overall_health = 'warning';
        }

        return {
            overall_health,
            active_alerts: alerts.length,
            metrics_collected: 0, // Would calculate from actual metrics
            uptime: 'Unknown' // Would calculate from monitoring start time
        };
    }
};