'use client';

import { LLMManager } from '../../llm/LLMManager';
import { RealtimeManager } from '../../realtime/core/RealtimeManager';
import { TensorFlowModelManager } from '../../tensorflow/core/ModelManager';
import { PerformanceAnalyzer } from '../analytics/PerformanceAnalyzer';
import {
    APIPerformanceCollector,
    BrowserPerformanceCollector,
    ErrorCollector,
    UserInteractionCollector
} from '../collectors/PerformanceCollectors';
import { Alert, MonitoringConfig, MonitoringManager, PerformanceMetric, SystemHealth } from '../core/MonitoringManager';

// Enterprise monitoring integration for the entire AI system
export class EnterpriseMonitoring {
    private monitoringManager: MonitoringManager;
    private collectors: {
        browser: BrowserPerformanceCollector;
        api: APIPerformanceCollector;
        error: ErrorCollector;
        interaction: UserInteractionCollector;
    };
    private integrations: {
        llm?: LLMManager;
        tensorflow?: TensorFlowModelManager;
        realtime?: RealtimeManager;
    } = {};
    private dashboardData: DashboardData = this.initializeDashboardData();
    private alertChannels: Map<string, AlertChannel> = new Map();

    constructor(config: Partial<MonitoringConfig> = {}) {
        const defaultConfig: MonitoringConfig = {
            enabled: true,
            metricsRetention: 7, // 7 days
            samplingRate: 1.0, // 100% sampling
            alerting: {
                enabled: true,
                defaultChannels: ['console', 'ui']
            },
            performance: {
                trackPageLoad: true,
                trackApiCalls: true,
                trackUserInteractions: true,
                trackErrors: true
            },
            privacy: {
                anonymizeIPs: true,
                excludePII: true
            },
            ...config
        };

        this.monitoringManager = new MonitoringManager(defaultConfig);
        this.setupCollectors();
        this.setupEventHandlers();
        this.setupAlertChannels();
        this.startDashboardUpdates();
    }

    // Integrate with system components
    integrateWithLLM(llmManager: LLMManager): void {
        this.integrations.llm = llmManager;
        this.setupLLMMonitoring();
    }

    integrateWithTensorFlow(tfManager: TensorFlowModelManager): void {
        this.integrations.tensorflow = tfManager;
        this.setupTensorFlowMonitoring();
    }

    integrateWithRealtime(realtimeManager: RealtimeManager): void {
        this.integrations.realtime = realtimeManager;
        this.setupRealtimeMonitoring();
    }

    // Setup collectors
    private setupCollectors(): void {
        this.collectors = {
            browser: new BrowserPerformanceCollector(),
            api: new APIPerformanceCollector(),
            error: new ErrorCollector(),
            interaction: new UserInteractionCollector()
        };

        // Add collectors to monitoring manager
        Object.values(this.collectors).forEach(collector => {
            this.monitoringManager.addCollector(collector);
        });
    }

    // Setup event handlers
    private setupEventHandlers(): void {
        this.monitoringManager.on('metric', this.handleMetric.bind(this));
        this.monitoringManager.on('alert-triggered', this.handleAlert.bind(this));
        this.monitoringManager.on('system-health', this.handleSystemHealth.bind(this));
    }

    // Setup alert channels
    private setupAlertChannels(): void {
        // Console alert channel
        this.alertChannels.set('console', {
            name: 'Console',
            send: (alert: Alert) => {
                console.warn(`[ALERT] ${alert.message}`, alert);
            }
        });

        // UI alert channel (would integrate with notification system)
        this.alertChannels.set('ui', {
            name: 'UI Notifications',
            send: (alert: Alert) => {
                this.showUIAlert(alert);
            }
        });

        // Custom webhook channel
        this.alertChannels.set('webhook', {
            name: 'Webhook',
            send: async (alert: Alert) => {
                try {
                    await fetch('/api/alerts/webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(alert)
                    });
                } catch (error) {
                    console.error('Failed to send webhook alert:', error);
                }
            }
        });
    }

    // LLM monitoring setup
    private setupLLMMonitoring(): void {
        if (!this.integrations.llm) return;

        const llmManager = this.integrations.llm;

        // Monitor LLM API calls
        const originalComplete = llmManager.complete.bind(llmManager);
        llmManager.complete = async (request: any) => {
            const startTime = performance.now();

            try {
                const response = await originalComplete(request);
                const endTime = performance.now();

                this.recordLLMMetrics({
                    operation: 'complete',
                    duration: endTime - startTime,
                    success: true,
                    model: request.model,
                    tokens: response.usage?.totalTokens || 0,
                    cost: response.cost || 0
                });

                return response;
            } catch (error) {
                const endTime = performance.now();

                this.recordLLMMetrics({
                    operation: 'complete',
                    duration: endTime - startTime,
                    success: false,
                    model: request.model,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });

                throw error;
            }
        };
    }

    // TensorFlow monitoring setup
    private setupTensorFlowMonitoring(): void {
        if (!this.integrations.tensorflow) return;

        const tfManager = this.integrations.tensorflow;

        // Monitor model predictions
        const originalPredict = tfManager.predict.bind(tfManager);
        tfManager.predict = async (modelId: string, input: any) => {
            const startTime = performance.now();

            try {
                const result = await originalPredict(modelId, input);
                const endTime = performance.now();

                this.recordTensorFlowMetrics({
                    operation: 'predict',
                    modelId,
                    duration: endTime - startTime,
                    success: true
                });

                return result;
            } catch (error) {
                const endTime = performance.now();

                this.recordTensorFlowMetrics({
                    operation: 'predict',
                    modelId,
                    duration: endTime - startTime,
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });

                throw error;
            }
        };

        // Monitor memory usage
        setInterval(() => {
            const memoryUsage = tfManager.getMemoryUsage();

            this.monitoringManager.recordMetric({
                name: 'tensorflow_memory_usage',
                value: memoryUsage.totalBytes / 1024 / 1024, // Convert to MB
                unit: 'MB',
                timestamp: new Date(),
                category: 'memory',
                tags: { component: 'tensorflow' }
            });
        }, 30000); // Every 30 seconds
    }

    // Realtime monitoring setup
    private setupRealtimeMonitoring(): void {
        if (!this.integrations.realtime) return;

        const realtimeManager = this.integrations.realtime;

        // Monitor realtime metrics
        setInterval(() => {
            const metrics = realtimeManager.getMetrics().getMetrics();

            Object.entries(metrics).forEach(([key, value]) => {
                this.monitoringManager.recordMetric({
                    name: `realtime_${key}`,
                    value: typeof value === 'number' ? value : 0,
                    unit: this.getUnitForRealtimeMetric(key),
                    timestamp: new Date(),
                    category: 'performance',
                    tags: { component: 'realtime' }
                });
            });
        }, 60000); // Every minute
    }

    // Event handlers
    private handleMetric(metric: PerformanceMetric): void {
        this.updateDashboardData(metric);
    }

    private handleAlert(alert: Alert): void {
        // Send alert through configured channels
        alert.rule.channels.forEach(channelName => {
            const channel = this.alertChannels.get(channelName);
            if (channel) {
                channel.send(alert);
            }
        });
    }

    private handleSystemHealth(health: SystemHealth): void {
        this.dashboardData.systemHealth = health;
    }

    // Record component-specific metrics
    private recordLLMMetrics(data: {
        operation: string;
        duration: number;
        success: boolean;
        model?: string;
        tokens?: number;
        cost?: number;
        error?: string;
    }): void {
        const { operation, duration, success, model, tokens, cost, error } = data;

        // Response time metric
        this.monitoringManager.recordMetric({
            name: 'llm_response_time',
            value: duration,
            unit: 'ms',
            timestamp: new Date(),
            category: 'performance',
            severity: duration > 10000 ? 'high' : duration > 5000 ? 'medium' : 'low',
            tags: { operation, model: model || 'unknown' }
        });

        // Success/error metric
        this.monitoringManager.recordMetric({
            name: 'llm_request_status',
            value: success ? 1 : 0,
            unit: 'count',
            timestamp: new Date(),
            category: success ? 'business' : 'error',
            severity: success ? 'low' : 'high',
            tags: { operation, model: model || 'unknown', status: success ? 'success' : 'error' }
        });

        // Token usage metric
        if (tokens) {
            this.monitoringManager.recordMetric({
                name: 'llm_token_usage',
                value: tokens,
                unit: 'tokens',
                timestamp: new Date(),
                category: 'business',
                tags: { operation, model: model || 'unknown' }
            });
        }

        // Cost metric
        if (cost) {
            this.monitoringManager.recordMetric({
                name: 'llm_cost',
                value: cost,
                unit: 'usd',
                timestamp: new Date(),
                category: 'business',
                tags: { operation, model: model || 'unknown' }
            });
        }
    }

    private recordTensorFlowMetrics(data: {
        operation: string;
        modelId: string;
        duration: number;
        success: boolean;
        error?: string;
    }): void {
        const { operation, modelId, duration, success, error } = data;

        // Inference time metric
        this.monitoringManager.recordMetric({
            name: 'tensorflow_inference_time',
            value: duration,
            unit: 'ms',
            timestamp: new Date(),
            category: 'performance',
            severity: duration > 1000 ? 'high' : duration > 500 ? 'medium' : 'low',
            tags: { operation, modelId }
        });

        // Success/error metric
        this.monitoringManager.recordMetric({
            name: 'tensorflow_prediction_status',
            value: success ? 1 : 0,
            unit: 'count',
            timestamp: new Date(),
            category: success ? 'business' : 'error',
            severity: success ? 'low' : 'high',
            tags: { operation, modelId, status: success ? 'success' : 'error' }
        });
    }

    // Dashboard data management
    private initializeDashboardData(): DashboardData {
        return {
            overview: {
                overallScore: 100,
                status: 'healthy',
                lastUpdated: new Date(),
                criticalAlerts: 0,
                activeUsers: 0
            },
            performance: {
                responseTime: 0,
                throughput: 0,
                errorRate: 0,
                availability: 100
            },
            resources: {
                memoryUsage: 0,
                cpuUsage: 0,
                networkUsage: 0
            },
            components: {
                llm: { status: 'unknown', responseTime: 0, errorRate: 0 },
                tensorflow: { status: 'unknown', responseTime: 0, errorRate: 0 },
                realtime: { status: 'unknown', responseTime: 0, errorRate: 0 }
            },
            alerts: [],
            systemHealth: null,
            metrics: {
                recent: [],
                hourly: [],
                daily: []
            }
        };
    }

    private updateDashboardData(metric: PerformanceMetric): void {
        // Add to recent metrics
        this.dashboardData.metrics.recent.push(metric);

        // Keep only last 100 recent metrics
        if (this.dashboardData.metrics.recent.length > 100) {
            this.dashboardData.metrics.recent = this.dashboardData.metrics.recent.slice(-100);
        }

        // Update specific dashboard sections based on metric
        this.updateOverviewMetrics(metric);
        this.updatePerformanceMetrics(metric);
        this.updateResourceMetrics(metric);
        this.updateComponentMetrics(metric);
    }

    private updateOverviewMetrics(metric: PerformanceMetric): void {
        // Update overall score based on recent metrics
        const recentMetrics = this.dashboardData.metrics.recent.slice(-20);
        const criticalMetrics = recentMetrics.filter(m => m.severity === 'critical' || m.severity === 'high');

        const baseScore = 100;
        const deduction = criticalMetrics.length * 5; // 5 points per critical metric

        this.dashboardData.overview.overallScore = Math.max(0, baseScore - deduction);
        this.dashboardData.overview.status = this.getStatusFromScore(this.dashboardData.overview.overallScore);
        this.dashboardData.overview.lastUpdated = new Date();
    }

    private updatePerformanceMetrics(metric: PerformanceMetric): void {
        switch (metric.name) {
            case 'api_response_time':
            case 'llm_response_time':
            case 'tensorflow_inference_time':
                this.dashboardData.performance.responseTime = metric.value;
                break;
            case 'api_request_count':
                this.dashboardData.performance.throughput = metric.value;
                break;
            case 'api_error_count':
                this.dashboardData.performance.errorRate = metric.value;
                break;
        }
    }

    private updateResourceMetrics(metric: PerformanceMetric): void {
        switch (metric.name) {
            case 'js_heap_used':
            case 'tensorflow_memory_usage':
                this.dashboardData.resources.memoryUsage = metric.value;
                break;
            case 'cpu_usage':
                this.dashboardData.resources.cpuUsage = metric.value;
                break;
            case 'network_usage':
                this.dashboardData.resources.networkUsage = metric.value;
                break;
        }
    }

    private updateComponentMetrics(metric: PerformanceMetric): void {
        if (metric.tags?.component) {
            const component = metric.tags.component as keyof typeof this.dashboardData.components;

            if (this.dashboardData.components[component]) {
                if (metric.name.includes('response_time') || metric.name.includes('inference_time')) {
                    this.dashboardData.components[component].responseTime = metric.value;
                }

                if (metric.name.includes('error') || metric.name.includes('status')) {
                    this.dashboardData.components[component].errorRate = metric.value;
                }

                this.dashboardData.components[component].status =
                    metric.severity === 'high' || metric.severity === 'critical' ? 'unhealthy' : 'healthy';
            }
        }
    }

    private startDashboardUpdates(): void {
        // Update dashboard every 30 seconds
        setInterval(() => {
            this.generateDashboardAnalytics();
        }, 30000);
    }

    private generateDashboardAnalytics(): void {
        const recentMetrics = this.dashboardData.metrics.recent;

        if (recentMetrics.length > 0) {
            const analytics = PerformanceAnalyzer.generatePerformanceReport(recentMetrics);

            // Update dashboard with analytics
            this.dashboardData.overview.overallScore = analytics.summary.overallScore;
            this.dashboardData.overview.status = this.getStatusFromScore(analytics.summary.overallScore);
            this.dashboardData.overview.criticalAlerts = analytics.summary.criticalIssues;
        }
    }

    // Utility methods
    private getStatusFromScore(score: number): 'healthy' | 'degraded' | 'unhealthy' {
        if (score >= 80) return 'healthy';
        if (score >= 60) return 'degraded';
        return 'unhealthy';
    }

    private getUnitForRealtimeMetric(key: string): string {
        if (key.includes('count')) return 'count';
        if (key.includes('time')) return 'ms';
        if (key.includes('rate')) return 'rate';
        return 'value';
    }

    private showUIAlert(alert: Alert): void {
        // This would integrate with your UI notification system
        console.log('UI Alert:', alert.message);
    }

    // Public API
    getDashboardData(): DashboardData {
        return { ...this.dashboardData };
    }

    getPerformanceReport(timeRange?: { start: Date; end: Date }): any {
        const metrics = timeRange
            ? this.monitoringManager.getMetrics().filter(m =>
                m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
            )
            : this.dashboardData.metrics.recent;

        return PerformanceAnalyzer.generatePerformanceReport(metrics);
    }

    getActiveAlerts(): Alert[] {
        return this.monitoringManager.getActiveAlerts();
    }

    addCustomAlert(rule: any): void {
        this.monitoringManager.addAlertRule(rule);
    }

    exportMetrics(format: 'json' | 'csv' = 'json'): string {
        return this.monitoringManager.exportMetrics(format);
    }

    // Shutdown
    shutdown(): void {
        this.monitoringManager.shutdown();
    }
}

// Types
interface AlertChannel {
    name: string;
    send: (alert: Alert) => void | Promise<void>;
}

interface DashboardData {
    overview: {
        overallScore: number;
        status: 'healthy' | 'degraded' | 'unhealthy';
        lastUpdated: Date;
        criticalAlerts: number;
        activeUsers: number;
    };
    performance: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        availability: number;
    };
    resources: {
        memoryUsage: number;
        cpuUsage: number;
        networkUsage: number;
    };
    components: {
        llm: ComponentStatus;
        tensorflow: ComponentStatus;
        realtime: ComponentStatus;
    };
    alerts: Alert[];
    systemHealth: SystemHealth | null;
    metrics: {
        recent: PerformanceMetric[];
        hourly: PerformanceMetric[];
        daily: PerformanceMetric[];
    };
}

interface ComponentStatus {
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
    responseTime: number;
    errorRate: number;
}
