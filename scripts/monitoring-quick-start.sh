#!/bin/bash

# 监控系统快速演示脚本
echo "🎬 开始监控系统演示..."

echo ""
echo "📊 步骤1：检查监控服务状态"
echo "================================="
docker-compose ps prometheus grafana node-exporter postgres-exporter

echo ""
echo "🔍 步骤2：测试应用指标端点"
echo "================================="
echo "正在测试 NestJS 指标端点..."
if curl -s http://localhost:3000/api/metrics > /dev/null; then
    echo "✅ NestJS metrics: http://localhost:3000/api/metrics"
    echo "📊 示例指标："
    curl -s http://localhost:3000/api/metrics | head -5
else
    echo "❌ NestJS 服务未运行或指标端点不可用"
fi

echo ""
echo "正在测试 Next.js 指标端点..."
if curl -s http://localhost:3000/api/metrics > /dev/null; then
    echo "✅ Next.js metrics: http://localhost:3000/api/metrics"
    echo "📊 示例指标："
    curl -s http://localhost:3000/api/metrics | head -5
else
    echo "❌ Next.js 服务未运行或指标端点不可用"
fi

echo ""
echo "🏥 步骤3：测试健康检查"
echo "================================="
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ 健康检查端点正常"
    echo "📋 健康状态："
    curl -s http://localhost:3000/api/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3000/api/health
else
    echo "❌ 健康检查端点不可用"
fi

echo ""
echo "📈 步骤4：生成一些测试流量"
echo "================================="
echo "正在生成测试HTTP请求..."
for i in {1..10}; do
    curl -s http://localhost:3000/ > /dev/null &
    curl -s http://localhost:3000/api/health > /dev/null &
    sleep 0.1
done
wait
echo "✅ 已生成10个测试请求"

echo ""
echo "🎯 步骤5：验证Prometheus数据收集"
echo "================================="
if curl -s "http://localhost:9090/api/v1/query?query=up" > /dev/null; then
    echo "✅ Prometheus正在运行"
    echo "📊 服务状态查询结果："
    curl -s "http://localhost:9090/api/v1/query?query=up" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for result in data['data']['result']:
        metric = result['metric']
        value = result['value'][1]
        job = metric.get('job', 'unknown')
        instance = metric.get('instance', 'unknown')
        print(f'  📍 {job} ({instance}): {\"✅ UP\" if value == \"1\" else \"❌ DOWN\"}')
except:
    pass
    " 2>/dev/null || echo "  ⚠️  无法解析JSON，但Prometheus正在运行"
else
    echo "❌ Prometheus不可访问"
fi

echo ""
echo "🎨 步骤6：访问链接指南"
echo "================================="
echo "🚀 现在你可以访问以下地址："
echo ""
echo "📊 Prometheus (指标查询):"
echo "   http://localhost:9090"
echo "   💡 试试查询: up"
echo ""
echo "📈 Grafana (可视化仪表盘):"
echo "   http://localhost:3003"
echo "   👤 用户名: admin"
echo "   🔑 密码: admin123"
echo ""
echo "🔧 系统指标:"
echo "   Node Exporter: http://localhost:9100/metrics"
echo "   Postgres Exporter: http://localhost:9187/metrics"
echo ""
echo "🌐 应用指标:"
echo "   NestJS: http://localhost:3000/api/metrics"
echo "   Next.js: http://localhost:3000/api/metrics"
echo "   健康检查: http://localhost:3000/api/health"

echo ""
echo "🎯 下一步操作建议："
echo "================================="
echo "1️⃣  打开 Grafana (http://localhost:3003)"
echo "2️⃣  使用 admin/admin123 登录"
echo "3️⃣  查看预设的博客系统仪表盘"
echo "4️⃣  在 Prometheus (http://localhost:9090) 尝试查询 'up'"
echo "5️⃣  访问你的博客网站，然后回到监控界面观察数据变化"

echo ""
echo "📚 详细使用指南请查看: MONITORING-USAGE-GUIDE.md"
echo ""
echo "�� 监控系统演示完成！开始探索吧！" 