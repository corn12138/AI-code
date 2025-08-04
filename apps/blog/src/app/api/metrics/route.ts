import { NextRequest, NextResponse } from 'next/server';

// 简单的内存指标存储
let requestCount = 0;
let responseTimeHistogram: number[] = [];
let lastRequestTime = Date.now();

// 增加请求计数
export async function GET(request: NextRequest) {
    try {
        requestCount++;
        const currentTime = Date.now();
        const responseTime = currentTime - lastRequestTime;
        responseTimeHistogram.push(responseTime);

        // 保持最近1000个响应时间记录
        if (responseTimeHistogram.length > 1000) {
            responseTimeHistogram = responseTimeHistogram.slice(-1000);
        }

        lastRequestTime = currentTime;

        // 计算统计信息
        const avgResponseTime = responseTimeHistogram.length > 0
            ? responseTimeHistogram.reduce((a, b) => a + b, 0) / responseTimeHistogram.length
            : 0;

        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();

        // 生成Prometheus格式的指标
        const metrics = `
# HELP nextjs_http_requests_total Total number of HTTP requests
# TYPE nextjs_http_requests_total counter
nextjs_http_requests_total ${requestCount}

# HELP nextjs_http_response_time_seconds Average HTTP response time in seconds
# TYPE nextjs_http_response_time_seconds gauge
nextjs_http_response_time_seconds ${avgResponseTime / 1000}

# HELP nextjs_process_uptime_seconds Process uptime in seconds
# TYPE nextjs_process_uptime_seconds gauge
nextjs_process_uptime_seconds ${uptime}

# HELP nextjs_memory_usage_bytes Memory usage in bytes
# TYPE nextjs_memory_usage_bytes gauge
nextjs_memory_usage_bytes{type="rss"} ${memoryUsage.rss}
nextjs_memory_usage_bytes{type="heapTotal"} ${memoryUsage.heapTotal}
nextjs_memory_usage_bytes{type="heapUsed"} ${memoryUsage.heapUsed}
nextjs_memory_usage_bytes{type="external"} ${memoryUsage.external}

# HELP nextjs_version_info Version information
# TYPE nextjs_version_info gauge
nextjs_version_info{version="${process.version}"} 1
`.trim();

        return new NextResponse(metrics, {
            headers: {
                'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
            },
        });

    } catch (error) {
        console.error('Error generating metrics:', error);
        return NextResponse.json(
            { error: 'Failed to generate metrics' },
            { status: 500 }
        );
    }
} 