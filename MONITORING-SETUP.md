# 📊 Blog系统 Prometheus + Grafana 监控方案

## 🎯 监控方案概述

这是一个为你的博客系统量身定制的完整监控解决方案，包含：

### ✅ **已实现功能**
- **Prometheus** - 指标收集和存储
- **Grafana** - 数据可视化和仪表盘
- **Node Exporter** - 系统级指标收集
- **Postgres Exporter** - 数据库指标收集
- **应用指标** - 自定义应用级监控
- **告警规则** - 智能问题检测
- **完整仪表盘** - 开箱即用的监控面板

## 🚀 快速启动

### 1. 启动监控系统
```bash
# 使用一键启动脚本
chmod +x start-monitoring.sh
./start-monitoring.sh

# 或者手动启动
docker-compose up -d prometheus grafana node-exporter postgres-exporter
```

### 2. 访问监控界面
- **Grafana仪表盘**: http://localhost:3003
  - 用户名: `admin`
  - 密码: `admin123`
- **Prometheus**: http://localhost:9090
- **应用指标**:
  - NestJS: http://localhost:3001/api/metrics
  - Next.js: http://localhost:3000/api/metrics

## 📈 监控指标详解

### 🔧 **系统指标** (Node Exporter)
- **CPU使用率**: 实时CPU负载监控
- **内存使用**: 内存使用率和可用内存
- **磁盘空间**: 磁盘使用情况
- **网络I/O**: 网络流量监控

### 🗄️ **数据库指标** (Postgres Exporter)
- **连接数**: 当前活跃连接数
- **查询性能**: 慢查询监控
- **锁等待**: 数据库锁状态
- **缓存命中率**: 查询缓存效率

### 🌐 **应用指标** (自定义)
- **HTTP请求量**: 请求总数和速率
- **响应时间**: 平均和百分位响应时间
- **错误率**: 4xx/5xx错误监控
- **业务指标**: 用户数、文章数等

### ⚡ **性能指标**
- **请求延迟分布**: P50, P95, P99延迟
- **并发处理**: 同时处理请求数
- **内存泄漏检测**: 内存使用趋势

## 🎨 仪表盘功能

### 📊 **博客系统总览仪表盘**
- **服务状态面板**: 所有服务健康状态
- **性能概览**: 关键性能指标汇总
- **实时监控**: 请求量和响应时间
- **资源使用**: CPU、内存、磁盘监控
- **业务指标**: 用户活跃度、内容统计

### 🔍 **详细监控面板**
- **数据库性能**: 连接池、查询性能
- **API监控**: 各个接口的详细指标
- **错误追踪**: 错误日志和趋势分析

## 🚨 告警配置

### ⚠️ **已配置告警规则**
1. **服务下线告警** - 服务停止响应时立即通知
2. **高CPU使用率** - CPU使用率>80%持续5分钟
3. **高内存使用率** - 内存使用率>85%持续5分钟
4. **数据库连接失败** - 数据库无法连接超过30秒
5. **HTTP响应时间过长** - 95%请求响应时间>500ms
6. **高错误率** - 5xx错误率>5%持续2分钟

### 📧 **告警通知配置**
```yaml
# 在 monitoring/prometheus/alertmanager.yml 中配置
# 支持邮件、钉钉、企业微信等通知方式
```

## 🛠️ 高级配置

### 📝 **自定义指标**
在你的应用中添加更多业务指标：

```typescript
// NestJS应用中添加自定义指标
this.metricsService.recordCustomMetric('user_registrations', 1);
this.metricsService.recordCustomMetric('article_views', articleId);
```

### 🔧 **性能调优建议**
1. **指标收集频率**: 根据需要调整收集间隔
2. **数据保留**: 配置合适的数据保留策略
3. **查询优化**: 使用高效的PromQL查询
4. **告警阈值**: 根据实际情况调整告警阈值

## 🗂️ 文件结构

```
monitoring/
├── prometheus/
│   ├── prometheus.yml          # Prometheus主配置
│   └── alert_rules.yml         # 告警规则配置
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/        # 数据源配置
│   │   └── dashboards/         # 仪表盘配置
│   └── dashboards/
│       └── blog-system-overview.json  # 主仪表盘
└── docker-compose.yml          # 更新了监控服务
```

## 🔍 故障排查

### 🚫 **常见问题**

1. **服务无法启动**
```bash
# 检查端口占用
sudo lsof -i :9090
sudo lsof -i :3003

# 查看服务日志
docker-compose logs prometheus
docker-compose logs grafana
```

2. **指标收集失败**
```bash
# 验证指标端点
curl http://localhost:3001/api/metrics
curl http://localhost:3000/api/metrics

# 检查Prometheus targets
# 访问 http://localhost:9090/targets
```

3. **Grafana无法连接数据源**
```bash
# 检查网络连通性
docker-compose exec grafana ping prometheus
```

### 📊 **性能监控最佳实践**

1. **监控关键路径**: 重点监控用户关键操作
2. **设置合理阈值**: 避免过多误报
3. **定期回顾**: 根据实际情况调整监控策略
4. **文档更新**: 保持监控文档最新

## 🎉 监控效果展示

启动监控系统后，你将获得：

✅ **实时性能监控** - 了解系统当前状态  
✅ **历史趋势分析** - 发现性能趋势和模式  
✅ **智能告警通知** - 第一时间发现问题  
✅ **业务指标洞察** - 了解用户行为和系统使用情况  
✅ **容量规划支持** - 基于数据做出技术决策  

## 🚀 下一步扩展

- **日志聚合**: 集成ELK Stack
- **链路追踪**: 添加Jaeger分布式追踪
- **用户体验监控**: 前端性能监控
- **安全监控**: 安全事件检测
- **自动化运维**: 基于监控数据的自动扩缩容

---

**🎯 现在你的博客系统已经具备了企业级的监控能力！** 