'use client';

import { LLMManager } from '../../llm/LLMManager';
import { RealtimeManager } from '../../realtime/core/RealtimeManager';
import { TensorFlowModelManager } from '../../tensorflow/core/ModelManager';
import {
    ALERT_RULE_TEMPLATES,
    DashboardUtils,
    EnterpriseMonitoring,
    MetricAggregator,
    MONITORING_PRESETS,
    MonitoringBuilder,
    PerformanceOptimizer
} from '../index';

// Example usage of enterprise monitoring system
export class MonitoringExamples {
    private monitoring: EnterpriseMonitoring;
    private optimizer: PerformanceOptimizer;

    constructor() {
        this.monitoring = MONITORING_PRESETS.PRODUCTION();
        this.optimizer = new PerformanceOptimizer(this.monitoring);
    }

    // Example 1: Basic Monitoring Setup
    async basicMonitoringExample(): Promise<void> {
        console.log('=== Basic Monitoring Setup ===');

        // Create basic monitoring
        const monitoring = MonitoringBuilder.createBasicMonitoring({
            enabled: true,
            metricsRetention: 7, // 7 days
            samplingRate: 1.0, // 100% sampling
            alerting: {
                enabled: true,
                defaultChannels: ['console', 'ui']
            }
        });

        // Add custom alert rules
        monitoring.addCustomAlert({
            id: 'custom-high-memory',
            name: 'Custom High Memory Alert',
            metric: 'js_heap_used',
            condition: 'gt',
            threshold: 150, // 150MB
            duration: 180000, // 3 minutes
            severity: 'high',
            enabled: true,
            channels: ['console']
        });

        console.log('Basic monitoring configured');

        // Get initial dashboard data
        const dashboardData = monitoring.getDashboardData();
        console.log('Initial dashboard state:', {
            overallScore: dashboardData.overview.overallScore,
            status: dashboardData.overview.status,
            componentsTracked: Object.keys(dashboardData.components).length
        });
    }

    // Example 2: Enterprise Integration
    async enterpriseIntegrationExample(): Promise<void> {
        console.log('=== Enterprise Integration Example ===');

        // Create LLM, TensorFlow, and Realtime managers
        const llmManager = new LLMManager({
            providers: [
                {
                    name: 'openai',
                    apiKey: process.env.OPENAI_API_KEY || 'test-key',
                    baseURL: 'https://api.openai.com/v1'
                }
            ],
            defaultProvider: 'openai'
        });

        const tensorflowManager = new TensorFlowModelManager({
            maxCacheSize: 3,
            backend: 'webgl'
        });

        const realtimeManager = new RealtimeManager({
            maxConnections: 100,
            heartbeatInterval: 30000
        });

        // Integrate with monitoring
        this.monitoring.integrateWithLLM(llmManager);
        this.monitoring.integrateWithTensorFlow(tensorflowManager);
        this.monitoring.integrateWithRealtime(realtimeManager);

        console.log('Enterprise components integrated with monitoring');

        // Simulate some operations to generate metrics
        try {
            await llmManager.complete({
                messages: [{ role: 'user', content: 'Hello, test message' }],
                model: 'gpt-3.5-turbo',
                maxTokens: 50
            });
            console.log('LLM operation completed and monitored');
        } catch (error) {
            console.log('LLM operation failed (expected in demo):', error.message);
        }

        // Wait a moment for metrics to be collected
        await new Promise(resolve => setTimeout(resolve, 2000));

        const dashboardData = this.monitoring.getDashboardData();
        console.log('Dashboard after integration:', {
            llmStatus: dashboardData.components.llm.status,
            tensorflowStatus: dashboardData.components.tensorflow.status,
            realtimeStatus: dashboardData.components.realtime.status
        });
    }

    // Example 3: Performance Analysis
    async performanceAnalysisExample(): Promise<void> {
        console.log('=== Performance Analysis Example ===');

        // Generate some sample metrics for analysis
        this.generateSampleMetrics();

        // Wait for metrics to be processed
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get comprehensive performance report
        const report = this.monitoring.getPerformanceReport();

        console.log('Performance Report Summary:');
        console.log(`Overall Score: ${report.summary.overallScore}/100`);
        console.log(`Status: ${report.summary.status}`);
        console.log(`Critical Issues: ${report.summary.criticalIssues}`);

        console.log('\nWeb Vitals:');
        console.log(`LCP: ${report.webVitals.lcp.value}ms (${report.webVitals.lcp.rating})`);
        console.log(`FID: ${report.webVitals.fid.value}ms (${report.webVitals.fid.rating})`);
        console.log(`CLS: ${report.webVitals.cls.value} (${report.webVitals.cls.rating})`);

        console.log('\nAPI Performance:');
        console.log(`Average Response Time: ${report.api.averageResponseTime}ms`);
        console.log(`Error Rate: ${report.api.errorRate}%`);
        console.log(`Throughput: ${report.api.throughput} req/min`);

        console.log('\nMemory Usage:');
        console.log(`Current: ${report.memory.current.used}MB / ${report.memory.current.total}MB`);
        console.log(`Utilization: ${report.memory.current.utilization.toFixed(1)}%`);
        console.log(`Trend: ${report.memory.trend}`);

        if (report.actionItems.length > 0) {
            console.log('\nAction Items:');
            report.actionItems.forEach(item => {
                console.log(`[${item.priority.toUpperCase()}] ${item.action}`);
            });
        }
    }

    // Example 4: Alert Management
    async alertManagementExample(): Promise<void> {
        console.log('=== Alert Management Example ===');

        // Add various alert rules using templates
        const alertTemplates = [
            ALERT_RULE_TEMPLATES.HIGH_RESPONSE_TIME,
            ALERT_RULE_TEMPLATES.HIGH_ERROR_RATE,
            ALERT_RULE_TEMPLATES.MEMORY_USAGE_HIGH,
            ALERT_RULE_TEMPLATES.LLM_SLOW_RESPONSE
        ];

        alertTemplates.forEach((template, index) => {
            this.monitoring.addCustomAlert({
                ...template,
                id: `template-alert-${index}`,
                channels: ['console', 'ui']
            });
        });

        console.log(`Added ${alertTemplates.length} alert rules from templates`);

        // Generate metrics that will trigger alerts
        this.generateAlertTriggeringMetrics();

        // Wait for alerts to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check active alerts
        const activeAlerts = this.monitoring.getActiveAlerts();
        console.log(`Active alerts: ${activeAlerts.length}`);

        activeAlerts.forEach(alert => {
            console.log(`🚨 ${alert.rule.name}: ${alert.message}`);
            console.log(`   Triggered: ${alert.triggered.toISOString()}`);
            console.log(`   Severity: ${alert.rule.severity}`);
        });

        if (activeAlerts.length === 0) {
            console.log('No active alerts (system is healthy)');
        }
    }

    // Example 5: Performance Optimization
    async performanceOptimizationExample(): Promise<void> {
        console.log('=== Performance Optimization Example ===');

        // Generate performance issues for demonstration
        this.generatePerformanceIssues();
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get optimization recommendations
        const recommendations = this.optimizer.getOptimizationRecommendations();

        console.log('Optimization Recommendations:');

        if (recommendations.critical.length > 0) {
            console.log('\n🔥 CRITICAL (Fix Immediately):');
            recommendations.critical.forEach(rec => console.log(`  - ${rec}`));
        }

        if (recommendations.important.length > 0) {
            console.log('\n⚠️ IMPORTANT (Fix Soon):');
            recommendations.important.forEach(rec => console.log(`  - ${rec}`));
        }

        if (recommendations.suggested.length > 0) {
            console.log('\n💡 SUGGESTED (Consider):');
            recommendations.suggested.forEach(rec => console.log(`  - ${rec}`));
        }

        // Get auto-optimization actions
        const actions = this.optimizer.getAutoOptimizationActions();

        console.log('\nPrioritized Optimization Actions:');
        actions.slice(0, 5).forEach((action, index) => {
            console.log(`${index + 1}. ${action.action} (Impact: ${action.impact}, Effort: ${action.effort})`);
            console.log(`   ${action.description}`);
        });
    }

    // Example 6: Metric Aggregation and Analysis
    async metricAggregationExample(): Promise<void> {
        console.log('=== Metric Aggregation Example ===');

        // Generate time-series data
        const timeSeriesData = this.generateTimeSeriesData();

        console.log(`Generated ${timeSeriesData.length} data points`);

        // Calculate percentiles
        const values = timeSeriesData.map(d => d.value);
        const p50 = MetricAggregator.calculatePercentile(values, 50);
        const p95 = MetricAggregator.calculatePercentile(values, 95);
        const p99 = MetricAggregator.calculatePercentile(values, 99);

        console.log('\nPercentiles:');
        console.log(`P50 (Median): ${p50.toFixed(2)}ms`);
        console.log(`P95: ${p95.toFixed(2)}ms`);
        console.log(`P99: ${p99.toFixed(2)}ms`);

        // Calculate moving average
        const movingAverage = MetricAggregator.calculateMovingAverage(values, 5);
        console.log(`Moving average (last 5): ${movingAverage.slice(-5).map(v => v.toFixed(2)).join(', ')}`);

        // Detect anomalies
        const anomalies = MetricAggregator.detectAnomalies(values, 2);
        console.log(`Detected ${anomalies.length} anomalies (>2σ from mean)`);

        // Aggregate by time windows
        const hourlyAggregation = MetricAggregator.aggregateByTimeWindow(
            timeSeriesData.map(d => ({
                name: 'response_time',
                value: d.value,
                unit: 'ms',
                timestamp: d.timestamp,
                category: 'performance' as const
            })),
            3600000 // 1 hour
        );

        console.log('\nHourly Aggregation:');
        hourlyAggregation.forEach(window => {
            console.log(`${window.timestamp.toISOString()}: ${window.value.toFixed(2)}ms (${window.count} samples)`);
        });
    }

    // Example 7: Dashboard Data Formatting
    async dashboardFormattingExample(): Promise<void> {
        console.log('=== Dashboard Formatting Example ===');

        const dashboardData = this.monitoring.getDashboardData();

        // Format various metric values
        const examples = [
            { value: 1500, unit: 'ms', description: 'Response time' },
            { value: 256.7, unit: 'MB', description: 'Memory usage' },
            { value: 1250, unit: 'count', description: 'Request count' },
            { value: 85.3, unit: 'percent', description: 'CPU usage' },
            { value: 0.0023, unit: 'usd', description: 'API cost' }
        ];

        console.log('Formatted Metric Values:');
        examples.forEach(example => {
            const formatted = DashboardUtils.formatMetricValue(example.value, example.unit);
            console.log(`${example.description}: ${formatted}`);
        });

        // Status colors
        console.log('\nStatus Colors:');
        ['healthy', 'degraded', 'unhealthy', 'unknown'].forEach(status => {
            const color = DashboardUtils.getStatusColor(status as any);
            console.log(`${status}: ${color}`);
        });

        // Severity icons
        console.log('\nSeverity Icons:');
        ['low', 'medium', 'high', 'critical'].forEach(severity => {
            const icon = DashboardUtils.getSeverityIcon(severity as any);
            console.log(`${severity}: ${icon}`);
        });

        // Generate chart data
        const chartData = DashboardUtils.generateChartData(
            dashboardData.metrics.recent,
            300000 // 5-minute windows
        );

        console.log(`\nChart data points: ${chartData.length}`);
        if (chartData.length > 0) {
            console.log('Sample chart data:', chartData.slice(0, 3));
        }
    }

    // Example 8: Export and Reporting
    async exportReportingExample(): Promise<void> {
        console.log('=== Export and Reporting Example ===');

        // Export metrics in different formats
        console.log('Exporting metrics...');

        const jsonExport = this.monitoring.exportMetrics('json');
        const csvExport = this.monitoring.exportMetrics('csv');

        console.log(`JSON export size: ${jsonExport.length} characters`);
        console.log(`CSV export size: ${csvExport.length} characters`);

        // Save exports (in a real application)
        console.log('Exports generated successfully');

        // Generate comprehensive dashboard data
        const dashboardData = this.monitoring.getDashboardData();
        const report = this.monitoring.getPerformanceReport();

        const comprehensiveReport = {
            generatedAt: new Date().toISOString(),
            summary: report.summary,
            dashboard: dashboardData.overview,
            performance: dashboardData.performance,
            resources: dashboardData.resources,
            components: dashboardData.components,
            alerts: dashboardData.alerts,
            recommendations: report.actionItems
        };

        console.log('Comprehensive report generated:');
        console.log(JSON.stringify(comprehensiveReport, null, 2));
    }

    // Helper methods for generating sample data
    private generateSampleMetrics(): void {
        const metrics = [
            { name: 'api_response_time', value: 450, unit: 'ms', category: 'performance' as const },
            { name: 'js_heap_used', value: 85, unit: 'MB', category: 'memory' as const },
            { name: 'largest_contentful_paint', value: 2800, unit: 'ms', category: 'performance' as const },
            { name: 'first_input_delay', value: 120, unit: 'ms', category: 'performance' as const },
            { name: 'cumulative_layout_shift', value: 0.08, unit: 'score', category: 'performance' as const }
        ];

        metrics.forEach(metric => {
            this.monitoring['monitoringManager'].recordMetric({
                ...metric,
                timestamp: new Date(),
                tags: { source: 'example' }
            });
        });
    }

    private generateAlertTriggeringMetrics(): void {
        const alertMetrics = [
            { name: 'api_response_time', value: 3000, unit: 'ms', category: 'performance' as const },
            { name: 'api_error_count', value: 15, unit: 'count', category: 'error' as const },
            { name: 'js_heap_used', value: 180, unit: 'MB', category: 'memory' as const }
        ];

        alertMetrics.forEach(metric => {
            this.monitoring['monitoringManager'].recordMetric({
                ...metric,
                timestamp: new Date(),
                severity: 'high',
                tags: { source: 'alert-test' }
            });
        });
    }

    private generatePerformanceIssues(): void {
        const issueMetrics = [
            { name: 'api_response_time', value: 5000, unit: 'ms', category: 'performance' as const },
            { name: 'largest_contentful_paint', value: 6000, unit: 'ms', category: 'performance' as const },
            { name: 'js_heap_used', value: 200, unit: 'MB', category: 'memory' as const },
            { name: 'api_error_count', value: 25, unit: 'count', category: 'error' as const }
        ];

        issueMetrics.forEach(metric => {
            this.monitoring['monitoringManager'].recordMetric({
                ...metric,
                timestamp: new Date(),
                severity: 'critical',
                tags: { source: 'performance-test' }
            });
        });
    }

    private generateTimeSeriesData(): Array<{ timestamp: Date; value: number }> {
        const data = [];
        const baseTime = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago

        for (let i = 0; i < 100; i++) {
            const timestamp = new Date(baseTime + i * 15 * 60 * 1000); // Every 15 minutes
            const baseValue = 500 + Math.sin(i / 10) * 200; // Sine wave pattern
            const noise = (Math.random() - 0.5) * 100; // Random noise
            const anomaly = Math.random() < 0.05 ? Math.random() * 1000 : 0; // 5% chance of anomaly

            data.push({
                timestamp,
                value: Math.max(0, baseValue + noise + anomaly)
            });
        }

        return data;
    }

    // Run all examples
    async runAllExamples(): Promise<void> {
        console.log('=== Running Enterprise Monitoring Examples ===\n');

        try {
            await this.basicMonitoringExample();
            console.log('\n');

            await this.enterpriseIntegrationExample();
            console.log('\n');

            await this.performanceAnalysisExample();
            console.log('\n');

            await this.alertManagementExample();
            console.log('\n');

            await this.performanceOptimizationExample();
            console.log('\n');

            await this.metricAggregationExample();
            console.log('\n');

            await this.dashboardFormattingExample();
            console.log('\n');

            await this.exportReportingExample();
            console.log('\n');

            console.log('=== All monitoring examples completed successfully! ===');

        } catch (error) {
            console.error('Example execution failed:', error);
        } finally {
            // Cleanup
            this.monitoring.shutdown();
        }
    }
}
