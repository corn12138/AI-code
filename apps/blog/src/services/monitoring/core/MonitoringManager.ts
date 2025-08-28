'use client';

// Core monitoring interfaces and types
export interface Metric {
  name: string;
  value: number | string | boolean;
  timestamp: Date;
  tags?: Record<string, string>;
  unit?: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
}

export interface Alert {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
  resolved: boolean;
  source: string;
  metadata?: Record<string, any>;
}

export interface MonitoringConfig {
  enabled: boolean;
  sampleRate: number;
  maxMetrics: number;
  alertThresholds: Record<string, {
    warning: number;
    critical: number;
  }>;
  retentionPeriod: number; // in seconds
  exportInterval: number; // in ms
}

export interface MetricStorage {
  store(metric: Metric): Promise<void>;
  query(name: string, startTime: Date, endTime: Date): Promise<Metric[]>;
  clear(beforeTime: Date): Promise<void>;
}

// In-memory metric storage implementation
export class InMemoryMetricStorage implements MetricStorage {
  private metrics: Map<string, Metric[]> = new Map();

  async store(metric: Metric): Promise<void> {
    const key = metric.name;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }

    const metricList = this.metrics.get(key)!;
    metricList.push(metric);

    // Sort by timestamp
    metricList.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async query(name: string, startTime: Date, endTime: Date): Promise<Metric[]> {
    const metricList = this.metrics.get(name) || [];

    return metricList.filter(metric =>
      metric.timestamp >= startTime && metric.timestamp <= endTime
    );
  }

  async clear(beforeTime: Date): Promise<void> {
    for (const [name, metricList] of this.metrics.entries()) {
      const filtered = metricList.filter(metric => metric.timestamp >= beforeTime);
      this.metrics.set(name, filtered);
    }
  }

  getAllMetrics(): Map<string, Metric[]> {
    return new Map(this.metrics);
  }

  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }
}

// Main monitoring manager
export class MonitoringManager {
  private config: MonitoringConfig;
  private storage: MetricStorage;
  private alerts: Alert[] = [];
  private collectors: Map<string, MetricCollector> = new Map();
  private alertHandlers: Array<(alert: Alert) => void> = [];
  private exportTimer?: NodeJS.Timeout;

  constructor(config: Partial<MonitoringConfig> = {}, storage?: MetricStorage) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxMetrics: 10000,
      alertThresholds: {},
      retentionPeriod: 7 * 24 * 60 * 60, // 7 days in seconds
      exportInterval: 60000, // 1 minute
      ...config
    };

    this.storage = storage || new InMemoryMetricStorage();

    if (this.config.enabled) {
      this.startExportTimer();
      this.startCleanupTimer();
    }
  }

  // Register a metric collector
  registerCollector(name: string, collector: MetricCollector): void {
    this.collectors.set(name, collector);
    collector.setMonitoring(this);
  }

  // Record a metric
  async recordMetric(metric: Metric): Promise<void> {
    if (!this.config.enabled) return;

    // Apply sampling
    if (Math.random() > this.config.sampleRate) return;

    try {
      await this.storage.store(metric);
      this.checkAlertThresholds(metric);
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }

  // Create and record metrics
  counter(name: string, value: number = 1, tags?: Record<string, string>): void {
    this.recordMetric({
      name,
      value,
      timestamp: new Date(),
      tags,
      type: 'counter'
    });
  }

  gauge(name: string, value: number, tags?: Record<string, string>, unit?: string): void {
    this.recordMetric({
      name,
      value,
      timestamp: new Date(),
      tags,
      unit,
      type: 'gauge'
    });
  }

  // Create an alert
  createAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): Alert {
    const fullAlert: Alert = {
      ...alert,
      id: this.generateAlertId(),
      timestamp: new Date(),
      resolved: false
    };

    this.alerts.push(fullAlert);

    // Notify handlers
    this.alertHandlers.forEach(handler => {
      try {
        handler(fullAlert);
      } catch (error) {
        console.error('Alert handler error:', error);
      }
    });

    return fullAlert;
  }

  // Get active alerts
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  // Add alert handler
  onAlert(handler: (alert: Alert) => void): void {
    this.alertHandlers.push(handler);
  }

  // Start all registered collectors
  async startCollectors(): Promise<void> {
    for (const [name, collector] of this.collectors) {
      try {
        await collector.start();
      } catch (error) {
        console.error(`Failed to start collector ${name}:`, error);
      }
    }
  }

  // Shutdown monitoring
  shutdown(): void {
    this.stopCollectors();

    if (this.exportTimer) {
      clearInterval(this.exportTimer);
    }

    this.config.enabled = false;
  }

  // Private methods
  private async stopCollectors(): Promise<void> {
    for (const [name, collector] of this.collectors) {
      try {
        await collector.stop();
      } catch (error) {
        console.error(`Failed to stop collector ${name}:`, error);
      }
    }
  }

  private checkAlertThresholds(metric: Metric): void {
    const threshold = this.config.alertThresholds[metric.name];
    if (!threshold || typeof metric.value !== 'number') return;

    if (metric.value >= threshold.critical) {
      this.createAlert({
        name: `${metric.name} Critical Threshold`,
        severity: 'critical',
        message: `Metric ${metric.name} value ${metric.value} exceeds critical threshold ${threshold.critical}`,
        source: 'threshold_monitor',
        metadata: { metric, threshold }
      });
    } else if (metric.value >= threshold.warning) {
      this.createAlert({
        name: `${metric.name} Warning Threshold`,
        severity: 'medium',
        message: `Metric ${metric.name} value ${metric.value} exceeds warning threshold ${threshold.warning}`,
        source: 'threshold_monitor',
        metadata: { metric, threshold }
      });
    }
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startExportTimer(): void {
    this.exportTimer = setInterval(() => {
      this.exportMetrics();
    }, this.config.exportInterval);
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  private async exportMetrics(): Promise<void> {
    // Export to external systems
    console.log('Exporting metrics...');
  }

  private async cleanup(): Promise<void> {
    const cutoffTime = new Date(Date.now() - this.config.retentionPeriod * 1000);

    try {
      await this.storage.clear(cutoffTime);
      this.alerts = this.alerts.filter(alert =>
        alert.timestamp.getTime() > cutoffTime.getTime()
      );
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  }
}

// Base metric collector interface
export abstract class MetricCollector {
  protected monitoring?: MonitoringManager;
  protected running = false;
  protected interval?: NodeJS.Timeout;

  abstract getName(): string;
  abstract collect(): Promise<void>;

  setMonitoring(monitoring: MonitoringManager): void {
    this.monitoring = monitoring;
  }

  async start(): Promise<void> {
    if (this.running) return;

    this.running = true;
    await this.collect();

    this.interval = setInterval(() => {
      this.collect().catch(console.error);
    }, this.getCollectionInterval());
  }

  async stop(): Promise<void> {
    this.running = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
  }

  protected getCollectionInterval(): number {
    return 30000; // 30 seconds default
  }

  protected recordMetric(metric: Omit<Metric, 'timestamp'>): void {
    if (this.monitoring) {
      this.monitoring.recordMetric({
        ...metric,
        timestamp: new Date()
      });
    }
  }
}