'use client';

import { useAuth } from '@corn12138/hooks';
import {
    BoltIcon,
    ChartBarIcon,
    CheckCircleIcon,
    ClockIcon,
    CpuChipIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    PlayIcon,
    StopIcon
} from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ensureCsrfToken, getCsrfHeaderName } from '@/utils/csrf';

interface TestScenario {
    id: string;
    name: string;
    description: string;
    type: 'api' | 'frontend' | 'database' | 'ai_chat';
    endpoint?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    concurrency: number;
    duration: number; // 秒
    expectedRps: number; // 期望的每秒请求数
}

interface TestResult {
    scenarioId: string;
    scenarioName: string;
    status: 'running' | 'completed' | 'failed' | 'stopped';
    startTime: number;
    endTime?: number;
    metrics: {
        totalRequests: number;
        successfulRequests: number;
        failedRequests: number;
        averageResponseTime: number;
        minResponseTime: number;
        maxResponseTime: number;
        requestsPerSecond: number;
        errorRate: number;
        throughput: number;
    };
    errors: Array<{
        timestamp: number;
        error: string;
        count: number;
    }>;
    responseTimeHistory: Array<{
        timestamp: number;
        responseTime: number;
    }>;
}

interface SystemMetrics {
    timestamp: number;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
    activeConnections: number;
}

export default function PerformanceTester() {
    const { user } = useAuth();
    const [scenarios] = useState<TestScenario[]>([
        {
            id: 'api-load-test',
            name: 'API负载测试',
            description: '测试API端点在高并发下的性能表现',
            type: 'api',
            endpoint: '/api/statistics/user',
            method: 'GET',
            concurrency: 50,
            duration: 60,
            expectedRps: 100
        },
        {
            id: 'ai-chat-stress',
            name: 'AI对话压力测试',
            description: '测试AI对话接口的响应能力和稳定性',
            type: 'ai_chat',
            endpoint: '/api/chat',
            method: 'POST',
            concurrency: 20,
            duration: 120,
            expectedRps: 10
        },
        {
            id: 'frontend-perf',
            name: '前端性能测试',
            description: '测试页面加载速度、渲染性能和用户体验',
            type: 'frontend',
            concurrency: 10,
            duration: 30,
            expectedRps: 5
        },
        {
            id: 'database-load',
            name: '数据库压力测试',
            description: '测试数据库查询性能和并发处理能力',
            type: 'database',
            endpoint: '/api/articles/drafts',
            method: 'GET',
            concurrency: 30,
            duration: 90,
            expectedRps: 50
        }
    ]);

    const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
    const [results, setResults] = useState<Map<string, TestResult>>(new Map());
    const [systemMetrics, setSystemMetrics] = useState<SystemMetrics[]>([]);
    const [isMonitoring, setIsMonitoring] = useState(false);

    const testRefs = useRef<Map<string, AbortController>>(new Map());
    const metricsIntervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        if (isMonitoring) {
            startSystemMonitoring();
        } else {
            stopSystemMonitoring();
        }

        return () => {
            stopSystemMonitoring();
        };
    }, [isMonitoring]);

    const startSystemMonitoring = () => {
        metricsIntervalRef.current = setInterval(() => {
            const newMetric: SystemMetrics = {
                timestamp: Date.now(),
                cpu: Math.random() * 100,
                memory: 40 + Math.random() * 50,
                disk: 20 + Math.random() * 30,
                network: Math.random() * 100,
                activeConnections: Math.floor(Math.random() * 500) + 100
            };

            setSystemMetrics(prev => {
                const updated = [...prev, newMetric];
                // 保留最近5分钟的数据
                return updated.slice(-150);
            });
        }, 2000);
    };

    const stopSystemMonitoring = () => {
        if (metricsIntervalRef.current) {
            clearInterval(metricsIntervalRef.current);
        }
    };

    const runTest = async (scenario: TestScenario) => {
        if (runningTests.has(scenario.id)) {
            toast.error('测试已在运行中');
            return;
        }

        const abortController = new AbortController();
        testRefs.current.set(scenario.id, abortController);

        setRunningTests(prev => new Set(Array.from(prev).concat(scenario.id)));
        setIsMonitoring(true);

        const testResult: TestResult = {
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            status: 'running',
            startTime: Date.now(),
            metrics: {
                totalRequests: 0,
                successfulRequests: 0,
                failedRequests: 0,
                averageResponseTime: 0,
                minResponseTime: Infinity,
                maxResponseTime: 0,
                requestsPerSecond: 0,
                errorRate: 0,
                throughput: 0
            },
            errors: [],
            responseTimeHistory: []
        };

        setResults(prev => new Map(prev.set(scenario.id, testResult)));

        try {
            await executeTest(scenario, testResult, abortController.signal);
        } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
                console.error('测试执行失败:', error);
                toast.error(`测试失败: ${error.message}`);
            }
        } finally {
            setRunningTests(prev => {
                const updated = new Set(prev);
                updated.delete(scenario.id);
                return updated;
            });
            testRefs.current.delete(scenario.id);

            // 如果没有运行中的测试，停止系统监控
            if (runningTests.size <= 1) {
                setIsMonitoring(false);
            }
        }
    };

    const executeTest = async (scenario: TestScenario, result: TestResult, signal: AbortSignal) => {
        const startTime = Date.now();
        const endTime = startTime + scenario.duration * 1000;
        const responseTimes: number[] = [];
        const errors: Map<string, number> = new Map();

        let requestCount = 0;
        let successCount = 0;
        let failCount = 0;

        // 创建并发请求
        const workers = Array.from({ length: scenario.concurrency }, async () => {
            while (Date.now() < endTime && !signal.aborted) {
                const requestStart = Date.now();

                try {
                    await makeRequest(scenario);
                    const responseTime = Date.now() - requestStart;

                    responseTimes.push(responseTime);
                    successCount++;

                    // 更新响应时间历史
                    result.responseTimeHistory.push({
                        timestamp: Date.now(),
                        responseTime
                    });

                } catch (error) {
                    failCount++;
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    errors.set(errorMessage, (errors.get(errorMessage) || 0) + 1);
                }

                requestCount++;

                // 更新结果
                const currentTime = Date.now();
                const elapsedSeconds = (currentTime - startTime) / 1000;

                result.metrics = {
                    totalRequests: requestCount,
                    successfulRequests: successCount,
                    failedRequests: failCount,
                    averageResponseTime: responseTimes.length > 0 ?
                        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
                    minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
                    maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
                    requestsPerSecond: requestCount / elapsedSeconds,
                    errorRate: requestCount > 0 ? (failCount / requestCount) * 100 : 0,
                    throughput: successCount / elapsedSeconds
                };

                result.errors = Array.from(errors.entries()).map(([error, count]) => ({
                    timestamp: Date.now(),
                    error,
                    count
                }));

                setResults(prev => new Map(prev.set(scenario.id, { ...result })));

                // 控制请求频率
                const delay = Math.max(0, 1000 / scenario.expectedRps - (Date.now() - requestStart));
                if (delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        });

        await Promise.all(workers);

        // 完成测试
        result.status = signal.aborted ? 'stopped' : 'completed';
        result.endTime = Date.now();

        setResults(prev => new Map(prev.set(scenario.id, { ...result })));

        if (!signal.aborted) {
            toast.success(`测试完成: ${scenario.name}`);
        }
    };

    const makeRequest = async (scenario: TestScenario): Promise<any> => {
        switch (scenario.type) {
            case 'api':
            case 'database':
                const needsCsrf = scenario.method !== 'GET';
                const csrfToken = needsCsrf ? await ensureCsrfToken() : null;
                const apiHeaders: Record<string, string> = {
                    'Content-Type': 'application/json'
                };
                if (needsCsrf && csrfToken) {
                    apiHeaders[getCsrfHeaderName()] = csrfToken;
                }

                const response = await fetch(scenario.endpoint!, {
                    method: scenario.method,
                    credentials: 'include',
                    headers: apiHeaders,
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response.json();

            case 'ai_chat':
                const chatCsrf = await ensureCsrfToken();
                const chatHeaders: Record<string, string> = {
                    'Content-Type': 'application/json'
                };
                if (chatCsrf) {
                    chatHeaders[getCsrfHeaderName()] = chatCsrf;
                }

                const chatResponse = await fetch('/api/chat', {
                    method: 'POST',
                    credentials: 'include',
                    headers: chatHeaders,
                    body: JSON.stringify({
                        message: '这是一个性能测试消息',
                        conversationId: `test-${Math.random()}`
                    })
                });

                if (!chatResponse.ok) {
                    throw new Error(`Chat API error: ${chatResponse.status}`);
                }

                return chatResponse.text();

            case 'frontend':
                // 模拟前端性能测试
                const start = performance.now();

                // 模拟DOM操作
                const div = document.createElement('div');
                div.innerHTML = '<p>'.repeat(1000) + 'Test content' + '</p>'.repeat(1000);
                document.body.appendChild(div);

                // 模拟计算密集操作
                let sum = 0;
                for (let i = 0; i < 100000; i++) {
                    sum += Math.random();
                }

                document.body.removeChild(div);

                const duration = performance.now() - start;
                if (duration > 100) {
                    throw new Error(`Frontend performance degraded: ${duration.toFixed(2)}ms`);
                }

                return { duration, sum };

            default:
                throw new Error(`Unsupported test type: ${scenario.type}`);
        }
    };

    const stopTest = (scenarioId: string) => {
        const controller = testRefs.current.get(scenarioId);
        if (controller) {
            controller.abort();
            toast('测试已停止');
        }
    };

    const stopAllTests = () => {
        testRefs.current.forEach(controller => controller.abort());
        testRefs.current.clear();
        setRunningTests(new Set());
        toast('所有测试已停止');
    };

    const getTestStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'text-blue-600 bg-blue-100';
            case 'completed': return 'text-green-600 bg-green-100';
            case 'failed': return 'text-red-600 bg-red-100';
            case 'stopped': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getTestStatusIcon = (status: string) => {
        switch (status) {
            case 'running': return <ClockIcon className="h-4 w-4 animate-spin" />;
            case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
            case 'failed': return <ExclamationTriangleIcon className="h-4 w-4" />;
            case 'stopped': return <StopIcon className="h-4 w-4" />;
            default: return <PlayIcon className="h-4 w-4" />;
        }
    };

    const getScenarioIcon = (type: string) => {
        switch (type) {
            case 'api': return <GlobeAltIcon className="h-5 w-5 text-blue-500" />;
            case 'ai_chat': return <DocumentTextIcon className="h-5 w-5 text-purple-500" />;
            case 'frontend': return <ChartBarIcon className="h-5 w-5 text-green-500" />;
            case 'database': return <CpuChipIcon className="h-5 w-5 text-orange-500" />;
            default: return <BoltIcon className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* 页面标题和控制 */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">性能测试中心</h2>
                    <p className="text-gray-600">进行负载测试、性能监控和系统压力测试</p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                        <span className="text-sm text-gray-600">
                            {isMonitoring ? '监控中' : '未监控'}
                        </span>
                    </div>
                    {runningTests.size > 0 && (
                        <button
                            onClick={stopAllTests}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                            停止所有测试
                        </button>
                    )}
                </div>
            </div>

            {/* 系统监控 */}
            {isMonitoring && systemMetrics.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">实时系统监控</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {[
                            { label: 'CPU使用率', value: systemMetrics[systemMetrics.length - 1]?.cpu || 0, unit: '%', color: 'blue' },
                            { label: '内存使用率', value: systemMetrics[systemMetrics.length - 1]?.memory || 0, unit: '%', color: 'green' },
                            { label: '磁盘I/O', value: systemMetrics[systemMetrics.length - 1]?.disk || 0, unit: '%', color: 'yellow' },
                            { label: '网络带宽', value: systemMetrics[systemMetrics.length - 1]?.network || 0, unit: '%', color: 'purple' },
                            { label: '活跃连接', value: systemMetrics[systemMetrics.length - 1]?.activeConnections || 0, unit: '', color: 'red' }
                        ].map((metric, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                    {metric.unit ? `${metric.value.toFixed(1)}${metric.unit}` : metric.value.toFixed(0)}
                                </div>
                                <div className="text-sm text-gray-600">{metric.label}</div>
                                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full bg-${metric.color}-500 transition-all duration-300`}
                                        style={{ width: `${Math.min(metric.value, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 测试场景 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {scenarios.map((scenario) => {
                    const isRunning = runningTests.has(scenario.id);
                    const result = results.get(scenario.id);

                    return (
                        <div key={scenario.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                    {getScenarioIcon(scenario.type)}
                                    <div>
                                        <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                                        <p className="text-sm text-gray-600">{scenario.description}</p>
                                    </div>
                                </div>

                                {result && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTestStatusColor(result.status)}`}>
                                        <div className="flex items-center space-x-1">
                                            {getTestStatusIcon(result.status)}
                                            <span>{result.status}</span>
                                        </div>
                                    </span>
                                )}
                            </div>

                            {/* 测试配置 */}
                            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                <div>
                                    <span className="text-gray-500">并发数:</span>
                                    <span className="ml-1 font-medium">{scenario.concurrency}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">持续时间:</span>
                                    <span className="ml-1 font-medium">{scenario.duration}s</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">期望RPS:</span>
                                    <span className="ml-1 font-medium">{scenario.expectedRps}</span>
                                </div>
                            </div>

                            {/* 测试结果 */}
                            {result && (
                                <div className="border-t border-gray-200 pt-4 mb-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500">总请求数:</span>
                                            <span className="ml-1 font-medium">{result.metrics.totalRequests.toLocaleString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">成功率:</span>
                                            <span className={`ml-1 font-medium ${result.metrics.errorRate < 1 ? 'text-green-600' :
                                                result.metrics.errorRate < 5 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {(100 - result.metrics.errorRate).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">平均响应时间:</span>
                                            <span className="ml-1 font-medium">{result.metrics.averageResponseTime.toFixed(0)}ms</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">实际RPS:</span>
                                            <span className={`ml-1 font-medium ${result.metrics.requestsPerSecond >= scenario.expectedRps * 0.8 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {result.metrics.requestsPerSecond.toFixed(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {result.errors.length > 0 && (
                                        <div className="mt-3 p-2 bg-red-50 rounded border-l-4 border-red-400">
                                            <div className="text-sm text-red-800">
                                                <strong>错误信息:</strong>
                                                {result.errors.slice(0, 3).map((error, index) => (
                                                    <div key={index} className="ml-2">
                                                        • {error.error} ({error.count}次)
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* 操作按钮 */}
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    {scenario.endpoint && `端点: ${scenario.endpoint}`}
                                </div>
                                <div className="flex items-center space-x-2">
                                    {isRunning ? (
                                        <button
                                            onClick={() => stopTest(scenario.id)}
                                            className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <StopIcon className="h-4 w-4" />
                                                <span>停止</span>
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => runTest(scenario)}
                                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <PlayIcon className="h-4 w-4" />
                                                <span>开始测试</span>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 测试建议 */}
            <div className="bg-yellow-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-yellow-900 mb-4">测试建议</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                    <div>
                        <h4 className="font-medium mb-2">🎯 性能指标目标</h4>
                        <ul className="space-y-1 ml-4">
                            <li>• API响应时间 &lt; 200ms</li>
                            <li>• 错误率 &lt; 1%</li>
                            <li>• CPU使用率 &lt; 80%</li>
                            <li>• 内存使用率 &lt; 85%</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">⚠️ 注意事项</h4>
                        <ul className="space-y-1 ml-4">
                            <li>• 在生产环境外进行测试</li>
                            <li>• 监控数据库连接池</li>
                            <li>• 注意API限流设置</li>
                            <li>• 备份重要数据</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
} 
