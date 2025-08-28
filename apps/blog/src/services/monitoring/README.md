# Enterprise Monitoring and Performance Optimization System

This directory contains a comprehensive enterprise-grade monitoring system that provides real-time performance tracking, error monitoring, alerting, and optimization recommendations for the entire AI platform.

## Overview

The enterprise monitoring system provides:

- **Real-time Performance Monitoring**: Track Core Web Vitals, API performance, and resource usage
- **Error Tracking**: Comprehensive JavaScript error and promise rejection monitoring
- **Alert Management**: Configurable alerts with multiple notification channels
- **Performance Analytics**: Advanced analytics with trend analysis and recommendations
- **System Health Monitoring**: Health checks and status monitoring for all components
- **Integration Support**: Seamless integration with LLM, TensorFlow, and Realtime services
- **Dashboard Analytics**: Rich dashboard data with visualization utilities

## Architecture

```
monitoring/
├── core/           # Core monitoring manager and interfaces
├── collectors/     # Performance data collectors
├── analytics/      # Performance analysis utilities
├── integrations/   # Enterprise system integrations
├── examples/       # Usage examples and demos
└── index.ts        # Main exports and builders
```

## Core Components

### MonitoringManager (`core/MonitoringManager.ts`)

Central monitoring coordinator that manages metrics, alerts, and health checks:

```typescript
const monitoringManager = new MonitoringManager({
  enabled: true,
  metricsRetention: 7, // days
  samplingRate: 1.0,
  alerting: {
    enabled: true,
    defaultChannels: ['console', 'ui']
  }
});

// Record metrics
monitoringManager.recordMetric({
  name: 'api_response_time',
  value: 450,
  unit: 'ms',
  timestamp: new Date(),
  category: 'performance'
});

// Add alert rules
monitoringManager.addAlertRule({
  id: 'high-response-time',
  name: 'High Response Time',
  metric: 'api_response_time',
  condition: 'gt',
  threshold: 2000,
  severity: 'high'
});
```

### Performance Collectors (`collectors/PerformanceCollectors.ts`)

Automated data collection for various performance metrics:

#### BrowserPerformanceCollector
- Core Web Vitals (LCP, FID, CLS)
- Page load timing
- Memory usage (JS heap)
- Navigation timing
- Resource loading

#### APIPerformanceCollector
- Response times
- Error rates
- Throughput metrics
- Endpoint-specific analysis

#### ErrorCollector
- JavaScript errors
- Unhandled promise rejections
- Stack traces and context

#### UserInteractionCollector
- Click, scroll, keyboard events
- User engagement metrics

### Performance Analyzer (`analytics/PerformanceAnalyzer.ts`)

Advanced analytics and reporting:

```typescript
// Analyze Core Web Vitals
const webVitals = PerformanceAnalyzer.analyzeWebVitals(metrics);
console.log('LCP Rating:', webVitals.lcp.rating); // 'good' | 'needs-improvement' | 'poor'

// Generate comprehensive report
const report = PerformanceAnalyzer.generatePerformanceReport(metrics);
console.log('Overall Score:', report.summary.overallScore);
console.log('Action Items:', report.actionItems);
```

### Enterprise Integration (`integrations/EnterpriseMonitoring.ts`)

Complete integration with all system components:

```typescript
const monitoring = new EnterpriseMonitoring({
  enabled: true,
  metricsRetention: 30,
  performance: {
    trackPageLoad: true,
    trackApiCalls: true,
    trackUserInteractions: true,
    trackErrors: true
  }
});

// Integrate with system components
monitoring.integrateWithLLM(llmManager);
monitoring.integrateWithTensorFlow(tensorflowManager);
monitoring.integrateWithRealtime(realtimeManager);
```

## Quick Start

### 1. Basic Setup

```typescript
import { MonitoringBuilder } from './monitoring';

// Create monitoring instance
const monitoring = MonitoringBuilder.createBasicMonitoring({
  enabled: true,
  alerting: {
    enabled: true,
    defaultChannels: ['console']
  }
});

// Start monitoring automatically
console.log('Monitoring started');
```

### 2. Production Setup

```typescript
import { MONITORING_PRESETS } from './monitoring';

// Use production preset
const monitoring = MONITORING_PRESETS.PRODUCTION();

// Integrate with your systems
monitoring.integrateWithLLM(llmManager);
monitoring.integrateWithTensorFlow(tensorflowManager);
monitoring.integrateWithRealtime(realtimeManager);
```

### 3. Custom Alerts

```typescript
import { ALERT_RULE_TEMPLATES } from './monitoring';

// Add predefined alert rules
monitoring.addCustomAlert({
  ...ALERT_RULE_TEMPLATES.HIGH_RESPONSE_TIME,
  id: 'api-performance',
  channels: ['console', 'webhook']
});

// Add custom alert
monitoring.addCustomAlert({
  id: 'memory-usage',
  name: 'High Memory Usage',
  metric: 'js_heap_used',
  condition: 'gt',
  threshold: 100, // 100MB
  duration: 300000, // 5 minutes
  severity: 'high',
  enabled: true,
  channels: ['ui', 'email']
});
```

## Performance Monitoring

### Core Web Vitals Tracking

Automatic tracking of Google's Core Web Vitals:

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP (Largest Contentful Paint) | ≤2.5s | ≤4.0s | >4.0s |
| FID (First Input Delay) | ≤100ms | ≤300ms | >300ms |
| CLS (Cumulative Layout Shift) | ≤0.1 | ≤0.25 | >0.25 |

### API Performance Metrics

- **Response Time**: Track API endpoint response times
- **Error Rate**: Monitor API error rates by endpoint
- **Throughput**: Measure requests per minute
- **Success Rate**: Track successful vs failed requests

### Resource Monitoring

- **Memory Usage**: JavaScript heap usage tracking
- **CPU Usage**: Performance impact monitoring
- **Network Usage**: Request size and timing
- **Bundle Size**: Track JavaScript bundle metrics

## Alert Management

### Built-in Alert Rules

```typescript
// High response time alert
ALERT_RULE_TEMPLATES.HIGH_RESPONSE_TIME: {
  metric: 'api_response_time',
  threshold: 2000, // 2 seconds
  severity: 'high'
}

// High error rate alert
ALERT_RULE_TEMPLATES.HIGH_ERROR_RATE: {
  metric: 'api_error_count',
  threshold: 5, // 5%
  severity: 'critical'
}

// Memory usage alert
ALERT_RULE_TEMPLATES.MEMORY_USAGE_HIGH: {
  metric: 'js_heap_used',
  threshold: 100, // 100MB
  severity: 'high'
}
```

### Alert Channels

- **Console**: Log alerts to browser console
- **UI**: Display in-app notifications
- **Webhook**: Send to external systems
- **Email**: Email notifications (configurable)
- **Slack**: Slack channel integration (configurable)

## Analytics and Reporting

### Performance Analytics

```typescript
const analytics = monitoring.getPerformanceReport();

console.log('Summary:', analytics.summary);
console.log('Web Vitals:', analytics.webVitals);
console.log('API Performance:', analytics.api);
console.log('Memory Usage:', analytics.memory);
console.log('User Experience:', analytics.userExperience);
```

### Optimization Recommendations

```typescript
import { PerformanceOptimizer } from './monitoring';

const optimizer = new PerformanceOptimizer(monitoring);

const recommendations = optimizer.getOptimizationRecommendations();
console.log('Critical:', recommendations.critical);
console.log('Important:', recommendations.important);
console.log('Suggested:', recommendations.suggested);

const actions = optimizer.getAutoOptimizationActions();
console.log('Prioritized actions:', actions);
```

### Metric Aggregation

```typescript
import { MetricAggregator } from './monitoring';

// Calculate percentiles
const p95 = MetricAggregator.calculatePercentile(values, 95);

// Moving averages
const movingAvg = MetricAggregator.calculateMovingAverage(values, 10);

// Anomaly detection
const anomalies = MetricAggregator.detectAnomalies(values, 2);

// Time window aggregation
const hourlyData = MetricAggregator.aggregateByTimeWindow(metrics, 3600000);
```

## Dashboard Integration

### Real-time Dashboard Data

```typescript
const dashboardData = monitoring.getDashboardData();

console.log('Overview:', dashboardData.overview);
console.log('Performance:', dashboardData.performance);
console.log('Resources:', dashboardData.resources);
console.log('Components:', dashboardData.components);
console.log('Active Alerts:', dashboardData.alerts);
```

### Data Formatting Utilities

```typescript
import { DashboardUtils } from './monitoring';

// Format metric values
const formatted = DashboardUtils.formatMetricValue(1500, 'ms'); // "1.5s"

// Status colors
const color = DashboardUtils.getStatusColor('healthy'); // "#10B981"

// Severity icons
const icon = DashboardUtils.getSeverityIcon('high'); // "🚨"

// Chart data generation
const chartData = DashboardUtils.generateChartData(metrics, 300000);
```

## System Integration

### LLM Integration

Monitors LLM API calls and performance:

```typescript
// Automatic monitoring of:
// - Response times
// - Success/error rates
// - Token usage
// - Cost tracking
// - Model-specific metrics
```

### TensorFlow Integration

Tracks model inference and memory:

```typescript
// Monitors:
// - Inference times
// - Model loading
// - Memory usage
// - Prediction success rates
// - GPU utilization
```

### Realtime Integration

Monitors WebSocket/SSE connections:

```typescript
// Tracks:
// - Connection counts
// - Message rates
// - Latency
// - Error rates
// - Reconnection attempts
```

## Configuration Options

### Basic Configuration

```typescript
const config = {
  enabled: true,
  metricsRetention: 7, // days
  samplingRate: 1.0, // 100%
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
  }
};
```

### Environment-Specific Presets

```typescript
// Development
MONITORING_PRESETS.DEVELOPMENT(): {
  samplingRate: 0.1, // 10% sampling
  alerting: { enabled: false }
}

// Staging
MONITORING_PRESETS.STAGING(): {
  samplingRate: 0.5, // 50% sampling
  alerting: { enabled: true, channels: ['console'] }
}

// Production
MONITORING_PRESETS.PRODUCTION(): {
  samplingRate: 1.0, // 100% sampling
  alerting: { enabled: true, channels: ['console', 'ui', 'webhook'] }
}
```

## Performance Benchmarks

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| API Response Time | <500ms | <2000ms | <5000ms |
| Page Load Time | <2000ms | <4000ms | <8000ms |
| Memory Usage | <50MB | <100MB | <200MB |
| Error Rate | <1% | <5% | <10% |
| Core Web Vitals | Good | Needs Improvement | Poor |

## Export and Reporting

### Data Export

```typescript
// Export metrics
const jsonData = monitoring.exportMetrics('json');
const csvData = monitoring.exportMetrics('csv');

// Performance report
const report = monitoring.getPerformanceReport({
  start: new Date(Date.now() - 24 * 60 * 60 * 1000),
  end: new Date()
});
```

### Custom Reports

```typescript
// Generate custom dashboard report
const customReport = {
  generatedAt: new Date(),
  summary: dashboardData.overview,
  performance: analytics.summary,
  recommendations: optimizer.getOptimizationRecommendations(),
  alerts: monitoring.getActiveAlerts()
};
```

## Best Practices

### 1. Sampling Strategy
- Use 100% sampling in production for critical metrics
- Use 10-50% sampling for high-volume non-critical metrics
- Always sample errors and alerts at 100%

### 2. Alert Configuration
- Set appropriate thresholds based on baseline performance
- Use different severity levels for escalation
- Configure multiple notification channels for critical alerts

### 3. Performance Optimization
- Monitor Core Web Vitals continuously
- Set up automated performance budgets
- Use trend analysis to predict issues before they occur

### 4. Data Retention
- Keep detailed metrics for 7-30 days
- Aggregate older data for long-term trends
- Export critical data for compliance requirements

## Security and Privacy

### Privacy Controls
- IP anonymization
- PII exclusion
- Data encryption in transit
- Configurable data retention

### Security Features
- Input validation
- Rate limiting
- Secure webhook endpoints
- Authentication for sensitive operations

## Examples

See `examples/MonitoringUsage.ts` for comprehensive examples including:

1. Basic monitoring setup
2. Enterprise integration
3. Performance analysis
4. Alert management
5. Performance optimization
6. Metric aggregation
7. Dashboard formatting
8. Export and reporting

This enterprise monitoring system provides the foundation for maintaining high performance, reliability, and user experience across your entire AI platform.
