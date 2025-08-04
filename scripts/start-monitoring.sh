#!/bin/bash

# 博客系统 Prometheus + Grafana 监控启动脚本
echo "🚀 启动博客系统监控..."

# 创建必要的目录
echo "📁 创建监控目录..."
mkdir -p monitoring/prometheus
mkdir -p monitoring/grafana/provisioning/datasources
mkdir -p monitoring/grafana/provisioning/dashboards
mkdir -p monitoring/grafana/dashboards

# 检查 Docker 是否运行
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 docker-compose 是否可用
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未找到，请安装 docker-compose"
    exit 1
fi

# 拉取所需镜像
echo "📦 拉取监控镜像..."
docker-compose pull prometheus grafana node-exporter postgres-exporter

# 启动监控服务
echo "🔧 启动监控服务..."
docker-compose up -d prometheus grafana node-exporter postgres-exporter

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
services=("prometheus" "grafana" "node-exporter" "postgres-exporter")

for service in "${services[@]}"; do
    if docker-compose ps $service | grep -q "Up"; then
        echo "✅ $service 运行正常"
    else
        echo "❌ $service 启动失败"
        docker-compose logs $service | tail -10
    fi
done

# 显示访问信息
echo ""
echo "🎉 监控系统启动完成！"
echo ""
echo "📊 监控访问地址："
echo "  - Prometheus: http://localhost:9090"
echo "  - Grafana: http://localhost:3003"
echo "    用户名: admin"
echo "    密码: admin123"
echo "  - Node Exporter: http://localhost:9100"
echo "  - Postgres Exporter: http://localhost:9187"
echo ""
echo "🎯 应用指标端点："
echo "  - NestJS Server: http://localhost:3001/api/metrics"
echo "  - Next.js Blog: http://localhost:3000/api/metrics"
echo "  - Health Check: http://localhost:3001/api/health"
echo ""
echo "📈 快速验证："
echo "  curl http://localhost:9090/api/v1/query?query=up"
echo "  curl http://localhost:3001/api/metrics"
echo ""
echo "💡 提示："
echo "  - 首次访问 Grafana 时请导入预设仪表盘"
echo "  - 默认仪表盘位于: monitoring/grafana/dashboards/"
echo "  - 查看日志: docker-compose logs -f [service-name]"
echo "" 